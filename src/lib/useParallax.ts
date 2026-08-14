import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./prefersReducedMotion";

/**
 * Scroll, published to CSS. Anything marked `data-parallax` gets a `--shift` of
 * -1 → 1 as it crosses the viewport, and anything marked `data-scroll` gets a
 * `--s` of 0 → 1 across its own passage. The concept decides what to do with
 * either — the mechanism is shared, the amount is not.
 *
 * `--s` is what stops the lower half of a page feeling dead: a rule can extend,
 * a plate can uncrop, a caption can hold, all of it tied to the reader's own
 * hand rather than to a timer.
 *
 * Written straight to the element's style from an animation frame, never
 * through React state, for the same reason ScrollStage publishes `--p` that
 * way: a scroll must not re-render the tree.
 *
 * Only frames that clip their contents should use this. Dragon's photographs
 * are multiplied into the paper with real alpha and have no frame to move
 * within, which is why that concept does its work with ink instead.
 */
export function useParallax(root: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const host = root.current;
    if (!host) return;

    const targets = Array.from(
      host.querySelectorAll<HTMLElement>("[data-parallax], [data-scroll]"),
    );
    if (targets.length === 0) return;

    // Reduced motion: no drift, and every passage reads as already complete.
    // Leaving `--s` unset would leave anything keyed off it in its start state,
    // which is worse than no animation — it is no content.
    if (prefersReducedMotion()) {
      for (const target of targets) {
        target.style.setProperty("--shift", "0");
        target.style.setProperty("--s", "1");
      }
      return;
    }

    // Only the ones on screen are worth measuring; the rest are skipped.
    const onScreen = new Set<HTMLElement>();
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) onScreen.add(target);
          else onScreen.delete(target);
        }
      },
      { rootMargin: "10% 0px" },
    );
    for (const target of targets) watcher.observe(target);

    let frame = 0;

    const measure = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const target of onScreen) {
        const box = target.getBoundingClientRect();
        // 0 when the element's middle sits at the middle of the screen.
        const centre = (box.top + box.height / 2 - viewport / 2) / (viewport / 2 + box.height / 2);
        target.style.setProperty("--shift", Math.max(-1, Math.min(1, centre)).toFixed(4));
        // 0 as it comes on from the bottom, 1 once it has passed off the top.
        const passage = (viewport - box.top) / (box.height + viewport);
        target.style.setProperty("--s", Math.max(0, Math.min(1, passage)).toFixed(4));
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      watcher.disconnect();
    };
  }, [root]);
}
