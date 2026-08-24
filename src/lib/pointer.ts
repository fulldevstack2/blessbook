import { useEffect, useState } from "react";

/**
 * Is this a mouse, or a finger?
 *
 * It decides which of two pickers a field uses, and the reason is worth stating
 * because "build it once" is usually the right answer and here it is not. On a
 * desktop the browser's own dropdown is operating-system chrome — white group
 * bars, a system-blue highlight, its own scrollbar — and it lands in the middle
 * of a page that has been built to the last hairline. On a phone the same
 * control is not a dropdown at all: it is a full-height sheet the OS draws
 * *over* the page, with a scroll wheel and a search field, and nobody expects
 * that to match a website. Replacing it with a div would be a downgrade dressed
 * as an improvement.
 *
 * So: a drawn listbox where there is a pointer, the platform's own where there
 * is a thumb.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(query.matches);
    const onChange = (event: MediaQueryListEvent) => setFine(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return fine;
}

/**
 * Which way a pane should open.
 *
 * A pane that always drops downward runs off the bottom of the screen when its
 * field is near the foot of the viewport — which is exactly where the last
 * question in a part sits. So it measures: down if there is room, up if there is
 * not and there is room above. Measured after the pane has rendered, because
 * its height is the thing being tested.
 */
export function useOpenDirection(
  anchor: React.RefObject<HTMLElement | null>,
  pane: React.RefObject<HTMLElement | null>,
  open: boolean,
): "down" | "up" {
  const [way, setWay] = useState<"down" | "up">("down");

  useEffect(() => {
    if (!open) {
      setWay("down");
      return;
    }
    const decide = () => {
      const box = anchor.current?.getBoundingClientRect();
      const height = pane.current?.offsetHeight ?? 0;
      if (!box || height === 0) return;
      const below = window.innerHeight - box.bottom;
      const above = box.top;
      setWay(below < height + 16 && above > below ? "up" : "down");
    };
    decide();
    window.addEventListener("resize", decide);
    window.addEventListener("scroll", decide, { passive: true });
    return () => {
      window.removeEventListener("resize", decide);
      window.removeEventListener("scroll", decide);
    };
  }, [anchor, pane, open]);

  return way;
}
