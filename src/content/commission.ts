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
    title: "You hear it inside the week",
    body: "A private preview, guaranteed in seven days or less. Two requests for change are included and expected — this is a commission, not a purchase.",
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
  { term: "Composition copyright", detail: "100%, transferred to you" },
  { term: "Commercial usage", detail: "All rights, all media, in perpetuity" },
  { term: "Stems and session files", detail: "Delivered on completion" },
  { term: "Artist's retained rights", detail: "None" },
  { term: "Exclusivity", detail: "The song is never sold, re-cut or re-licensed" },
];

export interface Tier {
  readonly id: "song" | "track";
  readonly name: string;
  readonly price: string;
  readonly length: string;
  readonly summary: string;
  readonly includes: readonly string[];
}

/**
 * Dennis's two real commission tiers. Prices are USD, as quoted — the work sells
 * internationally, not only into Malaysia.
 */
export const tiers: readonly Tier[] = [
  {
    id: "song",
    name: "Full original song",
    price: "USD 2,500",
    length: "3–4 minutes",
    summary:
      "A finished song with lyrics if you want them, conceptualised, composed, curated and produced by Dennis himself.",
    includes: [
      "Original composition and production",
      "Lyrics written if required",
      "100% copyright and master ownership",
      "All commercial usage rights",
      "Two requests for change",
    ],
  },
  {
    id: "track",
    name: "Original music track",
    price: "USD 1,500",
    length: "Up to 90 seconds",
    summary:
      "For a campaign, a brand film, an opening, a launch. Short-form, but written for you and owned by you outright.",
    includes: [
      "Original track built to the brief",
      "Lyrics written if required",
      "100% copyright and master ownership",
      "All commercial usage rights",
      "Two requests for change",
    ],
  },
];

/**
 * The record, from his own commission history. These are the numbers that make
 * "guaranteed in seven days" believable rather than merely stated.
 */
export const proof: readonly { readonly label: string; readonly value: string }[] = [
  { label: "Commissions delivered", value: "420" },
  { label: "Completion rate", value: "99%" },
  { label: "Client rating", value: "4.98" },
  { label: "Average delivery", value: "5 days" },
];

export const commission = {
  from: "USD 1,500",
  full: "USD 2,500",
  slots: "Commissions taken year round",
  turnaround: "Seven days or less, guaranteed",
  revisions: "Two requests for change included",
  note: "Nothing is stock, nothing is licensed, and nothing is re-sold. The song exists once, for you.",
} as const;

/**
 * His own description of the service, condensed. Better positioning copy than
 * anything invented for the site, because it is what he actually sells.
 */
export const service = {
  lede: "Bespoke music composition and production — for brands, campaigns, tourism, luxury experiences, events, personal milestones and corporate storytelling.",
  against:
    "Unlike stock music or a generic licensed track, every composition is exclusive. On delivery you receive the full work and everything that comes with it: 100% of the copyright, the master recordings, and all commercial usage rights.",
} as const;
