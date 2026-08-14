import { useEffect } from "react";

/**
 * Each concept uses a different type pairing, so the stylesheets are attached
 * per concept rather than all loaded up front.
 */
export function useFonts(href: string): void {
  useEffect(() => {
    const existing = document.head.querySelector<HTMLLinkElement>(
      `link[data-fonts="${href}"]`,
    );
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.fonts = href;
    document.head.append(link);
  }, [href]);
}
