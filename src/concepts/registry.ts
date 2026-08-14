import { violins, type Violin } from "../content/dennis";

export type ConceptId = "phoenix" | "dragon" | "chosen";

export interface Swatch {
  readonly name: string;
  readonly value: string;
}

export interface Concept {
  readonly id: ConceptId;
  readonly ordinal: string;
  readonly path: string;
  /** Design direction name — also the instrument it is named for. */
  readonly name: string;
  readonly tagline: string;
  /** The physical object the design is imitating. */
  readonly object: string;
  readonly premise: string;
  readonly theme: "dark" | "light";
  readonly fonts: string;
  readonly display: string;
  readonly body: string;
  readonly swatches: readonly Swatch[];
  readonly instrument: Violin;
}

function violin(id: ConceptId): Violin {
  const found = violins.find((v) => v.id === id);
  if (!found) throw new Error(`no violin registered for ${id}`);
  return found;
}

export const concepts: readonly Concept[] = [
  {
    id: "phoenix",
    ordinal: "01",
    path: "/phoenix",
    name: "Phoenix",
    tagline: "Gilded",
    object: "A gold-leaf lacquer screen, and a velvet-lined flight case.",
    premise:
      "The opulent reading. Near-black lacquer, one seam of 24K gold, and display type thin enough to feel expensive rather than loud. Scroll turns a gilded instrument through a dark room.",
    theme: "dark",
    fonts:
      "https://fonts.googleapis.com/css2?family=Italiana&family=Commissioner:wght@200..800&display=swap",
    display: "Italiana",
    body: "Commissioner",
    swatches: [
      { name: "Lacquer", value: "oklch(16% 0.018 40)" },
      { name: "24K", value: "oklch(78% 0.13 85)" },
      { name: "Ivory", value: "oklch(93% 0.014 85)" },
    ],
    instrument: violin("phoenix"),
  },
  {
    id: "dragon",
    ordinal: "02",
    path: "/dragon",
    name: "Dragon",
    tagline: "Ink and jade",
    object: "An ink-wash scroll, and a jade seal pressed in cinnabar.",
    premise:
      "The heritage reading, and the only one in daylight. Warm rice paper, brush-weight serif, a jade rule and a single cinnabar chop. Scroll pulls ink through water until it settles into a form.",
    theme: "light",
    fonts:
      "https://fonts.googleapis.com/css2?family=Faustina:ital,wght@0,300..800;1,300..800&family=Hanken+Grotesk:wght@300..800&family=Ma+Shan+Zheng&display=swap",
    display: "Faustina",
    body: "Hanken Grotesk",
    swatches: [
      { name: "Paper", value: "oklch(95% 0.012 85)" },
      { name: "Ink", value: "oklch(24% 0.012 250)" },
      { name: "Jade", value: "oklch(58% 0.078 165)" },
      { name: "Cinnabar", value: "oklch(52% 0.19 32)" },
    ],
    instrument: violin("dragon"),
  },
  {
    id: "chosen",
    ordinal: "03",
    path: "/chosen",
    name: "Chosen",
    tagline: "Carbon",
    object: "A carbon-fibre instrument in a machined case.",
    premise:
      "The precision reading. Graphite, brushed silver, expanded technical type and measurements everywhere. Scroll assembles the instrument out of its own wireframe.",
    theme: "dark",
    fonts:
      "https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=Public+Sans:wght@300..800&family=Martian+Mono:wght@300..700&display=swap",
    display: "Anybody",
    body: "Public Sans",
    swatches: [
      { name: "Graphite", value: "oklch(19% 0.006 250)" },
      { name: "Silver", value: "oklch(84% 0.004 250)" },
      { name: "Ember", value: "oklch(64% 0.17 44)" },
    ],
    instrument: violin("chosen"),
  },
];

export function conceptById(id: ConceptId): Concept {
  const found = concepts.find((c) => c.id === id);
  if (!found) throw new Error(`unknown concept ${id}`);
  return found;
}
