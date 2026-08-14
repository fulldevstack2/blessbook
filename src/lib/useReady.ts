import { useEffect, useState } from "react";

/**
 * When the page is actually ready to be looked at.
 *
 * Not "when the DOM parsed" — a luxury site that reveals itself before its
 * display face has arrived shows you a paragraph in Times New Roman and then
 * reflows, which is the single most common way an expensive site looks cheap.
 * So: the fonts, the one image the hero cannot do without, and a floor on the
 * duration so the reveal is a gesture rather than a flicker.
 */

const FLOOR_MS = 1100;

export function useReady(criticalImage?: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    const image = criticalImage
      ? new Promise<void>((resolve) => {
          const element = new Image();
          element.onload = () => resolve();
          element.onerror = () => resolve();
          element.src = criticalImage;
        })
      : Promise.resolve();

    const fonts = document.fonts?.ready ?? Promise.resolve();

    void Promise.all([fonts, image]).then(() => {
      const waited = performance.now() - started;
      const remaining = Math.max(0, FLOOR_MS - waited);
      window.setTimeout(() => {
        if (!cancelled) setReady(true);
      }, remaining);
    });

    return () => {
      cancelled = true;
    };
  }, [criticalImage]);

  return ready;
}
