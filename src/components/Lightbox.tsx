import { useEffect, useRef, useState } from "react";
import type { Work } from "../content/work";
import { pauseAll } from "../lib/listening";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

/**
 * A work, at the size it was made to be watched.
 *
 * The grid used to play each film inside its own card, which is honest about
 * what is loading and hopeless as an experience: two hundred and sixty pixels
 * across is a thumbnail with sound. This takes the pressed card and opens it,
 * and the *opening* is the point — the poster does not fade out here and fade in
 * there, it travels. The stage is rendered where it will end up, then pushed back
 * onto the card's own rectangle and released, so what you watch is the object you
 * pressed growing into the room. That is a FLIP: measure last, invert to first,
 * play. It costs two rectangles and a transform.
 *
 * Everything else is the part a lightbox gets wrong. The page behind it stops
 * scrolling and does not shift while it does — the scrollbar's width is paid
 * back as padding, or the whole site jumps sideways as the overlay opens. Focus
 * moves in, is held in, and is given back to the card it came from. Escape and
 * the backdrop both close it. Whatever this site was playing is hushed first,
 * because an embed cannot be metered or faded.
 *
 * Each concept mounts it in its own frame; see `.lightbox` in the three
 * stylesheets.
 */

interface LightboxProps {
  readonly work: Work | null;
  /** Where it came from, so it can travel from there and back to it. */
  readonly from: DOMRect | null;
  readonly onClose: () => void;
}

export function Lightbox({ work, from, onClose }: LightboxProps) {
  const stage = useRef<HTMLDivElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  /** Set once the travel has finished, which is when the embed is allowed in. */
  const [arrived, setArrived] = useState(false);

  /* The travel. Measured after layout and applied before paint, so the stage is
     never seen at its final size before it has grown into it. */
  useEffect(() => {
    if (!work) {
      setArrived(false);
      return;
    }
    const element = stage.current;
    if (!element) return;

    if (prefersReducedMotion() || !from) {
      setArrived(true);
      return;
    }

    const to = element.getBoundingClientRect();
    if (to.width === 0 || to.height === 0) {
      setArrived(true);
      return;
    }

    const scaleX = from.width / to.width;
    const scaleY = from.height / to.height;
    const shiftX = from.left + from.width / 2 - (to.left + to.width / 2);
    const shiftY = from.top + from.height / 2 - (to.top + to.height / 2);

    element.style.transition = "none";
    element.style.transformOrigin = "center";
    element.style.transform = `translate(${shiftX}px, ${shiftY}px) scale(${scaleX}, ${scaleY})`;

    let done = 0;
    const play = requestAnimationFrame(() => {
      element.style.transition = "transform 720ms cubic-bezier(0.16, 1, 0.3, 1)";
      element.style.transform = "none";
      // The embed waits for the travel: a video starting mid-flight is a video
      // being scaled by the compositor, which is exactly what it looks like.
      done = window.setTimeout(() => setArrived(true), 740);
    });

    return () => {
      cancelAnimationFrame(play);
      window.clearTimeout(done);
    };
  }, [work, from]);

  /* The page holds still behind it, and does not shift as it does. */
  useEffect(() => {
    if (!work) return;
    const root = document.documentElement;
    const gap = window.innerWidth - root.clientWidth;
    const scroll = root.style.overflow;
    const pad = document.body.style.paddingRight;
    root.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      root.style.overflow = scroll;
      document.body.style.paddingRight = pad;
    };
  }, [work]);

  /* Focus goes in, stays in, and is handed back. */
  useEffect(() => {
    if (!work) return;
    const came = document.activeElement as HTMLElement | null;
    shut.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const inside = overlay.current?.querySelectorAll<HTMLElement>(
        'button, [href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!inside || inside.length === 0) return;
      const first = inside[0] as HTMLElement;
      const last = inside[inside.length - 1] as HTMLElement;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      came?.focus?.();
    };
  }, [work, onClose]);

  /* An embed cannot be metered or faded, so ours stops before theirs starts. */
  useEffect(() => {
    if (work) pauseAll();
  }, [work]);

  if (!work) return null;

  return (
    <div
      className="lightbox"
      ref={overlay}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      {/* The scrim is the way out, and says so by being pressable. */}
      <button
        type="button"
        className="lightbox-scrim"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
      />

      <div className="lightbox-stage" ref={stage}>
        <div className="lightbox-frame">
          {arrived ? (
            <iframe
              className="lightbox-media"
              src={work.embed}
              title={work.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : work.poster ? (
            /* The poster is what travels — the same picture that was on the card,
               so the object is continuous rather than swapped. */
            <img src={work.poster} width={640} height={360} alt="" />
          ) : (
            <span className="lightbox-plate" aria-hidden>
              {work.title}
            </span>
          )}
        </div>

        <div className="lightbox-say">
          <div>
            <h3 className="lightbox-title">{work.title}</h3>
            <p className="lightbox-note">{work.note}</p>
          </div>
          <a
            className="lightbox-on"
            href={work.href}
            rel="noreferrer noopener"
            target="_blank"
          >
            Open on {work.on}
          </a>
        </div>
      </div>

      <button type="button" className="lightbox-shut" ref={shut} onClick={onClose}>
        <span className="lightbox-shut-mark" aria-hidden />
        <span className="lightbox-shut-word">Close</span>
      </button>
    </div>
  );
}
