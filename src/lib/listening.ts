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
/** The last element to start playing — what "now" means for the visuals. */
let front: Tap | null = null;

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
  source.connect(analyser).connect(ctx.destination);

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
