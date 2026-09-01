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
    body: "One paragraph is enough: who it is for, the occasion, where it will be played, and what you want the music to say. Leave an address with it and the whole thing lands in his team's inbox.",
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
  readonly id: "song" | "track" | "intro";
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
export const introTier: Tier = {
  id: "intro",
  name: "1st love / 1st baby song",
  price: "USD 288",
  length: "Short original song",
  summary:
    "An introductory song for a wedding, first dance, baby's arrival, or another milestone you want set to music.",
  includes: [
    "Original short dedication written for you",
    "Lyrics written if required",
    "100% copyright and master ownership",
    "All commercial usage rights",
    "One request for change",
  ],
};

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

/* ════════════════════════════════════════════════════════════════════════════
   The creative brief.

   Dennis's own intake form, twenty questions in five parts, and the wording is
   his. It replaces a four-field card, and the reason for the change is the
   business rather than the design: what he actually needs before he can write
   anything is the story, the mood, the language, the voice and the date, and
   asking for a paragraph and then emailing fourteen questions back is a worse
   version of asking fourteen questions.

   Two departures from his sheet, both to avoid asking the same thing twice.
   His question 16 is the song's length, which on this site is also its price —
   so each length carries its tier, and the separate "what you are after" chooser
   the old card had is gone. And his section on style is one question with a
   write-in rather than a list plus a list.

   Only what he starred is required. The last line of his sheet is the important
   one and it is repeated to the reader: fill in what you can, leave the rest.
   ════════════════════════════════════════════════════════════════════════════ */

export interface BriefOption {
  readonly value: string;
  /** A price, a duration, an example — whatever makes the choice decidable. */
  readonly note?: string;
}

export type BriefKind =
  | "text"
  | "email"
  /** A dialling code chosen from a list, and the number beside it. */
  | "dial"
  /** A country chosen from a list rather than spelled out. */
  | "country"
  | "date"
  | "long"
  | "one"
  | "many";

export interface BriefField {
  readonly id: string;
  /** His numbering, kept: the sheet and the page can be read side by side. */
  readonly q: number;
  readonly label: string;
  readonly hint?: string;
  readonly required?: boolean;
  readonly kind: BriefKind;
  readonly options?: readonly BriefOption[];
  /** For "many": the most that may be picked. His sheet caps mood at three. */
  readonly max?: number;
  /** Appends a write-in, because every one of his lists ends in "Other". */
  readonly other?: boolean;
  readonly placeholder?: string;
}

export interface BriefSection {
  readonly id: string;
  readonly letter: string;
  readonly title: string;
  readonly fields: readonly BriefField[];
}

export const brief: readonly BriefSection[] = [
  {
    id: "contact",
    letter: "A",
    title: "Contact details",
    fields: [
      { id: "name", q: 1, label: "Full name or company name", kind: "text", required: true },
      { id: "email", q: 2, label: "Email address", kind: "email", required: true },
      /* The code is picked, not typed. "Include your country code" asks the
         reader to know something the form already knows, and a number that
         arrives without one cannot be dialled. Choosing here also answers
         question 4, and answering 4 fills this — the two are the same fact. */
      {
        id: "whatsapp",
        q: 3,
        label: "WhatsApp number",
        kind: "dial",
        required: true,
        placeholder: "12 345 6789",
      },
      { id: "country", q: 4, label: "Country", kind: "country", required: true },
    ],
  },
  {
    id: "overview",
    letter: "B",
    title: "Song overview",
    fields: [
      {
        id: "type",
        q: 5,
        label: "What type of song would you like?",
        kind: "one",
        required: true,
        other: true,
        options: [
          { value: "Personal gift" },
          { value: "Birthday song" },
          { value: "Anniversary song" },
          { value: "Proposal song" },
          { value: "Wedding song" },
          { value: "Family song" },
          { value: "Tribute or memorial song" },
          { value: "Corporate or brand theme song" },
          { value: "Advertising jingle" },
          { value: "Event or campaign song" },
          { value: "Baby's first song", note: "Full moon, hundredth day, monthsary" },
        ],
      },
      {
        id: "title",
        q: 6,
        label: "Do you have a preferred song title?",
        hint: "Optional. Dennis may also suggest one.",
        kind: "text",
      },
      {
        id: "who",
        q: 7,
        label: "Who is the song for?",
        hint: "For a person: their name, and who they are to you. For a brand: the company, the industry, who the audience is, and the campaign, product or event if there is one.",
        kind: "long",
        required: true,
      },
    ],
  },
  {
    id: "story",
    letter: "C",
    title: "Your story and message",
    fields: [
      {
        id: "story",
        q: 8,
        label: "Tell us the story behind the song.",
        hint: "This is the most important part. The message you want it to carry, the memories or milestones that matter, what the person or the brand is like, and how you want a listener to feel.",
        kind: "long",
        required: true,
        placeholder:
          "Anything that should end up in the lyrics. There is no such thing as too much here.",
      },
      {
        id: "mood",
        q: 9,
        label: "What should it feel like?",
        hint: "Up to three.",
        kind: "many",
        required: true,
        max: 3,
        other: true,
        options: [
          { value: "Romantic" },
          { value: "Heartfelt" },
          { value: "Joyful" },
          { value: "Fun and playful" },
          { value: "Emotional" },
          { value: "Inspiring" },
          { value: "Powerful" },
          { value: "Elegant" },
          { value: "Energetic" },
          { value: "Nostalgic" },
          { value: "Hopeful" },
          { value: "Cinematic" },
        ],
      },
      {
        id: "keywords",
        q: 10,
        label: "Any names, words, phrases or slogans that should be in it?",
        hint: "Optional, and more useful than it sounds: a single right word can carry a chorus.",
        kind: "long",
      },
      {
        id: "avoid",
        q: 11,
        label: "Anything that should not be mentioned?",
        hint: "Optional.",
        kind: "long",
      },
    ],
  },
  {
    id: "direction",
    letter: "D",
    title: "Musical direction",
    fields: [
      {
        id: "genre",
        q: 12,
        label: "What style would you like?",
        hint: "As many as apply.",
        kind: "many",
        required: true,
        other: true,
        options: [
          { value: "Pop" },
          { value: "Ballad" },
          { value: "Rock" },
          { value: "Acoustic" },
          { value: "R&B or soul" },
          { value: "Jazz" },
          { value: "Classical" },
          { value: "Cinematic" },
          { value: "Romantic wedding song" },
          { value: "Corporate anthem" },
          { value: "Advertising jingle" },
        ],
      },
      {
        id: "references",
        q: 13,
        label: "Up to three reference songs.",
        hint: "YouTube or Spotify links, and a line on what you like about each: the melody, the mood, the lyrics, the voice, the arrangement.",
        kind: "long",
      },
      {
        id: "language",
        q: 14,
        label: "Language",
        kind: "one",
        required: true,
        other: true,
        options: [
          { value: "English" },
          { value: "Mandarin" },
          { value: "Cantonese" },
          { value: "Malay" },
          { value: "Mixed" },
        ],
      },
      {
        id: "vocal",
        q: 15,
        label: "Voice",
        kind: "one",
        required: true,
        options: [
          { value: "Male vocal" },
          { value: "Female vocal" },
          { value: "Male and female duet" },
          { value: "Group or choir" },
          { value: "Instrumental only" },
        ],
      },
      {
        id: "duration",
        q: 16,
        label: "How long should it be?",
        hint: "The length is the commission, so this is also the price.",
        kind: "one",
        required: true,
        options: [
          { value: "Short jingle", note: "Up to 30 seconds · USD 1,500" },
          { value: "Extended jingle", note: "30 to 60 seconds · USD 1,500" },
          { value: "Commercial song", note: "Up to 90 seconds · USD 1,500" },
          { value: "Full-length song", note: "3 to 4 minutes · USD 2,500" },
        ],
      },
    ],
  },
  {
    id: "usage",
    letter: "E",
    title: "Usage and timeline",
    fields: [
      {
        id: "usage",
        q: 17,
        label: "Where will it be used?",
        hint: "As many as apply. This decides the licence, and the licence is yours either way.",
        kind: "many",
        required: true,
        other: true,
        options: [
          { value: "Private or personal use" },
          { value: "A wedding, birthday or private event" },
          { value: "A corporate event" },
          { value: "Advertising or a marketing campaign" },
          { value: "Social media" },
          { value: "A website or digital platforms" },
          { value: "Radio or television" },
          { value: "Live performance" },
          { value: "Internal company use" },
        ],
      },
      {
        id: "due",
        q: 18,
        label: "When do you need it?",
        kind: "date",
        required: true,
      },
      {
        id: "occasion",
        q: 19,
        label: "Is there an event, launch or occasion it is tied to?",
        hint: "Optional. Its date, if there is one.",
        kind: "date",
      },
      {
        id: "anything",
        q: 20,
        label: "Anything else Dennis should know?",
        hint: "Optional.",
        kind: "long",
      },
    ],
  },
];

/**
 * What the form says while it is asking. Shared, because it is the same request
 * in three different sets of clothes.
 *
 * It used to promise one paragraph and an address. It now asks for the brief,
 * and the copy says so — a page that says "one paragraph" and then shows twenty
 * questions has broken its word before the reader has typed anything. The
 * reassurance Dennis puts at the bottom of his own sheet does the real work
 * here, and it is repeated where it matters, next to the button.
 */
export const enquiry = {
  eyebrow: "Start the commission",
  headline: "The creative brief",
  lede: "Twenty questions, in five parts. The more of them you answer the more the song is yours rather than merely a song, and the story, in part C, is the one it is really written from. Nothing is bought here: his team reads this themselves and replies from their own address.",
  send: "Send the brief",
  sending: "Sending",
  sentHead: "It is with his team.",
  sentBody:
    "They read every one of these themselves and reply from their own address, usually the same day. Watch your inbox, and check the junk folder once.",
  again: "Start another",
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
 * The disclaimer shown before the brief is sent, supplied by Dennis's team
 * (Jon, 2026-09-01) — their text in substance, with the party defined once
 * and used consistently: "the Composer" is Dennis Lau.
 */
export const disclaimer = {
  eyebrow: "Before it goes",
  title: "Disclaimer",
  define: "In this form, “the Composer” refers to Dennis Lau.",
  body: [
    "The contents of this form, including all information, particulars, statements, representations and supporting documents contained therein, are provided and/or completed by the relevant party and are the sole responsibility of the person or entity providing the same.",
    "The Composer has no responsibility or liability whatsoever for the accuracy, completeness, authenticity or veracity of any information or contents contained in this form, and shall not be responsible or liable for any reliance placed upon, or any consequences arising from, such information or contents.",
    "For the avoidance of doubt, nothing contained in this form shall be construed as an endorsement, verification, confirmation or representation by the Composer as to the accuracy or completeness of its contents.",
  ],
  agree: "I understand · Send the brief",
  back: "Go back",
} as const;

/**
 * The terms, as clauses. Nothing here is invented: each one restates a promise
 * the page already makes — the deed, the seven days, the payment order, the
 * one-of-one guarantee — in the plain order a client would ask about them.
 * Dennis's team supplies the full written contract at enquiry.
 */
export const clauses: readonly { numeral: string; term: string; body: string }[] = [
  {
    numeral: "I",
    term: "Ownership",
    body: "Every composition belongs to the person who commissioned it. On delivery you receive 100% of the copyright, the master recordings, the stems and every commercial usage right, in all media, in perpetuity, signed over in a deed of transfer. Dennis keeps no publishing and no royalty.",
  },
  {
    numeral: "II",
    term: "Delivery",
    body: "A private preview of your piece comes back to you inside seven days of the brief, guaranteed. The finished work follows on your approval.",
  },
  {
    numeral: "III",
    term: "Changes",
    body: "A full commission includes two requests for change; the introductory package includes one. Each request is heard and answered before anything is final.",
  },
  {
    numeral: "IV",
    term: "Payment",
    body: "Nothing is owed until you have heard the preview and are happy with it. Payment details are sent then, and once payment clears, the full mix, the stems and the deed of transfer come back the same way.",
  },
  {
    numeral: "V",
    term: "One of one",
    body: "Every piece is written once, for one client, and never re-sold, re-cut or re-licensed. What is made for you exists nowhere else.",
  },
];

/**
 * His own description of the service, condensed. Better positioning copy than
 * anything invented for the site, because it is what he actually sells.
 */
export const service = {
  lede: "Bespoke music composition and production for brands, campaigns, tourism, luxury experiences, events, personal milestones and corporate storytelling.",
  against:
    "Every composition belongs to the person who commissioned it. On delivery you receive the full work and everything that comes with it: 100% of the copyright, the master recordings, and all commercial usage rights.",
} as const;
