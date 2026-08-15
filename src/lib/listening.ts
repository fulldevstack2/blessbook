/**
 * One analyser bus for the whole site.
 *
 * Every hero on this site is drawn by Dennis playing rather than by a timer:
 * the gold seam, the ink and the silk all move because a violin is moving them.
 * That only works if there is a single place that knows what is sounding right
 * now, because a media element gets exactly one Web Audio source node for its
 * lifetime and asking twice throws.
 *
 * Consumers either read `level()` once per frame (scenes) or pull the waveform
 * (the reel's scope). Nothing here starts sound; sound only ever happens
 * because someone asked for it.
 */

import { audioContext, resumeAudio } from "./audioContext";

interface Tap {
  readonly element: HTMLMediaElement;
  readonly analyser: AnalyserNode;
  /** Typed to a plain ArrayBuffer because that is what the analyser fills. */
  readonly samples: Float32Array<ArrayBuffer>;
}

const taps = new WeakMap<HTMLMediaElement, Tap>();
/** Iterable, unlike the WeakMap: needed to hush everything else on play. */
const attached = new Set<HTMLMediaElement>();

/** What each element is, so a player can say what it is playing. */
export interface Sounding {
  readonly element: HTMLMediaElement;
  readonly title: string;
  readonly where?: string | undefined;
}

const labels = new WeakMap<HTMLMediaElement, { title: string; where?: string }>();
const watchers = new Set<() => void>();

function announce() {
  for (const watcher of watchers) watcher();
}

/** Whatever is sounding right now, with enough about it to name it. */
export function sounding_(): Sounding | null {
  for (const element of attached) {
    if (!element.paused && !element.ended) {
      const label = labels.get(element);
      return { element, title: label?.title ?? "Now playing", where: label?.where };
    }
  }
  return null;
}

/** Told whenever anything starts or stops. */
export function watch(callback: () => void): () => void {
  watchers.add(callback);
  return () => watchers.delete(callback);
}
/** The last element to start playing — what "now" means for the visuals. */
let front: Tap | null = null;

/** One fader for the whole site, so a volume control has something to hold. */
let master: GainNode | null = null;
const VOLUME_KEY = "blesspoke:volume";
let level_ = readStoredVolume();

function readStoredVolume(): number {
  try {
    const stored = Number(window.localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(stored) && stored >= 0 && stored <= 1 ? stored : 0.8;
  } catch {
    return 0.8;
  }
}

function bus(ctx: AudioContext): GainNode {
  if (!master) {
    master = ctx.createGain();
    master.gain.value = level_;
    master.connect(ctx.destination);
  }
  return master;
}

/** 0 → 1, remembered between visits. */
export function volume(): number {
  return level_;
}

export function setVolume(next: number): void {
  level_ = Math.min(1, Math.max(0, next));
  if (master) master.gain.value = level_;
  // Elements that never made it onto the bus still need to obey.
  for (const element of attached) element.volume = level_;
  try {
    window.localStorage.setItem(VOLUME_KEY, String(level_));
  } catch {
    /* private mode: the setting simply does not persist */
  }
}

/**
 * Start one thing and stop everything else. A hero phrase left playing under a
 * showreel is the sort of detail that makes a site feel unfinished, and there is
 * only one player on this site anyway.
 */
export function play(
  element: HTMLMediaElement,
  label?: { title: string; where?: string },
): void {
  for (const other of attached) {
    if (other !== element && !other.paused) other.pause();
  }
  if (label) labels.set(element, label);
  listen(element);
  void element.play().catch(() => undefined);
  announce();
}

export function pauseAll(): void {
  for (const element of attached) if (!element.paused) element.pause();
  announce();
}

/** Cached so twenty consumers in one frame cost one analyser read. */
let cachedLevel = 0;
let cachedAt = -1;
/** Decays rather than cutting, so a scene settles when the music stops. */
let smoothed = 0;

/**
 * Route an element through the shared context. Safe to call repeatedly; the
 * second call only marks the element as the one in front.
 */
export function listen(element: HTMLMediaElement): void {
  if (!attached.has(element)) {
    attached.add(element);
    // One set of listeners per element, so anything watching hears every change.
    element.addEventListener("play", announce);
    element.addEventListener("pause", announce);
    element.addEventListener("ended", announce);
  }
  element.volume = level_;

  const existing = taps.get(element);
  if (existing) {
    front = existing;
    return;
  }

  const ctx = audioContext();
  if (!ctx) return; // no Web Audio: playback still works, the visuals just rest
  resumeAudio(ctx);

  let source: MediaElementAudioSourceNode;
  try {
    source = ctx.createMediaElementSource(element);
  } catch {
    return; // already routed elsewhere; leave it alone rather than break audio
  }

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.6;
  source.connect(analyser).connect(bus(ctx));

  const tap: Tap = { element, analyser, samples: new Float32Array(analyser.fftSize) };
  taps.set(element, tap);
  front = tap;
}

/** True while the element in front is actually sounding. */
export function sounding(): boolean {
  return front !== null && !front.element.paused && !front.element.ended;
}

/**
 * Peak amplitude of what is playing, 0 → 1, smoothed and decaying. Read once
 * per animation frame; repeat calls inside the same frame are free.
 */
export function level(): number {
  const now = performance.now();
  if (now - cachedAt < 8) return cachedLevel;
  cachedAt = now;

  let peak = 0;
  if (front && !front.element.paused) {
    front.analyser.getFloatTimeDomainData(front.samples);
    for (let i = 0; i < front.samples.length; i += 1) {
      const value = Math.abs(front.samples[i] as number);
      if (value > peak) peak = value;
    }
  }

  // Rises quickly, falls slowly: an attack should read, a release should breathe.
  smoothed = peak > smoothed ? smoothed + (peak - smoothed) * 0.45 : smoothed * 0.92;
  cachedLevel = Math.min(1, smoothed);
  return cachedLevel;
}

/**
 * Fills `into` with the current waveform and reports whether it is live. When
 * nothing is playing the buffer is left untouched so callers can decay their own
 * trail instead of drawing a hard zero.
 */
export function waveform(into: Float32Array<ArrayBuffer>): boolean {
  if (!front || front.element.paused) return false;
  front.analyser.getFloatTimeDomainData(into);
  return true;
}
