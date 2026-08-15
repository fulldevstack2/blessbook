import { useEffect, useRef, type RefObject } from "react";
import { ScrollStage } from "../lib/ScrollStage";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

/**
 * His own footage, scrubbed by the scroll.
 *
 * This is the one device every scroll site people call world-class has in common,
 * and here it is not a gimmick borrowed from those sites: the frames are him
 * playing. Scrolling moves his bow. On Dragon it is the silhouette against the
 * sky, on Phoenix the beams sweeping a three-thousand-seat hall, on Nocturne the
 * gold violin turning on its own reflection.
 *
 * Two things are worth understanding before touching this.
 *
 * **Two sizes on disk.** A canvas only ever needs its own backing store: a 1440
 * viewport at 2x wants about 2880 pixels across, a phone wants about 800. The
 * restored frames are published at 2560 (`/hi`) and 1280 (`/sm`) and the tier is
 * chosen once, on mount, from the viewport.
 *
 * **Decoded frames are held in a window, not all at once.** Eighty-seven frames
 * at 2560 wide is 1.6 GB of bitmap if they are all kept alive, which is how a
 * beautiful scroll section becomes the reason a laptop fan comes on. Every frame
 * is fetched once and kept as an encoded blob, which is cheap; only the frames
 * near the playhead are decoded, and the furthest one is closed when the window
 * is full. Measured, this holds the section at roughly the memory the old
 * 1600-pixel sequence used while carrying two and a half times the pixels.
 *
 * Under reduced motion it holds the first frame and fetches nothing else.
 */

interface Beat {
  readonly mark: string;
  readonly line: string;
}

interface FilmScrubProps {
  /** Directory under public/scrub, e.g. "phoenix". */
  readonly sequence: string;
  /** How many frames are on disk, numbered 001 upward. */
  readonly frames: number;
  readonly label: string;
  /** Length of the scroll track, in viewport heights. */
  readonly vh?: number;
  readonly className?: string;
  readonly beats?: readonly Beat[];
  /**
   * Which part of the frame's width to keep when the canvas is narrower than the
   * footage, 0 is the left edge and 1 the right. It matters on a phone: Dragon's
   * sequence is 2.37 to 1 and he stands at the left of it, so a centred crop
   * keeps a column of sky and loses the man.
   */
  readonly focus?: number;
}

/** How many decoded frames stay resident. */
const RESIDENT = 30;
/** How far either side of the playhead to decode ahead of being asked. */
const REACH = 10;

function useScrubber(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  progress: RefObject<number>,
  sequence: string,
  frames: number,
  focus: number,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = prefersReducedMotion();
    const blobs: (Blob | undefined)[] = new Array(frames);
    const bitmaps = new Map<number, ImageBitmap>();
    const pending = new Set<number>();

    let stopped = false;
    let ready = false;
    let raf = 0;
    let drawn = -1;
    /* Whether what is on screen is the frame that was asked for, or a neighbour
       standing in until it decodes. Without this the substitute would never be
       replaced, because `drawn` records the index we wanted either way. */
    let drawnExact = false;
    let want = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // The tier is fixed for the life of the section: swapping mid-scroll would
    // throw away every decoded frame to gain nothing anybody can see.
    const tier =
      window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1500 ? "hi" : "sm";

    const url = (index: number) =>
      `${import.meta.env.BASE_URL}scrub/${sequence}/${tier}/${String(index + 1).padStart(3, "0")}.webp`;

    const fetchFrame = async (index: number) => {
      if (blobs[index] || index < 0 || index >= frames) return;
      try {
        const response = await fetch(url(index));
        if (response.ok) blobs[index] = await response.blob();
      } catch {
        // A missing frame is survivable: the nearest one is drawn instead.
      }
    };

    /** Drop the resident frames furthest from where the reader is. */
    const evict = () => {
      if (bitmaps.size <= RESIDENT) return;
      const furthest = [...bitmaps.keys()].sort(
        (a, b) => Math.abs(b - want) - Math.abs(a - want),
      );
      while (bitmaps.size > RESIDENT) {
        const drop = furthest.shift();
        if (drop === undefined) break;
        bitmaps.get(drop)?.close();
        bitmaps.delete(drop);
      }
    };

    /* Synchronous guard, async body: this is called about twenty times per
       animation frame, and an async function would allocate a promise on every
       one of those calls just to fall straight through the first check. */
    const decode = (index: number) => {
      if (index < 0 || index >= frames) return;
      if (bitmaps.has(index) || pending.has(index)) return;
      pending.add(index);

      void (async () => {
        try {
          await fetchFrame(index);
          const blob = blobs[index];
          if (!blob || stopped) return;
          const bitmap = await createImageBitmap(blob);
          if (stopped) {
            bitmap.close();
            return;
          }
          bitmaps.set(index, bitmap);
          evict();
        } catch {
          // Decode failures are not worth breaking the scroll over.
        } finally {
          pending.delete(index);
        }
      })();
    };

    /** Nearest frame already decoded, so an early scroll never draws nothing. */
    const nearest = (index: number) => {
      for (let step = 0; step < frames; step += 1) {
        const before = bitmaps.get(index - step);
        if (before) return before;
        const after = bitmaps.get(index + step);
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
      const exact = bitmaps.get(index);
      const bitmap = exact ?? nearest(index);
      if (!context || !bitmap) return;
      const { width, height } = canvas;
      // Cover-fit: fill the frame, never letterbox, never squash.
      const scale = Math.max(width / bitmap.width, height / bitmap.height);
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      // Overflow is negative; `focus` decides which part of it is given away.
      context.drawImage(bitmap, (width - w) * focus, (height - h) / 2, w, h);
      drawn = index;
      drawnExact = Boolean(exact);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!ready) return;

      const index = Math.min(frames - 1, Math.max(0, Math.round(progress.current * (frames - 1))));
      want = index;

      decode(index);
      // Ahead and behind, so a flick in either direction has somewhere to land.
      for (let step = 1; step <= REACH; step += 1) {
        decode(index + step);
        decode(index - step);
      }

      if (index !== drawn || !drawnExact) paint(index);
    };

    size();
    const observer = new ResizeObserver(size);
    observer.observe(canvas);

    /* The first frame comes first.
       This used to fetch the middle frame first so that something was on screen
       immediately, and the result was that an early scroll drew a frame from the
       middle of the shot and then jumped backwards once the real one arrived. The
       sequence starts at the top, the loop does not draw until frame one is in,
       and playback is smooth from the first pixel of scroll. */
    void (async () => {
      decode(0);
      /* Frame one is worth waiting for: it is the one the reader arrives on.
         But not forever. Waiting unconditionally means one unreadable file
         leaves the whole section black, because the loop never starts and never
         asks for anything else. */
      for (let waited = 0; waited < 3000 && !bitmaps.has(0) && !stopped; waited += 40) {
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      paint(0);
      ready = true;
      if (reduced) return;
      // Pull the rest down in order. Encoded blobs are cheap to hold; it is the
      // decoding that costs, and that stays inside the window above.
      for (let i = 1; i < frames && !stopped; i += 1) {
        await fetchFrame(i);
      }
    })();

    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      for (const bitmap of bitmaps.values()) bitmap.close();
      bitmaps.clear();
    };
  }, [canvasRef, progress, sequence, frames, focus]);
}

function Frames({
  progress,
  sequence,
  frames,
  label,
  focus,
}: {
  progress: RefObject<number>;
  sequence: string;
  frames: number;
  label: string;
  focus: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useScrubber(canvasRef, progress, sequence, frames, focus);

  return <canvas className="scrub-canvas" ref={canvasRef} role="img" aria-label={label} />;
}

export function FilmScrub({
  sequence,
  frames,
  label,
  vh = 340,
  className,
  beats = [],
  focus = 0.5,
}: FilmScrubProps) {
  return (
    <ScrollStage vh={vh} cuts={Math.max(1, beats.length)} className={`scrub ${className ?? ""}`}>
      {({ stage, progress }) => (
        <>
          <Frames
            progress={progress}
            sequence={sequence}
            frames={frames}
            label={label}
            focus={focus}
          />
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
