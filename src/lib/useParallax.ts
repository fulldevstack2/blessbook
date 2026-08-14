import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./prefersReducedMotion";

/**
 * Photography that moves inside its own frame. Anything marked `data-parallax`
 * gets a `--shift` of -1 → 1 as it crosses the viewport, and the concept
 * decides what to do with it — the mechanism is shared, the amount is not.
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

    // Idle-free by nature — this only moves as fast as the scroll does — but
    // it is still motion the reader did not ask for, so it goes.
    if (prefersReducedMotion()) return;

    const targets = Array.from(host.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (targets.length === 0) return;

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
