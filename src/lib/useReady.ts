import { useEffect, useState } from "react";

/**
 * When the page is actually ready to be looked at.
 *
 * Not "when the DOM parsed" — a luxury site that reveals itself before its
 * display face has arrived shows you a paragraph in Times New Roman and then
 * reflows, which is the single most common way an expensive site looks cheap.
 * So: the fonts, the one image the hero cannot do without, and a floor on the
 * duration so the reveal is a gesture rather than a flicker.
 *
 * It also holds the page still until the arrival has finished. Scrolling during
 * a transition put you halfway into a gesture you never saw begin, which reads
 * as a bug even when everything is working; a curtain does not go up early
 * because somebody in the stalls leaned forward.
 *
 * If `data-arrive` names a section id (set by Arrival before this runs), the
 * hold pins to that section rather than the top — so the curtain opens onto
 * the commission, not onto the hero with a jump afterward.
 */

const FLOOR_MS = 1100;
/** Long enough to cover the loader's own exit. */
const HOLD_MS = 900;

function placeArrival(): void {
  const id = document.documentElement.dataset.arrive;
  if (id) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ block: "start" });
      return;
    }
  }
  window.scrollTo(0, 0);
}

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

  /* The house is held until the arrival is over. Rather than setting overflow
     hidden — which takes the scrollbar away and shifts the whole layout at the
     worst possible moment — the input itself is refused. */
  useEffect(() => {
    const root = document.documentElement;

    if (!ready) {
      root.dataset.loading = "true";
      placeArrival();

      const stop = (event: Event) => event.preventDefault();
      const stopKeys = (event: KeyboardEvent) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
          event.preventDefault();
        }
      };

      /* Seek until the target mounts (cross-page commission lands before the
         work page has committed #commission), then hold there under the veil. */
      const seek = window.setInterval(placeArrival, 50);

      window.addEventListener("wheel", stop, { passive: false });
      window.addEventListener("touchmove", stop, { passive: false });
      window.addEventListener("keydown", stopKeys);
      window.addEventListener("scroll", placeArrival, { passive: true });

      return () => {
        window.clearInterval(seek);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchmove", stop);
        window.removeEventListener("keydown", stopKeys);
        window.removeEventListener("scroll", placeArrival);
      };
    }

    placeArrival();
    const timer = window.setTimeout(() => {
      delete root.dataset.loading;
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return ready;
}
