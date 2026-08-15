import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export interface StageState {
  /** Index of the current narrative cut, 0 … cuts - 1. */
  readonly stage: number;
  /** Live 0 → 1 scroll progress. Read inside animation frames, not during render. */
  readonly progress: RefObject<number>;
}

interface ScrollStageProps {
  /** Length of the scroll track, in viewport heights. */
  vh: number;
  /** How many discrete cuts the pinned frame is divided into. */
  cuts: number;
  className?: string;
  children: (state: StageState) => ReactNode;
}

/**
 * A tall scroll track with a pinned, viewport-height frame. Scroll position is
 * published three ways: as a `--p` custom property for CSS, as `--cut` for the
 * same thing measured within the current cut, and as a ref for the animation
 * loop. Only the discrete cut index goes through React state, so scrolling does
 * not re-render the tree on every frame.
 */
export function ScrollStage({ vh, cuts, className, children }: ScrollStageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const raw = travel > 0 ? -rect.top / travel : 0;
      const p = Math.min(1, Math.max(0, raw));

      progress.current = p;
      pin.style.setProperty("--p", p.toFixed(4));

      const next = Math.min(cuts - 1, Math.floor(p * cuts));
      /* Progress through the current cut, for the parts that should move once
         per cut rather than once across the whole track: a caption on a section
         that shows three objects has something new to say about each of them,
         and reading `--p` would have it leave after the first. */
      const within = Math.min(1, Math.max(0, p * cuts - next));
      pin.style.setProperty("--cut", within.toFixed(4));

      setStage((current) => (current === next ? current : next));
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
  }, [cuts]);

  return (
    <div ref={trackRef} className="stage-track" style={{ height: `${vh}vh` }}>
      <div ref={pinRef} className={`stage-pin ${className ?? ""}`} data-stage={stage}>
        {children({ stage, progress })}
      </div>
    </div>
  );
}
