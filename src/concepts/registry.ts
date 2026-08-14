import { violins, type Violin } from "../content/dennis";

export type ConceptId = "phoenix" | "dragon" | "nocturne";

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

function violin(id: Violin["id"]): Violin {
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
    id: "nocturne",
    ordinal: "03",
    path: "/nocturne",
    name: "Nocturne",
    tagline: "Velvet and lamplight",
    object: "A velvet house before the doors open, and one lamp still lit.",
    premise:
      "The concert-hall reading, at night. Oxblood velvet, warm ivory, brass lamplight, and a proscenium arch that every picture is seen through. Scroll walks you from the empty house to the one instrument under the lamp — and the commission is the last door.",
    theme: "dark",
    fonts:
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Instrument+Sans:ital,wght@0,400..600;1,400..500&display=swap",
    display: "Fraunces",
    body: "Instrument Sans",
    swatches: [
      { name: "Velvet", value: "oklch(19% 0.06 22)" },
      { name: "Ivory", value: "oklch(94% 0.012 80)" },
      { name: "Brass", value: "oklch(76% 0.1 78)" },
      { name: "Rose", value: "oklch(72% 0.09 20)" },
    ],
    /* Named for the hour rather than for an instrument — the other two carry the
       violins. The third violin, The Chosen, is still in the record below. */
    instrument: violin("chosen"),
  },
];

export function conceptById(id: ConceptId): Concept {
  const found = concepts.find((c) => c.id === id);
  if (!found) throw new Error(`unknown concept ${id}`);
  return found;
}
