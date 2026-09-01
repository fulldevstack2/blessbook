import { useEffect, useState, type CSSProperties } from "react";
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

export function PromoOffer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(introOffer.storageKey) === "1") return;

    /* Never over the menu veil: if the reader is choosing a room when the
       moment comes, the offer waits for them to finish. */
    let delay: number;
    const attempt = () => {
      if (document.querySelector('.chrome-menu[data-open="true"]')) {
        delay = window.setTimeout(attempt, 2600);
        return;
      }
      setOpen(true);
    };
    delay = window.setTimeout(attempt, 4200);
    return () => window.clearTimeout(delay);
  }, []);

  if (!open) return null;

  const dismiss = () => {
    localStorage.setItem(introOffer.storageKey, "1");
    setOpen(false);
  };

  return (
    <div className="promo" role="dialog" aria-labelledby="promo-title" aria-modal="true">
      <button type="button" className="promo-scrim" onClick={dismiss} aria-label="Close offer" />
      <div className="promo-card">
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
              >
                {introOffer.cta}
              </a>
            ) : (
              <a className="promo-primary" href="#commission" onClick={dismiss}>
                {introOffer.cta}
              </a>
            )}
            <div className="promo-quiet">
              <a className="promo-secondary" href="#commission" onClick={dismiss}>
                See all packages
              </a>
              <button type="button" className="promo-dismiss" onClick={dismiss}>
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
