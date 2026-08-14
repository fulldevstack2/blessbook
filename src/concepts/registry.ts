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
    tagline: "Silk and pearl",
    object: "A bolt of cream silk, a single pearl, and one gold thread.",
    premise:
      "The couture reading, and his own word for himself: the chosen one. Cream silk, pearl lustre, hairlines of gold thread and a Didone cut fine enough to belong on a garment label. Scroll gathers the light in the weave until it settles into a single pearl.",
    theme: "light",
    fonts:
      "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..800;1,6..96,400..600&family=Jost:wght@200..500&display=swap",
    display: "Bodoni Moda",
    body: "Jost",
    swatches: [
      { name: "Silk", value: "oklch(96% 0.008 85)" },
      { name: "Pearl", value: "oklch(89% 0.018 320)" },
      { name: "Gold thread", value: "oklch(76% 0.095 85)" },
      { name: "Ink", value: "oklch(23% 0.012 310)" },
    ],
    instrument: violin("chosen"),
  },
];

export function conceptById(id: ConceptId): Concept {
  const found = concepts.find((c) => c.id === id);
  if (!found) throw new Error(`unknown concept ${id}`);
  return found;
}
