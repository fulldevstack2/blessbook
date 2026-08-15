/**
 * Who books him. His own site calls them "titans of various industries", and it
 * is the strongest exclusivity argument on the whole site: the people who could
 * hire anyone hire him.
 *
 * The logos ship as alpha-only silhouettes in public/clients, so every concept
 * paints them in its own ink through a CSS mask instead of pasting boxed white
 * logos onto a dark page. Two of the sixteen on his site (BMW, Samsung) are
 * light marks inside a coloured field and would not reduce to a clean
 * silhouette, so they are left out rather than shipped as blobs.
 */

export interface Client {
  readonly slug: string;
  readonly name: string;
  /** Loose grouping, used where the wall wants a caption rather than a grid. */
  readonly field: "Watchmaking" | "Motoring" | "Spirits" | "Hospitality" | "Technology" | "Consumer" | "Finance";
}

function mask(slug: string): string {
  return `${import.meta.env.BASE_URL}clients/${slug}.webp`;
}

export const clients: readonly Client[] = [
  { slug: "patek-philippe", name: "Patek Philippe", field: "Watchmaking" },
  { slug: "porsche", name: "Porsche", field: "Motoring" },
  { slug: "mercedes", name: "Mercedes-Benz", field: "Motoring" },
  { slug: "audi", name: "Audi", field: "Motoring" },
  { slug: "honda", name: "Honda", field: "Motoring" },
  { slug: "dunhill", name: "Dunhill", field: "Consumer" },
  { slug: "chivas", name: "Chivas Regal", field: "Spirits" },
  { slug: "grand-hyatt", name: "Grand Hyatt", field: "Hospitality" },
  { slug: "huawei", name: "Huawei", field: "Technology" },
  { slug: "intel", name: "Intel", field: "Technology" },
  { slug: "nestle", name: "Nestlé", field: "Consumer" },
  { slug: "maybank", name: "Maybank", field: "Finance" },
  { slug: "maxis", name: "Maxis", field: "Technology" },
  { slug: "sime-darby", name: "Sime Darby", field: "Consumer" },
];

export function clientMask(client: Client): string {
  return mask(client.slug);
}

export const clientWall = {
  eyebrow: "Selected clients",
  lede: "Fourteen companies have booked him",
} as const;
