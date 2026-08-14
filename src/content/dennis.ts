/**
 * Dennis Lau, in facts.
 *
 * This file is the centre of the site. Blesspoke is not a marketplace with an
 * artist attached — it is Dennis's site, and the commission is the last thing
 * on it. Everything here is drawn from his own published biography, his own
 * site (dennislau.thechosen.io), his Wikipedia entry and Emerald Guitars'
 * account of building the Phoenix. Keep it accurate; the record is the product.
 *
 * Naming rule: people are named when they made something — the luthier, the
 * music director, his teachers, brand clients. Singers he has backed are not
 * listed, because a wall of their names would read as a talent roster, which is
 * exactly what this site refuses to be. See work.ts for the same rule applied
 * to commissions.
 */

export const artist = {
  name: "Dennis Lau",
  chineseName: "刘凯彦",
  roles: "Electric violinist · Pianist · Composer · Producer",
  city: "Kuala Lumpur",
  /** Sources disagree on the town, so this stays at the state he was born in. */
  born: "Perak, 9 September 1985",
  /** His own headline for himself. Nothing invented here beats it. */
  showman: "A musical showman with absolute flair and finesse",
  /** The line his whole brand rests on — and the reason concept 03 is called The Chosen. */
  chosen: "The Chosen One — born, raised and tuned to acquire excellence",
  /** Used where a page needs one sentence rather than the full biography. */
  oneLine:
    "Malaysia's foremost electric violinist — classically trained from the age of three, and the first performer anywhere to take a six-string 24K gold violin onto a stage.",
  paragraph:
    "His mother is a pianist, so the piano came first, at three. Grade 8 by eleven. The violin at eight, the diplomas after that, and then a career that refused to sit in an orchestra pit: three albums, five continents, ten thousand performances, and two sold-out three-thousand-seat concerts of his own. Along the way he asked a luthier in Donegal to build him an instrument nobody had built before, and waited a year for it.",
} as const;

export interface Credential {
  readonly label: string;
  readonly value: string;
}

/**
 * His own counters, from his own site. These are the scale that makes one
 * commission feel like access rather than a transaction.
 */
export const record: readonly Credential[] = [
  { label: "Years on stage", value: "18" },
  { label: "Performances", value: "10,000+" },
  { label: "In his audiences", value: "168,000" },
  { label: "Original songs", value: "57" },
  { label: "Awards", value: "10" },
  { label: "Continents", value: "Five" },
];

/** Kept short on purpose: the childhood record, in the order it happened. */
export const credentials: readonly Credential[] = [
  { label: "Piano from", value: "Age 3" },
  { label: "Violin from", value: "Age 8" },
  { label: "Grade 8 by", value: "Age 11" },
  { label: "ATCL diploma at", value: "Age 15" },
];

/** Named because they taught him. Provenance, not a roster. */
export const teachers = {
  piano: "His mother, Chuah Chai Eng, a pianist",
  violin: "Miss Nora Kim and Mr Andrew Chye",
} as const;

/** The paper trail, in the order a musician would list it. */
export const training: readonly string[] = [
  "Bachelor of Music, UCSI — Newcastle Australian Music Degree Program, 2006",
  "Classical piano: ATCL, A.Mus.A, Dip ABRSM, LGSM (hons)",
  "Violin: ATCL at fifteen",
  "Trinity College London LTCL — Award for Outstanding Performance",
  "Trinity College London FTCL — Outstanding Performance in Violin",
];

export interface Award {
  readonly name: string;
  readonly detail: string;
}

export const awards: readonly Award[] = [
  { name: "Malaysian Book of Records", detail: "For the gold six-string Phoenix violin" },
  { name: "VIMA Music Awards", detail: "Best Producer, for DiversiFy, 2009" },
  { name: "Trinity College London", detail: "Outstanding Performance, LTCL and FTCL" },
  { name: "CIMB Prestige", detail: "Top 40 Under 40, 2009" },
  { name: "The BrandLaureate", detail: "For contribution to the industry" },
  { name: "McMillan Woods Global", detail: "Award recipient" },
];

/**
 * Where he played before he was a headline act. This is the part of a musician's
 * record that cannot be bought, and the reason a commission is not a gamble.
 */
export const halls: readonly string[] = [
  "First violinist, Malaysian Philharmonic Youth Orchestra",
  "Session violinist, RTM Orchestra and the National Symphony Orchestra",
  "Soloist with the Universiti Malaya Symphony Orchestra, for the Sultan of Perak",
  "Penang Island and Genting International jazz festivals",
  "Speaker, TEDx",
];

/** Territories he has performed in, as he lists them. */
export const territories: readonly string[] = [
  "Malaysia",
  "Singapore",
  "Indonesia",
  "Thailand",
  "Hong Kong",
  "Macau",
  "China",
  "Korea",
  "India",
  "Sri Lanka",
  "Australia",
  "London",
];

export interface Milestone {
  readonly year: string;
  readonly title: string;
  readonly detail: string;
}

export const milestones: readonly Milestone[] = [
  {
    year: "2009",
    title: "DiversiFy",
    detail: "Debut album, distributed by Sony Music Malaysia. Best Producer at the VIMA awards.",
  },
  {
    year: "2014",
    title: "A Malaysian Journey",
    detail: "Classic Malay songs, recorded with the National Department for Culture and Arts.",
  },
  {
    year: "2015",
    title: "The Journey",
    detail: "Five years in the making. Classical training folded into R&B and pop production.",
  },
  {
    year: "2016",
    title: "The Phoenix Rising",
    detail:
      "Three thousand seats, sold out, under music director Aubrey Suwito. The first Malaysian instrumentalist to do it — and the night the Phoenix was first played.",
  },
  {
    year: "2019",
    title: "The Chosen",
    detail: "Three thousand seats, sold out again, and a third instrument built for the night.",
  },
  {
    year: "Since",
    title: "Teach For Malaysia",
    detail:
      "Working with the non-profit to reach children whose musical talent is limited only by where they were born.",
  },
];

/**
 * His higher calling, in his own framing. This is what the word "chosen" means
 * on this site — selected, not manufactured — and it is the reason concept 03
 * carries the name.
 */
export const calling = {
  lede: "Everyone is chosen to succeed",
  body: "He went looking for an inspiration and found it in a place he could only prove to himself. Now he works with Teach For Malaysia so that a child's musical talent is not decided by the circumstances they were born into.",
} as const;

export interface Violin {
  readonly id: "phoenix" | "dragon" | "chosen";
  readonly name: string;
  readonly year: string;
  readonly material: string;
  readonly note: string;
}

/**
 * The three instruments built to his drawings by Alistair Hay of Emerald
 * Guitars, in Donegal, Ireland. Each concept on this site is named for one.
 */
export const violins: readonly Violin[] = [
  {
    id: "phoenix",
    name: "The Phoenix",
    year: "2016",
    material: "Six strings, carbon fibre, 24K gold plate",
    note: "The first instrument of its kind played on a stage anywhere in the world. Unveiled on 22 October 2016, a year after it was commissioned.",
  },
  {
    id: "dragon",
    name: "The Dragon",
    year: "2017",
    material: "Carved body, lacquer and inlay",
    note: "Commissioned after a dragon-shaped guitar sent him looking for its maker.",
  },
  {
    id: "chosen",
    name: "The Chosen",
    year: "2019",
    material: "Carbon fibre, single-piece teardrop",
    note: "The lightest of the three, built for the 2019 concert it is named after.",
  },
];

/**
 * How the Phoenix came to exist. It is the best story he has, it is entirely
 * documented, and it says more about him than any adjective would.
 */
export const commissionStory = {
  eyebrow: "Donegal, 2016",
  lede: "He saw a guitar and went to find who made it",
  body: "The guitar was built for the Mandopop star Wang Leehom by Alistair Hay of Emerald Guitars, in Donegal, Ireland. Dennis flew there in the summer of 2016 and asked for something nobody had made: a six-string electric violin, carved as a bird's wing, plated in 24K gold. It took a year. He unveiled it in front of three thousand people.",
  quote:
    "Just like a soul mate, a musician's instrument plays a very important role in the development of the player's voice and personality.",
  quoteWho: "Dennis Lau",
  makerQuote:
    "This project has been one of the most rewarding commissions of my career — being given the opportunity to stretch my creative abilities to a new level.",
  makerWho: "Alistair Hay, Emerald Guitars",
} as const;

/**
 * Kept for the places that need a small set of headline figures rather than the
 * full record above.
 */
export const tallies: readonly Credential[] = [
  { label: "Original songs", value: "57" },
  { label: "Performances", value: "10,000+" },
  { label: "Continents", value: "Five" },
  { label: "Instruments built to his drawings", value: "Three" },
];
