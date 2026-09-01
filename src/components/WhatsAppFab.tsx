import { whatsapp } from "../content/site";

/**
 * A way to reach Dennis's team without starting the full brief.
 * Sits under the commission plate on the right so both can live in one corner.
 */
export function WhatsAppFab() {
  if (!whatsapp) return null;

  return (
    <a
      className="whatsapp-fab"
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${whatsapp.label} on WhatsApp`}
    >
      <span className="whatsapp-fab-mark" aria-hidden />
      <span className="whatsapp-fab-word">{whatsapp.label}</span>
    </a>
  );
}
