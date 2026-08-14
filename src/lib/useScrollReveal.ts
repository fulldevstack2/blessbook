import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "./prefersReducedMotion";

/**
 * Section choreography, shared by all three concepts so they cannot drift.
 *
 * Mark anything `data-reveal` and it enters when it is scrolled to. The value
 * names the flavour — `rise`, `wipe`, `line` — which base.css defines and each
 * concept is free to refine under its own scope. Siblings that share a parent
 * stagger against each other via `--reveal-i`.
 *
 * Elements reveal once and stay revealed. Re-hiding on the way back up is the
 * tell of a demo; a page that has already introduced itself does not do it
 * again.
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const host = root.current;
    if (!host) return;

    const targets = Array.from(host.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    // Reduced motion still gets the content, just already in place.
    if (prefersReducedMotion()) {
      for (const target of targets) target.dataset.revealed = "true";
      return;
    }

    const counters = new Map<Element, number>();
    for (const target of targets) {
      const parent = target.parentElement;
      if (!parent) continue;
      const position = counters.get(parent) ?? 0;
      counters.set(parent, position + 1);
      // Capped so a long list does not end with a comically late last item.
      target.style.setProperty("--reveal-i", String(Math.min(position, 6)));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      {
        // Threshold stays at zero and all the timing comes from rootMargin: a
        // wipe clips its own box to nothing, so any ratio above zero would
        // never be met and the element would sit invisible forever.
        threshold: 0,
        // Bottom is trimmed so things enter just after they cross into view.
        // The top is opened up far beyond any page height so that anything
        // already scrolled past counts as intersecting — otherwise a jump
        // (a deep link, restored scroll, End key) leaves every section it
        // skipped permanently invisible.
        rootMargin: "100000px 0px -12% 0px",
      },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [root]);
}
