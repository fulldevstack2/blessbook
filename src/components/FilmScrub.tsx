import { useEffect, useRef, type RefObject } from "react";
import { ScrollStage } from "../lib/ScrollStage";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

/**
 * His own footage, scrubbed by the scroll.
 *
 * This is the one device every scroll site people call world-class has in common,
 * and here it is not a gimmick borrowed from those sites: the frames are him
 * playing. Scrolling moves his bow. On Dragon it is the silhouette against the
 * sky, on Phoenix the beams sweeping a three-thousand-seat hall, on Chosen the
 * gold violin turning on its own reflection.
 *
 * Mechanics: the frames are a numbered JPEG sequence, decoded into memory only
 * when the section is close, then drawn to a canvas at whatever frame the scroll
 * is pointing at. Nothing streams, nothing seeks, nothing depends on a video
 * element's frame-accuracy — which is exactly why sites do it this way.
 *
 * Under reduced motion it holds the middle frame and does not load the rest.
 */

interface Beat {
  readonly mark: string;
  readonly line: string;
}

interface FilmScrubProps {
  /** Directory under public/scrub, e.g. "phoenix". */
  readonly sequence: string;
  /** How many frames are on disk, numbered 001.jpg upward. */
  readonly frames: number;
  readonly label: string;
  /** Length of the scroll track, in viewport heights. */
  readonly vh?: number;
  readonly className?: string;
  readonly beats?: readonly Beat[];
}

function useScrubber(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  progress: RefObject<number>,
  sequence: string,
  frames: number,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = prefersReducedMotion();
    const images: (HTMLImageElement | undefined)[] = new Array(frames);
    let stopped = false;
    let ready = false;
    let raf = 0;
    let drawn = -1;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const url = (index: number) =>
      `${import.meta.env.BASE_URL}scrub/${sequence}/${String(index + 1).padStart(3, "0")}.jpg`;

    const load = (index: number) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          images[index] = image;
          resolve();
        };
        image.onerror = () => resolve();
        image.src = url(index);
      });

    /** Nearest already-loaded frame, so an early scroll never draws nothing. */
    const nearest = (index: number) => {
      for (let step = 0; step < frames; step += 1) {
        const before = images[index - step];
        if (before) return before;
        const after = images[index + step];
        if (after) return after;
      }
      return undefined;
    };

    const size = () => {
      const box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
      drawn = -1;
    };

    const context = canvas.getContext("2d", { alpha: false });

    const paint = (index: number) => {
      const image = images[index] ?? nearest(index);
      if (!context || !image) return;
      const { width, height } = canvas;
      // Cover-fit: fill the frame, never letterbox, never squash.
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
      drawn = index;
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!ready) return;
      const index = Math.min(frames - 1, Math.max(0, Math.round(progress.current * (frames - 1))));
      if (index !== drawn) paint(index);
    };

    size();
    const observer = new ResizeObserver(size);
    observer.observe(canvas);

    /* The first frame comes first.
       This used to fetch the middle frame first so that something was on screen
       immediately, and the result was that an early scroll drew a frame from the
       middle of the shot and then jumped backwards once the real one arrived. The
       sequence now loads in order from the top, the loop does not draw until
       frame one is in, and playback is smooth from the first pixel of scroll. */
    void (async () => {
      await load(0);
      paint(0);
      ready = true;
      if (reduced) return;
      for (let i = 1; i < frames && !stopped; i += 1) {
        if (!images[i]) await load(i);
      }
    })();

    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [canvasRef, progress, sequence, frames]);
}

function Frames({
  progress,
  sequence,
  frames,
  label,
}: {
  progress: RefObject<number>;
  sequence: string;
  frames: number;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useScrubber(canvasRef, progress, sequence, frames);

  return <canvas className="scrub-canvas" ref={canvasRef} role="img" aria-label={label} />;
}

export function FilmScrub({
  sequence,
  frames,
  label,
  vh = 340,
  className,
  beats = [],
}: FilmScrubProps) {
  return (
    <ScrollStage vh={vh} cuts={Math.max(1, beats.length)} className={`scrub ${className ?? ""}`}>
      {({ stage, progress }) => (
        <>
          <Frames progress={progress} sequence={sequence} frames={frames} label={label} />
          {beats.length > 0 ? (
            <div className="scrub-beats">
              {beats.map((beat, index) => (
                <div className="scrub-beat" key={beat.mark} data-active={stage === index}>
                  <span className="scrub-mark">{beat.mark}</span>
                  <p className="scrub-line">{beat.line}</p>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </ScrollStage>
  );
}
