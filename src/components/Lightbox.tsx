import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
 *
 * It takes a shape rather than a type, so the three featured films and the
 * fourteen in the catalogue both go through it — they are the same thing seen at
 * two sizes, and there is no reason for one of them to be watched in a box.
 */

export interface Screening {
  readonly id: string;
  readonly title: string;
  readonly note: string;
  /** What the frame loads, and only once a reader has asked for it. */
  readonly embed: string;
  /** The page it lives on, for opening it there instead. */
  readonly href: string;
  readonly on: string;
  /** Served from this site. Absent where the platform gives no usable frame. */
  readonly poster?: string | undefined;
}

interface LightboxProps {
  readonly work: Screening | null;
  /** Where it came from, so it can travel from there and back to it. */
  readonly from: DOMRect | null;
  readonly onClose: () => void;
}

/**
 * The plumbing, so four places do not each keep their own copy of it: what is
 * open, the rectangle it came out of, and the two calls.
 */
export function useLightbox() {
  const [work, setWork] = useState<Screening | null>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);

  const show = useCallback((next: Screening, event: { currentTarget: Element }) => {
    setFrom(event.currentTarget.getBoundingClientRect());
    setWork(next);
  }, []);

  const hide = useCallback(() => setWork(null), []);

  return { work, from, show, hide };
}

/** How long the stage takes to go back where it came from. */
const LEAVING = 520;

export function Lightbox({ work, from, onClose }: LightboxProps) {
  const stage = useRef<HTMLDivElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  /** Set once the travel has finished, which is when the embed is allowed in. */
  const [arrived, setArrived] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const cameFrom = useRef<DOMRect | null>(from);
  /** Escape pressed twice should not start two exits. */
  const going = useRef(false);

  useEffect(() => {
    if (!work) return;
    cameFrom.current = from;
    going.current = false;
    setLeaving(false);
  }, [work, from]);

  /**
   * Leave, and travel back to the card on the way.
   *
   * Imperative, and in the same call stack as the press — which is the whole
   * point of it. Routing this through state (ask to close, re-render, decide in
   * an effect, re-render, apply the transform in another effect) put two React
   * passes between the click and the movement, and it measured as the exit
   * simply not happening: the stage still carried the *entry* transition inline
   * when the handler returned. Nothing here waits for a render.
   */
  const leave = useCallback(() => {
    if (going.current) return;
    going.current = true;

    const element = stage.current;
    const start = cameFrom.current;
    if (!element || !start || prefersReducedMotion()) {
      onClose();
      return;
    }

    // At rest the stage carries no transform, so this is its true box.
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) {
      onClose();
      return;
    }

    const scaleX = start.width / box.width;
    const scaleY = start.height / box.height;
    const shiftX = start.left + start.width / 2 - (box.left + box.width / 2);
    const shiftY = start.top + start.height / 2 - (box.top + box.height / 2);

    /* Moves immediately and settles into the card. An earlier attempt used a
       hard ease-in, which held the stage at full size for four fifths of the
       duration and then snatched it away — measured, not guessed. Closing should
       be decisive, not deferred. */
    element.style.transition = `transform ${LEAVING}ms cubic-bezier(0.32, 0, 0.24, 1)`;
    element.style.transform = `translate(${shiftX}px, ${shiftY}px) scale(${scaleX}, ${scaleY})`;

    setLeaving(true);

    /* And only now the embed goes, two frames on. Pulling a cross-origin iframe
       out of the document blocks the main thread for something like a tenth of a
       second; a transform transition runs on the compositor and is immune to
       that — but only once the frame carrying it has actually been painted, which
       is why it is two frames and not one. Start the movement, then break the
       thing that costs. */
    requestAnimationFrame(() => requestAnimationFrame(() => setArrived(false)));
    window.setTimeout(onClose, LEAVING);
  }, [onClose]);

  /* The travel, both ways, off one measurement.
   *
   * Out: the stage is rendered where it will end up, pushed back onto the card's
   * rectangle, and released. Back: the same transform, applied the other way
   * round — so it returns to the card it came out of rather than blinking off.
   * `useLayoutEffect`, not `useEffect`, and that is the difference between a
   * travel and a lurch: the ordinary effect runs *after* the browser has
   * painted, so the stage was held at full size for a frame or two before the
   * transform landed — measured at about 150ms of stillness at the head of a
   * 520ms exit. Laid out before paint, it moves on the first frame. */
  useLayoutEffect(() => {
    if (!work) {
      setArrived(false);
      return;
    }
    const element = stage.current;
    if (!element) return;

    const start = from;
    if (prefersReducedMotion() || !start) {
      setArrived(true);
      return;
    }

    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) {
      setArrived(true);
      return;
    }

    const scaleX = start.width / box.width;
    const scaleY = start.height / box.height;
    const shiftX = start.left + start.width / 2 - (box.left + box.width / 2);
    const shiftY = start.top + start.height / 2 - (box.top + box.height / 2);
    const onto = `translate(${shiftX}px, ${shiftY}px) scale(${scaleX}, ${scaleY})`;

    element.style.transition = "none";
    element.style.transformOrigin = "center";
    element.style.transform = onto;

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

  /* The page holds still behind it, and does not shift as it does. Keyed on
     what is on screen, so it stays locked through the exit rather than letting
     the page scroll under a stage that is still travelling. */
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
        leave();
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
  }, [work, leave]);

  /* An embed cannot be metered or faded, so ours stops before theirs starts. */
  useEffect(() => {
    if (work) pauseAll();
  }, [work]);

  if (!work) return null;

  return (
    <div
      className="lightbox"
      ref={overlay}
      data-leaving={leaving}
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
        onClick={leave}
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

      <button type="button" className="lightbox-shut" ref={shut} onClick={leave}>
        <span className="lightbox-shut-mark" aria-hidden />
        <span className="lightbox-shut-word">Close</span>
      </button>
    </div>
  );
}
