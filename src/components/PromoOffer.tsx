import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { introOffer, whatsapp } from "../content/site";
import { photos } from "../content/media";

/**
 * A single introductory offer, shown once per browser until dismissed —
 * the same contract as a course landing popup, but set like everything else
 * here: lacquer, one gold hairline, and the instrument itself emerging from
 * the dark. A short phrase on a hairline staff plays in, note by note, the
 * way the offer itself is a first phrase of a longer piece.
 */

/** One engraved note: a tilted head and its stem, struck in gold. */
function Note({ x, y, index }: { x: number; y: number; index: number }) {
  return (
    <g className="promo-note" style={{ "--n": index } as CSSProperties}>
      <ellipse cx={x} cy={y} rx="4.4" ry="3.2" transform={`rotate(-16 ${x} ${y})`} />
      <path d={`M ${x + 3.9} ${y - 1.2} V ${y - 21}`} />
    </g>
  );
}

/** A short phrase on five hairlines. Drawn, not imported. */
function Phrase() {
  return (
    <svg className="promo-phrase" viewBox="0 0 300 56" aria-hidden="true">
      <g className="promo-phrase-staff">
        {[0, 1, 2, 3, 4].map((line) => (
          <line key={line} x1="0" x2="300" y1={10 + line * 9} y2={10 + line * 9} />
        ))}
      </g>
      <Note x={26} y={37} index={0} />
      <Note x={72} y={28} index={1} />
      <Note x={118} y={23.5} index={2} />
      <Note x={164} y={32.5} index={3} />
      {/* A beamed pair to close the phrase. */}
      <g className="promo-note" style={{ "--n": 4 } as CSSProperties}>
        <ellipse cx={222} cy={28} rx="4.4" ry="3.2" transform="rotate(-16 222 28)" />
        <path d="M 225.9 26.8 V 7.5" />
        <ellipse cx={258} cy={32.5} rx="4.4" ry="3.2" transform="rotate(-16 258 32.5)" />
        <path d="M 261.9 31.3 V 12" />
        <path className="promo-beam" d="M 225.4 7 L 262.4 11.5 L 262.4 15 L 225.4 10.5 Z" />
      </g>
    </svg>
  );
}

/** Session-scoped: a fresh visit gets the offer fresh. */
const ANSWERED = "blessbook:offer-answered";

export function PromoOffer() {
  const { pathname, state } = useLocation();
  const [open, setOpen] = useState(false);

  /* A navigation that carries an arrival intent is a journey the reader chose
     — the corner plate walking them to the commission, the offer's own
     button walking them to the packages. The offer does not interrupt a
     journey; it waits for the next ordinary page. */
  const onAMission =
    state !== null && typeof state === "object" && "arrive" in (state as object);

  /* Dennis's team's call: the offer is not once-per-browser — it returns on
     every new page. Dismissing it closes it for the room you are in; walk to
     another and it makes its offer again. Hash jumps within a page do not
     count as a new room. Never over the menu veil: if the reader is choosing
     a room when the moment comes, the offer waits for them to finish.

     But an offer that has been TAKEN stays taken: someone who pressed its
     button is already standing in front of the package it sells, and popping
     up again over that would be pestering. Answered lasts the visit. */
  useEffect(() => {
    if (onAMission) return;
    try {
      if (sessionStorage.getItem(ANSWERED) === "1") return;
    } catch {
      /* Private windows may refuse storage; the offer simply behaves as new. */
    }
    let delay: number;
    const attempt = () => {
      if (document.querySelector('.chrome-menu[data-open="true"]')) {
        delay = window.setTimeout(attempt, 2600);
        return;
      }
      setOpen(true);
    };
    delay = window.setTimeout(attempt, 4200);
    return () => {
      window.clearTimeout(delay);
      setOpen(false);
    };
  }, [pathname, onAMission]);

  /* The page holds still under the card while it is up. */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prior = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prior;
    };
  }, [open]);

  if (!open) return null;

  const dismiss = () => setOpen(false);

  const taken = () => {
    try {
      sessionStorage.setItem(ANSWERED, "1");
    } catch {
      /* Nothing to do: without storage it simply returns next page. */
    }
    setOpen(false);
  };

  return (
    <div className="promo" role="dialog" aria-labelledby="promo-title" aria-modal="true">
      <button type="button" className="promo-scrim" onClick={dismiss} aria-label="Close offer" />
      <div className="promo-card">
        <button type="button" className="promo-x" onClick={dismiss} aria-label="Close offer">
          <span aria-hidden>✕</span>
        </button>
        {/* On pure black, so lighten-blending sinks it into the lacquer the
            way the link-preview image does it: an object in a dark room, not
            a pasted photograph. */}
        <img className="promo-violin" src={photos.violin.src} alt="" aria-hidden />
        <div className="promo-body">
          <p className="promo-eyebrow">Introductory package</p>
          <h2 id="promo-title" className="promo-title">
            {introOffer.title}
          </h2>
          <Phrase />
          <p className="promo-summary">{introOffer.summary}</p>
          <p className="promo-price">{introOffer.price}</p>
          <p className="promo-note-line">{introOffer.note}</p>
          <div className="promo-actions">
            {whatsapp ? (
              <a
                className="promo-primary"
                href={whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={taken}
              >
                {introOffer.cta}
              </a>
            ) : (
              /* A real journey, not a bare hash: from the man page there is no
                 #packages to jump to, so this walks back to the work page and
                 arrives on the USD 288 tier the same way the corner plate
                 travels. */
              <Link
                className="promo-primary"
                to={{ pathname: "/", hash: "#packages" }}
                state={{ arrive: "packages" }}
                onClick={taken}
              >
                {introOffer.cta}
              </Link>
            )}
            <div className="promo-quiet">
              <button type="button" className="promo-dismiss" onClick={dismiss}>
                Explore more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
