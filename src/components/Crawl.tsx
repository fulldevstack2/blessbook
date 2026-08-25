import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A line of text that travels when it does not fit, and sits still when it does.
 *
 * The reference is a hi-fi front panel, not a ticker on a shopfront. That
 * distinction is the whole design: a marquee that runs for its own sake is the
 * cheapest thing on a page — this site threw one out of the billing band for
 * exactly that reason — but a panel that scrolls a title too long for its window
 * is what every good amplifier ever made has done, and it is doing it because
 * there is no other way to show you the whole name.
 *
 * So it only moves when it has to, it waits at both ends rather than looping
 * continuously, it travels at a constant speed whatever the length, and it stops
 * dead when the music does. Nothing that fits ever moves at all.
 *
 * CSS cannot ask whether text overflows, so the measuring is here: the distance
 * is written out as a custom property and the animation is a plain keyframe over
 * it. Re-measured when the box changes size and once the real fonts have landed,
 * because a title measured in Times and then set in Italiana is measured wrong.
 */

export function Crawl({
  children,
  className,
  /** Pixels per second. Slow: this is a panel, not a headline. */
  speed = 22,
  /** Held still unless this is true — the plaque passes its playing state. */
  running = true,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  running?: boolean;
}) {
  const window_ = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [over, setOver] = useState(0);

  useEffect(() => {
    const frame = window_.current;
    const inner = line.current;
    if (!frame || !inner) return;

    const measure = () => {
      // scrollWidth on the frame rather than the line's own width: the line is
      // inline and its box is what the frame is being asked to hold.
      const spare = inner.scrollWidth - frame.clientWidth;
      setOver(spare > 2 ? Math.ceil(spare) : 0);
    };

    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(frame);
    watch.observe(inner);
    // A title measured in the fallback face and then set in the real one is
    // measured wrong, so it is measured again once the real one has landed.
    void document.fonts?.ready.then(measure).catch(() => undefined);

    return () => watch.disconnect();
  }, [children]);

  return (
    <span
      className={`crawl ${className ?? ""}`}
      ref={window_}
      data-over={over > 0}
      data-running={over > 0 && running}
      style={
        over > 0
          ? ({
              "--crawl-by": `${over}px`,
              // Constant speed: a long title takes longer, it does not go faster.
              "--crawl-for": `${(over / speed).toFixed(2)}s`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <span className="crawl-line" ref={line}>
        {children}
      </span>
    </span>
  );
}
