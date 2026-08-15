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
  chosen: "The Chosen One: born, raised and tuned to acquire excellence",
  /** Used where a page needs one sentence rather than the full biography. */
  oneLine:
    "Malaysia's foremost electric violinist. Classically trained from the age of three, and the first performer anywhere to take a six-string 24K gold violin onto a stage.",
  paragraph:
    "His mother is a pianist, so the piano came first, at three, and Dennis had his Grade 8 by eleven. The violin followed at eight and the diplomas after that, and then a career that refused to sit in an orchestra pit: three albums, five continents, ten thousand performances, and two sold-out three-thousand-seat concerts of his own. Somewhere in the middle of it he asked a luthier in Donegal to build an instrument nobody had built before, and then waited a year for it.",
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
  "Bachelor of Music, UCSI. Newcastle Australian Music Degree Program, 2006",
  "Classical piano: ATCL, A.Mus.A, Dip ABRSM, LGSM (hons)",
  "Violin: ATCL at fifteen",
  "Trinity College London LTCL, Award for Outstanding Performance",
  "Trinity College London FTCL, Outstanding Performance in Violin",
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

export interface Territory {
  readonly name: string;
  /** Degrees. Carried here so the map is drawn from data rather than traced. */
  readonly lat: number;
  readonly lon: number;
}

/**
 * Territories he has performed in, as he lists them, with a coordinate each so
 * the site can plot them instead of printing them. Cities where he named a city,
 * country centroids where he named a country.
 */
export const territories: readonly Territory[] = [
  { name: "Malaysia", lat: 3.14, lon: 101.69 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Indonesia", lat: -6.21, lon: 106.85 },
  { name: "Thailand", lat: 13.76, lon: 100.5 },
  { name: "Hong Kong", lat: 22.32, lon: 114.17 },
  { name: "Macau", lat: 22.2, lon: 113.54 },
  { name: "China", lat: 31.23, lon: 121.47 },
  { name: "Korea", lat: 37.57, lon: 126.98 },
  { name: "India", lat: 19.08, lon: 72.88 },
  { name: "Sri Lanka", lat: 6.93, lon: 79.86 },
  { name: "Australia", lat: -37.81, lon: 144.96 },
  { name: "London", lat: 51.51, lon: -0.13 },
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
      "Three thousand seats, sold out, under music director Aubrey Suwito. The first Malaysian instrumentalist to fill a hall that size on his own name, and the night the Phoenix was first played.",
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
      "Working with the non-profit in the schools where a child with real ability is least likely to be heard.",
  },
];

/**
 * His higher calling, in his own framing. "Chosen" on this site means selected
 * rather than manufactured, and it is why concept 03 carries the name.
 *
 * The earlier draft of the body had him proving himself "somewhere nobody was
 * watching", which says nothing, and then a clause about where a child is born
 * deciding whether their talent is heard, which is three ideas in one breath.
 * The version here uses a fact the page has already given the reader.
 */
export const calling = {
  lede: "Everyone is chosen to succeed",
  body: "His own teacher was his mother, at the piano at home, from the age of three. Plenty of children with the same ability are never taught by anyone at all, and that is the gap Teach For Malaysia works in.",
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
 *
 * The Dragon's entry used to read "Carved body, lacquer and inlay", which is
 * neither its material nor its finish, and its note described how Dennis found
 * Hay in the first place rather than anything about the instrument. Corrected
 * against the maker's own account: emeraldguitars.com/dennis-lau-and-the-
 * phoenix-violin calls it Suilleach, "a mythical dragon captured in flight",
 * "gilded in pure Palladium", and its unveiling in Kuala Lumpur is dated
 * November 2017. The Chosen's particulars are from Robb Report Malaysia's
 * report of the unveiling, 27 May 2019.
 */
export const violins: readonly Violin[] = [
  {
    id: "phoenix",
    name: "The Phoenix",
    year: "2016",
    material: "Six strings, carbon fibre, 24K gold plate",
    note: "It was the first instrument of its kind played on a stage anywhere in the world, unveiled on 22 October 2016, a year after Dennis commissioned it.",
  },
  {
    id: "dragon",
    name: "The Dragon",
    year: "2017",
    material: "A dragon caught in flight, gilded in pure palladium",
    note: "Alistair Hay named it Suilleach. It came out of the same Donegal workshop as the Phoenix, a year after it, and was unveiled in Kuala Lumpur.",
  },
  {
    id: "chosen",
    name: "The Chosen",
    year: "2019",
    material: "Carbon fibre, body and neck cut in one piece",
    note: "The lightest of the three and the one built to travel, slim enough to carry in a whisky case. Dennis unveiled it for the 2019 concert it is named after.",
  },
];

/**
 * How the Phoenix came to exist. It is the best story he has, it is entirely
 * documented, and it says more about him than any adjective would.
 */
export const commissionStory = {
  eyebrow: "Donegal, 2016",
  lede: "Dennis saw a guitar and flew to Donegal to meet its maker",
  body: "The guitar was a dragon, built for the Mandopop star Wang Leehom by Alistair Hay of Emerald Guitars, in Donegal, Ireland. Dennis flew there in the summer of 2016 and asked for something nobody had made: a six-string electric violin, carved as a bird's wing, plated in 24K gold. It took Hay a year, and Dennis unveiled it in front of three thousand people.",
  quote:
    "Just like a soul mate, a musician's instrument plays a very important role in the development of the player's voice and personality.",
  quoteWho: "Dennis Lau",
  makerQuote:
    "This project has been one of the most rewarding commissions of my career, being given the opportunity to stretch my creative abilities to a new level.",
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
