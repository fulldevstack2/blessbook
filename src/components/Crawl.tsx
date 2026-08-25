import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A line of text that travels when it does not fit, and sits still when it does.
 *
 * The reference is a hi-fi front panel, not a ticker on a shopfront. That
 * distinction is the whole design: a marquee that runs for its own sake is the
 * cheapest thing on a page — this site threw one out of the billing band for
 * exactly that reason — but a panel that scrolls a name too long for its window
 * is what every good amplifier ever made has done, and it is doing it because
 * there is no other way to show you the whole name.
 *
 * It travels **one way**. It went out and came back at first, and a reversal is
 * the tell of a cheap marquee: the eye is dragged backwards through text it has
 * already read, and the turn at each end has a visible flinch in it. One
 * direction, seamlessly — the line is set twice with a gap between, and the
 * track moves by exactly one copy plus that gap, so the moment it would jump is
 * the moment the second copy is standing precisely where the first began. There
 * is no jump to see.
 *
 * And it waits. Nothing moves until the plaque has finished turning and has been
 * still for a beat, because a panel that starts scrolling while the card is
 * still in the air is two movements fighting. Constant speed whatever the
 * length; stops dead when the music does; text that fits never moves at all.
 *
 * CSS cannot ask whether text overflows, so the measuring is here. Re-measured
 * when the box changes size and once the real fonts have landed, because a title
 * measured in Times and then set in Italiana is measured wrong.
 */

/** The space between the end of one copy and the start of the next. */
const GAP = 56;

export function Crawl({
  children,
  className,
  /** Pixels per second. Slow: this is a panel, not a headline. */
  speed = 24,
  /** Held still unless this is true — the plaque passes its playing state. */
  running = true,
  /** Long enough for the card to have finished turning and settled. */
  delay = 2200,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  running?: boolean;
  delay?: number;
}) {
  const frame = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [over, setOver] = useState(false);
  const [by, setBy] = useState(0);

  useEffect(() => {
    const box = frame.current;
    const inner = line.current;
    if (!box || !inner) return;

    const measure = () => {
      const width = inner.getBoundingClientRect().width;
      const spare = width - box.clientWidth;
      setOver(spare > 2);
      // One copy plus the gap: the distance at which the second copy is exactly
      // where the first started, which is what makes the loop seamless.
      setBy(spare > 2 ? Math.ceil(width + GAP) : 0);
    };

    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(box);
    watch.observe(inner);
    // A title measured in the fallback face and then set in the real one is
    // measured wrong, so it is measured again once the real one has landed.
    void document.fonts?.ready.then(measure).catch(() => undefined);

    return () => watch.disconnect();
  }, [children]);

  return (
    <span
      className={`crawl ${className ?? ""}`}
      ref={frame}
      data-over={over}
      data-running={over && running}
      style={
        over
          ? ({
              "--crawl-by": `${by}px`,
              "--crawl-gap": `${GAP}px`,
              // Constant speed: a long line takes longer, it does not go faster.
              "--crawl-for": `${(by / speed).toFixed(2)}s`,
              "--crawl-wait": `${delay}ms`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <span className="crawl-track">
        <span className="crawl-line" ref={line}>
          {children}
        </span>
        {/* The second copy exists only to be in the right place when the first
            runs out, so it is furniture as far as a reader is concerned. */}
        {over ? (
          <span className="crawl-line" aria-hidden>
            {children}
          </span>
        ) : null}
      </span>
    </span>
  );
}
