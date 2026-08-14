import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

/**
 * A brass ring where the pointer is, and the lamp follows it.
 *
 * Borrowed from the award sites — nearly all of them replace the cursor — but
 * kept quiet: a hairline ring that trails slightly behind the real pointer and
 * opens when it is over something you can press. The system cursor stays visible
 * underneath, because hiding it is a usability tax that a ring does not pay for.
 *
 * Fine pointers only, and never under reduced motion.
 */

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ring.current;
    if (!element) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let frame = 0;

    const step = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      const over = (event.target as Element | null)?.closest?.("a, button, [role='button'], input");
      element.dataset.over = over ? "true" : "false";
    };

    element.dataset.ready = "true";
    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <div className="cursor" ref={ring} aria-hidden />;
}
