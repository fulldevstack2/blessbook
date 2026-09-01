import { useEffect, useState } from "react";
import { introOffer, whatsapp } from "../content/site";

/**
 * A single introductory offer, shown once per browser until dismissed —
 * the same contract as a course landing popup, without blocking the page.
 */
export function PromoOffer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(introOffer.storageKey) === "1") return;

    const delay = window.setTimeout(() => setOpen(true), 4200);
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
        <p className="promo-eyebrow">Introductory package</p>
        <h2 id="promo-title" className="promo-title">
          {introOffer.title}
        </h2>
        <p className="promo-price">{introOffer.price}</p>
        <p className="promo-summary">{introOffer.summary}</p>
        <p className="promo-note">{introOffer.note}</p>
        <div className="promo-actions">
          {whatsapp ? (
            <a className="promo-primary" href={whatsapp.href} target="_blank" rel="noopener noreferrer">
              {introOffer.cta}
            </a>
          ) : (
            <a className="promo-primary" href="#commission" onClick={dismiss}>
              {introOffer.cta}
            </a>
          )}
          <a className="promo-secondary" href="#commission" onClick={dismiss}>
            See all packages
          </a>
          <button type="button" className="promo-dismiss" onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
