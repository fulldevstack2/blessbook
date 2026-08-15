/**
 * The shape of forty seconds of Dennis playing, measured off the recording.
 *
 *     node tools/waveform.mjs
 *
 * Reads `public/audio/the-journey-live.mp3` — The Journey, played live on the
 * Phoenix at the 2016 concert — and writes `src/content/waveform.ts`: one peak
 * per bucket, normalised to the loudest moment in the take.
 *
 * The Nocturne page builds a form out of these numbers and travels through it,
 * so they have to be the real ones. A generated curve would look near enough
 * and be a lie about the one thing this site refuses to lie about, which is
 * whether he can actually play. Checked in as source rather than decoded in the
 * browser: it is 900 floats, it never changes, and decoding a 40-second MP3 on
 * the main thread to draw a background is not a trade worth making.
 *
 * Rerun it if the phrase in `livePhrase` is ever replaced.
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const SOURCE = "public/audio/the-journey-live.mp3";
const OUT = "src/content/waveform.ts";
/** Enough to hold individual bow strokes; small enough to read as one line. */
const BUCKETS = 900;
const RATE = 8000;

const raw = execFileSync(
  "ffmpeg",
  ["-v", "error", "-i", SOURCE, "-f", "f32le", "-ac", "1", "-ar", String(RATE), "-"],
  { maxBuffer: 1 << 28 },
);

const samples = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4));
const per = samples.length / BUCKETS;

/* Peak per bucket rather than RMS: a bow attack is the loudest single sample in
   its window and averaging is exactly what flattens it away. */
const peaks = new Array(BUCKETS);
for (let i = 0; i < BUCKETS; i += 1) {
  const from = Math.floor(i * per);
  const to = Math.min(samples.length, Math.floor((i + 1) * per));
  let peak = 0;
  for (let s = from; s < to; s += 1) {
    const value = samples[s] < 0 ? -samples[s] : samples[s];
    if (value > peak) peak = value;
  }
  peaks[i] = peak;
}

const loudest = Math.max(...peaks) || 1;
const scaled = peaks.map((p) => Number((p / loudest).toFixed(3)));

const seconds = samples.length / RATE;
const rows = [];
for (let i = 0; i < scaled.length; i += 12) {
  rows.push("  " + scaled.slice(i, i + 12).join(", ") + ",");
}

writeFileSync(
  OUT,
  `/**
 * Forty seconds of The Journey, played live on the Phoenix at the 2016 concert,
 * measured off the recording itself: one peak per bucket, 0 → 1 against the
 * loudest moment in the take.
 *
 * GENERATED — do not hand-edit. Run \`node tools/waveform.mjs\` and see the note
 * at the top of that file for why this is source rather than decoded on load.
 */

/** Seconds of audio these cover, for anything that wants a timecode. */
export const waveformSeconds = ${seconds.toFixed(2)};

export const waveform: readonly number[] = [
${rows.join("\n")}
];
`,
);

console.log(
  `${OUT}: ${scaled.length} peaks over ${seconds.toFixed(1)}s, loudest raw sample ${loudest.toFixed(3)}`,
);
