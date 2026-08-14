/**
 * Facts here are drawn from Dennis Lau's public biography. Keep them accurate —
 * the whole premise of Blesspoke is that there is exactly one artist and his
 * record is the product.
 */

export interface Violin {
  readonly id: "phoenix" | "dragon" | "chosen";
  readonly name: string;
  readonly year: string;
  readonly material: string;
  readonly note: string;
}

/** The three instruments Alistair Hay built for Dennis. Each concept is named for one. */
export const violins: readonly Violin[] = [
  {
    id: "phoenix",
    name: "The Phoenix",
    year: "2016",
    material: "Six strings, 24K gold plate",
    note: "The first electric violin of its kind played on a stage anywhere in the world.",
  },
  {
    id: "dragon",
    name: "The Dragon",
    year: "2017",
    material: "Carved body, lacquer and inlay",
    note: "Commissioned after a dragon-shaped guitar sent Dennis looking for its maker.",
  },
  {
    id: "chosen",
    name: "The Chosen",
    year: "2019",
    material: "Carbon fibre, single-piece teardrop",
    note: "The lightest of the three. Slim enough to travel in a whisky case.",
  },
];

export interface Credential {
  readonly label: string;
  readonly value: string;
}

export const credentials: readonly Credential[] = [
  { label: "Piano from", value: "Age 3" },
  { label: "Grade 8 by", value: "Age 11" },
  { label: "Violin from", value: "Age 8" },
  { label: "ATCL diploma at", value: "Age 15" },
];

/** Counts from his own press material — the scale behind a one-song commission. */
export const tallies: readonly Credential[] = [
  { label: "Original songs", value: "57" },
  { label: "Performances", value: "10,000+" },
  { label: "Continents", value: "Five" },
  { label: "Instruments built to his drawings", value: "Three" },
];

/** The paper trail, in the order a musician would list it. */
export const training: readonly string[] = [
  "Bachelor of Music, UCSI — Newcastle Australian Music Degree Program",
  "Classical piano: ATCL, A.Mus.A, Dip ABRSM, LGSM (hons)",
  "Violin: ATCL at fifteen",
  "Trinity College London LTCL — Award for Outstanding Performance",
  "Trinity College London FTCL — Outstanding Performance in Violin",
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
    detail: "Debut album on Sony Music Malaysia. Best Producer, VIMA.",
  },
  {
    year: "2015",
    title: "The Journey",
    detail: "Third album. Classical training folded into R&B and pop production.",
  },
  {
    year: "2016",
    title: "The Phoenix Rising",
    detail: "3,000 seats, sold out. First Malaysian instrumentalist to do it.",
  },
  {
    year: "2019",
    title: "The Chosen",
    detail: "Sold out again. A second custom instrument built for the night.",
  },
];

export const artist = {
  name: "Dennis Lau",
  chineseName: "刘凯彦",
  roles: "Electric violinist · Pianist · Composer · Producer",
  city: "Kuala Lumpur",
  born: "Ipoh, Perak",
  /** Used where a page needs one sentence rather than the full biography. */
  oneLine:
    "Malaysia's foremost pop violinist, trained classically from the age of three and producing R&B since 2009.",
  paragraph:
    "Dennis Lau started at the piano aged three and had Grade 8 in hand by eleven. The violin came at eight, the diplomas after, and then a career that refused to sit in the orchestra pit — three albums, two sold-out arena nights, five continents, and three instruments built to his own drawings by a luthier in Ireland. Blesspoke is the quietest thing he does: one prompt, one song, no audience but you.",
} as const;
