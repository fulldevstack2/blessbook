/** The offer. Three lines the whole brand hangs on. */
export const promise = {
  headline: "Create your own song",
  request: "1 prompt · 1 request",
  ownership: "Song ownership is yours",
} as const;

export interface Step {
  readonly index: string;
  readonly title: string;
  readonly body: string;
  /** Short musical marking used as a texture element, not decoration for its own sake. */
  readonly marking: string;
}

export const steps: readonly Step[] = [
  {
    index: "I",
    title: "Write the prompt",
    body: "One paragraph. A name, an occasion, a room, the thing you cannot say out loud. There is no form with twenty fields — the prompt is the brief.",
    marking: "rubato",
  },
  {
    index: "II",
    title: "Dennis composes",
    body: "Violin and piano first, then production. Written and tracked in Kuala Lumpur by the artist himself. Nobody is subcontracted, because there is nobody else.",
    marking: "con sordino",
  },
  {
    index: "III",
    title: "You hear it once",
    body: "A private, watermarked preview. One request for change is included and expected — this is a commission, not a purchase.",
    marking: "una corda",
  },
  {
    index: "IV",
    title: "The deed",
    body: "Masters, stems and full copyright transfer to your name on signature. Dennis keeps no publishing, no royalty, no right to re-release.",
    marking: "sempre",
  },
];

export interface Right {
  readonly term: string;
  readonly detail: string;
}

/** What "ownership is yours" concretely means — the trust argument, stated plainly. */
export const rights: readonly Right[] = [
  { term: "Master recording", detail: "Transferred to you, in full" },
  { term: "Composition copyright", detail: "Transferred to you, in full" },
  { term: "Stems and session files", detail: "Delivered on completion" },
  { term: "Artist's retained rights", detail: "None" },
  { term: "Exclusivity", detail: "The song is never sold, re-cut or re-licensed" },
];

export const commission = {
  from: "RM 8,800",
  slots: "Six commissions a year",
  turnaround: "Six to ten weeks",
  note: "Escrow held until you approve. Nothing is released to the artist before you sign.",
} as const;
