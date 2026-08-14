import { useEffect, useRef } from "react";

/**
 * A stave down the margin, with a notehead riding it as the page goes past.
 *
 * The site's structure is already musical — movements, plates, a coda — but there
 * was nothing telling you where in the piece you were. This is that: five
 * hairlines, and a head that travels from the first bar to the last as you read.
 * It is the quietest possible progress indicator and the only one that belongs on
 * a musician's site.
 *
 * Desktop only, because it needs a margin to live in, and it writes its position
 * straight to a custom property so scrolling never re-renders anything.
 */

export function ScoreRail() {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      const progress = travel > 0 ? window.scrollY / travel : 0;
      element.style.setProperty("--page", Math.min(1, Math.max(0, progress)).toFixed(4));
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
    };
  }, []);

  return (
    <div className="rail" ref={rail} aria-hidden>
      <div className="rail-staff">
        {[0, 1, 2, 3, 4].map((line) => (
          <span className="rail-line" key={line} />
        ))}
      </div>
      <span className="rail-head" />
    </div>
  );
}
