import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { concepts, type Concept } from "../concepts/registry";

/**
 * Structure shared by all three concepts. The markup is identical so the
 * comparison is fair; each concept's stylesheet does the rest.
 */

export function ConceptChrome({ concept }: { concept: Concept }) {
  const bar = useRef<HTMLElement>(null);
  /* Which of the concept's two pages this is. The bar carries the way to the
     other one, so the crossing lives in a single place for all six pages rather
     than being pasted into the foot of each. */
  const onStory = useLocation().pathname === concept.story;

  /**
   * The bar leaves while you are reading and comes back the moment you turn
   * around. It used to sit there permanently behind a gradient scrim, and the
   * scrim was the thing that looked cheap — a fixed element with a shade under it
   * always does. Nothing to fade now: it is either present or gone.
   */
  useEffect(() => {
    const element = bar.current;
    if (!element) return;

    let last = window.scrollY;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = window.scrollY;
      if (y < window.innerHeight * 0.5 || y < last - 6) {
        element.dataset.hidden = "false";
      } else if (y > last + 6) {
        element.dataset.hidden = "true";
      }
      last = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="chrome" ref={bar} data-hidden="false">
      <Link className="chrome-back" to="/">
        <span aria-hidden>&larr;</span> All three
      </Link>
      <p className="chrome-title">
        <span className="chrome-ordinal">{concept.ordinal}</span>
        <span className="chrome-name">{concept.name}</span>
        <span className="chrome-tag">{concept.tagline}</span>
      </p>
      <Link className="chrome-cross" to={onStory ? concept.path : concept.story}>
        {onStory ? (
          <>
            The work <span aria-hidden>&rarr;</span>
          </>
        ) : (
          <>
            <span className="chrome-cross-wide">The man behind the music</span>
            <span className="chrome-cross-narrow">The man</span>{" "}
            <span aria-hidden>&rarr;</span>
          </>
        )}
      </Link>
    </header>
  );
}

export function ConceptSwitch({ concept }: { concept: Concept }) {
  const others = concepts.filter((c) => c.id !== concept.id);

  return (
    <nav className="switch" aria-label="Other design concepts">
      <p className="switch-lede">The same commission, designed two other ways</p>
      <ul className="switch-list">
        {others.map((other) => (
          <li key={other.id}>
            <Link className="switch-item" to={other.path}>
              <span className="switch-ordinal">{other.ordinal}</span>
              <span className="switch-name">{other.name}</span>
              <span className="switch-tag">{other.tagline}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
