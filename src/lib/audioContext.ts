/**
 * One AudioContext for the whole site. The plucked strings and the commission
 * reel both make sound, and a browser will happily hand out a second context
 * and then run out of them — so they share this one, created on the first user
 * gesture because autoplay policy forbids anything earlier.
 */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

let shared: AudioContext | null = null;

/** Null when the browser has no Web Audio at all; callers degrade quietly. */
export function audioContext(): AudioContext | null {
  if (shared) return shared;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return null;
  shared = new Ctor();
  return shared;
}

/** Safari and Chrome both start the context suspended until a gesture resumes it. */
export function resumeAudio(ctx: AudioContext): void {
  if (ctx.state === "suspended") void ctx.resume();
}
