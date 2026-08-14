/**
 * A plucked string, synthesised rather than sampled — Karplus-Strong: excite a
 * short buffer with noise, then feed it back through a two-tap average, which
 * low-passes a little more on every pass the way a real string loses its high
 * partials. No audio files, and nothing plays until someone asks for it.
 */

import { audioContext, resumeAudio } from "./audioContext";

export interface ViolinString {
  readonly name: string;
  readonly label: string;
  readonly frequency: number;
}

/** Standard violin tuning, low to high. */
export const violinStrings: readonly ViolinString[] = [
  { name: "G", label: "G3", frequency: 196.0 },
  { name: "D", label: "D4", frequency: 293.66 },
  { name: "A", label: "A4", frequency: 440.0 },
  { name: "E", label: "E5", frequency: 659.25 },
];

function renderString(ctx: AudioContext, frequency: number, seconds: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const total = Math.floor(rate * seconds);
  const period = Math.max(2, Math.round(rate / frequency));

  const buffer = ctx.createBuffer(1, total, rate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < period; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  // Longer strings ring longer, which is why the decay tracks the period.
  const decay = 0.9965 + Math.min(0.0025, period / 400000);
  for (let i = period; i < total; i += 1) {
    data[i] = decay * 0.5 * (data[i - period] + data[i - period + 1]);
  }

  // Soften the very start so the excitation does not read as a click.
  const attack = Math.floor(rate * 0.004);
  for (let i = 0; i < attack; i += 1) {
    data[i] *= i / attack;
  }

  return buffer;
}

export function pluck(frequency: number, seconds = 2.6): void {
  const ctx = audioContext();
  if (!ctx) return;
  resumeAudio(ctx);

  const source = ctx.createBufferSource();
  source.buffer = renderString(ctx, frequency, seconds);

  const body = ctx.createBiquadFilter();
  body.type = "lowpass";
  body.frequency.value = 4200;
  body.Q.value = 0.6;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.28, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

  source.connect(body).connect(gain).connect(ctx.destination);
  source.start(now);
  source.stop(now + seconds);
  source.onended = () => {
    source.disconnect();
    body.disconnect();
    gain.disconnect();
  };
}
