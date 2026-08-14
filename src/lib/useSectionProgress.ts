import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./prefersReducedMotion";

/**
 * Publishes how far a section has travelled through the viewport as `--s`,
 * 0 → 1, so CSS can drive anything off it: a stave drawing itself, a rule
 * extending, a figure sliding, a caption holding.
 *
 * This is the difference between a page that reveals and a page that moves. The
 * existing `useScrollReveal` fires once and is done; this keeps going, which is
 * why the second half of a page stops feeling dead.
 *
 * The value is eased toward its target rather than tracking scroll one to one —
 * a small lag is most of what makes expensive sites feel expensive — and the
 * loop stops as soon as it has settled, so an idle page costs nothing. Under
 * reduced motion it tracks exactly, with no easing: still direct manipulation,
 * just without the drift.
 */

interface Options {
  /** 0 → 1. Lower is heavier. */
  readonly ease?: number;
  /** Extra progress beyond the element, in viewport heights, before it reads 1. */
  readonly tail?: number;
}

export function useSectionProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { ease = 0.12, tail = 0 }: Options = {},
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = prefersReducedMotion();
    let current = -1;
    let target = 0;
    let raf = 0;
    let queued = false;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const view = window.innerHeight;
      const span = rect.height + view * (1 + tail);
      const travelled = view - rect.top;
      target = Math.min(1, Math.max(0, travelled / Math.max(1, span)));
    };

    const write = (value: number) => {
      element.style.setProperty("--s", value.toFixed(4));
    };

    const step = () => {
      raf = 0;
      const delta = target - current;
      if (Math.abs(delta) < 0.0004) {
        current = target;
        write(current);
        queued = false;
        return;
      }
      current += delta * ease;
      write(current);
      raf = requestAnimationFrame(step);
    };

    const onScroll = () => {
      measure();
      if (reduced) {
        current = target;
        write(current);
        return;
      }
      if (current < 0) current = target;
      if (!raf && !queued) {
        queued = true;
        raf = requestAnimationFrame(step);
      } else if (!raf) {
        raf = requestAnimationFrame(step);
      }
    };

    measure();
    current = target;
    write(current);

    // Reduced motion: hold it finished. Anything keyed off `--s` is content, and
    // content should not be withheld from a reader who asked for less movement.
    if (reduced) {
      write(1);
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, ease, tail]);
}
