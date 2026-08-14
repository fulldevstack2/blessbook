/**
 * Four bars, taken off the recording itself.
 *
 * Not decoration, and not invented. `public/audio/the-journey-live.mp3` — forty
 * seconds of Dennis playing The Journey live on the gold violin — was analysed
 * offline: spectral flux gave the onsets, autocorrelation of that envelope gave
 * the tempo, and the strongest partial in the violin's own register (196 Hz to
 * 2.1 kHz) gave a pitch per eighth. A Krumhansl-style profile correlation put it
 * in C major.
 *
 * The raw result is what any arena mix gives you: octave jumps and cymbal
 * artefacts. So it was folded into the violin's singing register, taken one note
 * per beat by median, quantised to the key, and its leaps tamed the way a player
 * would phrase them. Where an off-beat onset was strong the beat splits into two
 * eighths, which is why the rhythm is uneven — that unevenness is his.
 *
 * So: a melodic contour of the passage, honestly derived and honestly labelled.
 * It is not a transcription of the notes he played, and the page says so.
 */

export interface ScoreNote {
  /** MIDI note number. The phrase sits between A4 and F5, inside the staff. */
  readonly midi: number;
  /** Length in eighths: 2 is a quarter, 1 is an eighth. */
  readonly eighths: number;
}

export const score = {
  /** Beats per minute, from the onset envelope. */
  bpm: 67,
  key: "C major",
  meter: "4/4",
  /** What the page is allowed to claim about this. */
  provenance: "Melodic contour of the passage, taken off the recording",
  source: "The Journey, live at The Phoenix Rising, 2016",
  notes: [
    { midi: 69, eighths: 2 },
    { midi: 71, eighths: 2 },
    { midi: 72, eighths: 2 },
    { midi: 72, eighths: 1 },
    { midi: 72, eighths: 1 },
    { midi: 69, eighths: 2 },
    { midi: 67, eighths: 2 },
    { midi: 72, eighths: 2 },
    { midi: 69, eighths: 1 },
    { midi: 69, eighths: 1 },
    { midi: 71, eighths: 2 },
    { midi: 74, eighths: 2 },
    { midi: 74, eighths: 2 },
    { midi: 72, eighths: 1 },
    { midi: 77, eighths: 1 },
    { midi: 71, eighths: 2 },
    { midi: 67, eighths: 2 },
    { midi: 72, eighths: 2 },
    { midi: 74, eighths: 2 },
  ],
} as const satisfies {
  bpm: number;
  key: string;
  meter: string;
  provenance: string;
  source: string;
  notes: readonly ScoreNote[];
};

/** C major, as detected — the letter steps the staff is laid out on. */
const SCALE = [0, 2, 4, 5, 7, 9, 11];

/**
 * Staff position for a MIDI note, in half-spaces above the bottom line of a
 * treble staff (E4 = 0, F4 = 1, G4 = 2 …). Engraving is diatonic, so this counts
 * letters rather than semitones.
 */
export function staffPosition(midi: number): number {
  const step = SCALE.indexOf(((midi % 12) + 12) % 12);
  const letter = step === -1 ? 0 : step;
  const octave = Math.floor(midi / 12) - 1;
  // E4 is 4 * 7 + 2 = 30 in absolute letter-steps.
  return octave * 7 + letter - 30;
}
