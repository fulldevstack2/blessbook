/** Public site identity. Served from `/blessbook/` on GitHub Pages. */
export const siteName = "Blessbook";

/** Dennis's team WhatsApp — set VITE_WHATSAPP_NUMBER in .env when provided. */
const whatsappDigits = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(
  /\D/g,
  "",
);

export const whatsapp = whatsappDigits
  ? ({
      href: `https://wa.me/${whatsappDigits}`,
      label: "Talk to us",
    } as const)
  : null;

export interface NavItem {
  readonly id: string;
  readonly label: string;
  /** Hash on the work page. */
  readonly hash: string;
}

/* No "Portfolio" entry: the films sit inside the work the page already walks
   you through, and the man himself has his own passage at the end of this row. */
export const workNav: readonly NavItem[] = [
  { id: "work", label: "Work", hash: "#work" },
  { id: "packages", label: "Packages", hash: "#packages" },
  { id: "terms", label: "T&C", hash: "#terms" },
  { id: "testimonials", label: "Testimonials", hash: "#testimonials" },
];

/** Introductory milestone package — full copy from Dennis when ready. */
export const introOffer = {
  id: "first-milestone",
  title: "1st love / 1st baby song",
  price: "USD 288",
  summary:
    "An introductory song for a wedding, a first dance, a baby's arrival, or another milestone you want set to music.",
  cta: "Ask about this package",
  note: "Limited introductory package. Enquire via WhatsApp or the brief below.",
  storageKey: "blessbook:promo-dismissed",
} as const;
