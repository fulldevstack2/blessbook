import { useEffect } from "react";
import { prefersReducedMotion } from "./prefersReducedMotion";

/**
 * Weighted scrolling, the way every site people call world-class does it.
 *
 * The wheel stops moving the page directly; it moves a target, and the page eases
 * toward it. That single change is most of what separates a site that feels
 * expensive from one that feels like a document — and it is why award sites all
 * ship Lenis or something like it.
 *
 * Done as real scrolling — `window.scrollTo` on an animation frame — rather than
 * by transforming a wrapper. A transformed wrapper breaks `position: sticky`, and
 * every pinned scene on this site depends on sticky.
 *
 * Off for touch, where the platform's own inertia is better than anything we
 * would write, and off under reduced motion, where the wheel should mean exactly
 * what it says.
 */

/* Heavier than a browser's own scroll, light enough that a flick still lands.
   Award sites live around here; below 0.07 it starts to feel like syrup. */
const EASE = 0.085;
/** A wheel notch in "lines" mode is worth about this many pixels. */
const LINE = 16;

export function useSmoothScroll(): void {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let target = window.scrollY;
    let current = target;
    let frame = 0;
    let running = false;

    const limit = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const step = () => {
      const delta = target - current;
      if (Math.abs(delta) < 0.5) {
        current = target;
        running = false;
        frame = 0;
        window.scrollTo(0, Math.round(current));
        return;
      }
      current += delta * EASE;
      window.scrollTo(0, Math.round(current));
      frame = requestAnimationFrame(step);
    };

    const push = (amount: number) => {
      // Nothing accumulates while the page is still arriving, or the wheel you
      // turned during the loader would fire the moment it lifted.
      if (document.documentElement.dataset.loading) {
        /* Commission (and other hash) arrivals are already pinned to their
           section under the veil — do not yank the target back to the hero. */
        if (!document.documentElement.dataset.arrive) {
          target = 0;
          current = 0;
        }
        return;
      }
      target = Math.min(limit(), Math.max(0, target + amount));
      if (!running) {
        running = true;
        frame = requestAnimationFrame(step);
      }
    };

    const onWheel = (event: WheelEvent) => {
      // Pinch-zoom and horizontal wheels stay the browser's business.
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const amount = event.deltaMode === 1 ? event.deltaY * LINE : event.deltaY;
      push(amount);
    };

    /**
     * Keys get the same weight as the wheel. Without this the page moves two
     * different ways depending on how you asked, which is the sort of
     * inconsistency you feel without being able to name.
     */
    const onKey = (event: KeyboardEvent) => {
      const target_ = event.target as HTMLElement | null;
      if (target_ && /^(input|textarea|select)$/i.test(target_.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const page = window.innerHeight * 0.9;
      const step_ = 120;
      const moves: Record<string, number> = {
        ArrowDown: step_,
        ArrowUp: -step_,
        PageDown: page,
        PageUp: -page,
        " ": event.shiftKey ? -page : page,
      };
      const amount = moves[event.key];
      if (amount === undefined) return;
      event.preventDefault();
      push(amount);
    };

    /** Anything that scrolls the page another way — keys, anchors, the bar. */
    const resync = () => {
      if (running) return;
      target = window.scrollY;
      current = target;
    };

    /** Hash landings (and the loader pin) move scroll without the wheel. When
        arrival ends, adopt whatever position ScrollToTop just asked for. */
    const onArrival = () => {
      if (document.documentElement.dataset.loading === "true") return;
      target = window.scrollY;
      current = target;
    };

    const loadingWatch = new MutationObserver(onArrival);
    loadingWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-loading"],
    });

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", resync, { passive: true });
    window.addEventListener("resize", resync);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      loadingWatch.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", resync);
      window.removeEventListener("resize", resync);
    };
  }, []);
}
