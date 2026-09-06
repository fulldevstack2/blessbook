/**
 * Who books him. His own site calls them "titans of various industries", and it
 * is the strongest exclusivity argument on the whole site: the people who could
 * hire anyone hire him.
 *
 * The list is Dennis's own (2026-09-06). Phoenix cuts the NAMES into the gold
 * band as text, so no logo asset gates who may appear; the silhouette masks in
 * public/clients remain only for the retired concepts.
 */

export interface Client {
  readonly slug: string;
  readonly name: string;
  /** Loose grouping, used where the wall wants a caption rather than a grid. */
  readonly field:
    | "Watchmaking"
    | "Motoring"
    | "Spirits"
    | "Hospitality"
    | "Technology"
    | "Consumer"
    | "Finance"
    | "Music"
    | "Property"
    | "Brewing";
}

function mask(slug: string): string {
  return `${import.meta.env.BASE_URL}clients/${slug}.webp`;
}

export const clients: readonly Client[] = [
  { slug: "mercedes", name: "Mercedes-Benz", field: "Motoring" },
  { slug: "denza", name: "Denza", field: "Motoring" },
  { slug: "acson", name: "Acson", field: "Consumer" },
  { slug: "sime-darby", name: "Sime Darby", field: "Consumer" },
  { slug: "sunsuria", name: "Sunsuria", field: "Property" },
  { slug: "berjaya", name: "Berjaya", field: "Consumer" },
  { slug: "ytl", name: "YTL", field: "Property" },
  { slug: "intel", name: "Intel", field: "Technology" },
  { slug: "universal-music", name: "Universal Music", field: "Music" },
  { slug: "maxis", name: "Maxis", field: "Technology" },
  { slug: "chivas", name: "Chivas Regal", field: "Spirits" },
  { slug: "dom-perignon", name: "Dom Pérignon", field: "Spirits" },
  { slug: "samsung", name: "Samsung", field: "Technology" },
  { slug: "patek-philippe", name: "Patek Philippe", field: "Watchmaking" },
  { slug: "toyota", name: "Toyota", field: "Motoring" },
  { slug: "bmw", name: "BMW", field: "Motoring" },
  { slug: "carlsberg", name: "Carlsberg", field: "Brewing" },
];

export function clientMask(client: Client): string {
  return mask(client.slug);
}

export const clientWall = {
  eyebrow: "Selected clients",
  lede: "They have commissioned or booked him",
  turn: "Now it's your turn",
} as const;
