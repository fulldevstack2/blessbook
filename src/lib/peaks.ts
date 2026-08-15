/**
 * The real shape of a recording.
 *
 * A player's track has to be the sound it is playing, or it is a decoration
 * pretending to be information. This fetches the file, decodes it and reduces it
 * to N amplitude buckets — so what a concept draws is the waveform of the take,
 * not a pattern that looks vaguely musical.
 *
 * Decoding happens in an OfflineAudioContext, which needs no user gesture and
 * raises no autoplay warning; the shared playback context is left alone. Each
 * URL is decoded once for the life of the page and shared by every caller.
 */

const cache = new Map<string, Promise<Float32Array | null>>();

/** Peak per bucket, normalised so the loudest moment reaches 1. */
async function measure(url: string, buckets: number): Promise<Float32Array | null> {
  try {
    const Offline = window.OfflineAudioContext ?? window.webkitOfflineAudioContext;
    if (!Offline) return null;

    const response = await fetch(url);
    if (!response.ok) return null;
    const encoded = await response.arrayBuffer();

    const ctx = new Offline(1, 1, 44100);
    const audio = await ctx.decodeAudioData(encoded);
    const samples = audio.getChannelData(0);
    const per = Math.floor(samples.length / buckets);
    if (per < 1) return null;

    const out = new Float32Array(buckets);
    let loudest = 0;

    for (let bucket = 0; bucket < buckets; bucket += 1) {
      const start = bucket * per;
      let peak = 0;
      // Every sample in the bucket, not a stride: a stride misses transients and
      // a violin's attack is exactly what you want to see.
      for (let i = start; i < start + per; i += 1) {
        const value = samples[i];
        if (value === undefined) break;
        const magnitude = value < 0 ? -value : value;
        if (magnitude > peak) peak = magnitude;
      }
      out[bucket] = peak;
      if (peak > loudest) loudest = peak;
    }

    if (loudest <= 0) return null;
    // A gentle curve, not a raw scale: the quiet half of a live take is where
    // the phrasing is, and a linear plot buries it under the loud half.
    for (let i = 0; i < buckets; i += 1) {
      out[i] = Math.pow((out[i] as number) / loudest, 0.72);
    }
    return out;
  } catch {
    return null;
  }
}

/** Cached amplitude envelope for a media file, or null if it cannot be read. */
export function peaks(url: string, buckets = 420): Promise<Float32Array | null> {
  const key = `${url}#${buckets}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const started = measure(url, buckets);
  cache.set(key, started);
  return started;
}

declare global {
  interface Window {
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
  }
}
