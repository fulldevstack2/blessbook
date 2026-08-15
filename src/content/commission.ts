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
    body: "One paragraph is enough: a name, an occasion, a room, the thing you cannot say out loud. Leave an address with it and the whole thing lands in his team's inbox.",
    marking: "rubato",
  },
  {
    index: "II",
    title: "They write back",
    body: "His team replies from their own address, usually the same day, and everything after this happens in that thread. Ask for anything you forgot to say.",
    marking: "con sordino",
  },
  {
    index: "III",
    title: "A sample arrives",
    body: "Dennis writes it on violin and piano and produces it himself in Kuala Lumpur, and a private preview comes back to you inside seven days. Two rounds of changes are included.",
    marking: "una corda",
  },
  {
    index: "IV",
    title: "Payment, then the song",
    body: "When you are happy with it they send payment details. Once that clears, the full mix, the stems and the deed of transfer come back the same way, and Dennis keeps no publishing and no royalty in it.",
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
    length: "3 to 4 minutes",
    summary:
      "A finished song, with lyrics if you want them, written and produced end to end by Dennis.",
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
      "For a campaign, a brand film, an opening or a launch: short-form, written for you and owned by you outright.",
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

/** What the form asks for, and what it says while it is asking. Shared, because
    it is the same request in three different sets of clothes. */
export const enquiry = {
  eyebrow: "Start the commission",
  headline: "Write the prompt",
  lede: "One paragraph, and an address his team can reply to. Everything after this happens by email: the questions, the sample, the payment details and the song itself.",
  fields: {
    name: "Your name",
    email: "Your email",
    tier: "What you are after",
    prompt: "The prompt",
  },
  placeholder:
    "Who it is for, the occasion, the room it will be played in, and the thing you cannot quite say out loud.",
  send: "Send it to his team",
  sending: "Sending",
  sentHead: "It is with his team.",
  sentBody:
    "They read every one of these themselves and reply from their own address, usually the same day. Watch your inbox, and check the junk folder once.",
  again: "Write another",
  undecided: "Not sure yet",
} as const;

export const commission = {
  from: "USD 1,500",
  full: "USD 2,500",
  slots: "Commissions taken year round",
  turnaround: "Seven days or less, guaranteed",
  revisions: "Two requests for change included",
  note: "Every piece is written once, for one client, and never re-sold.",
} as const;

/**
 * His own description of the service, condensed. Better positioning copy than
 * anything invented for the site, because it is what he actually sells.
 */
export const service = {
  lede: "Bespoke music composition and production for brands, campaigns, tourism, luxury experiences, events, personal milestones and corporate storytelling.",
  against:
    "Every composition belongs to the person who commissioned it. On delivery you receive the full work and everything that comes with it: 100% of the copyright, the master recordings, and all commercial usage rights.",
} as const;
