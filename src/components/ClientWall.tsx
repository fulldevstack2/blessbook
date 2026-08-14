import type { CSSProperties } from "react";
import { clientMask, clients, clientWall } from "../content/clients";
import { Words } from "./Words";

/**
 * The people who could book anyone, and booked him.
 *
 * Each logo ships as alpha only, so it is painted here with the concept's own
 * ink through a CSS mask rather than pasted on as a boxed white rectangle. One
 * asset therefore works on lacquer, on rice paper and on silk, and the wall
 * reads as one material instead of nineteen brand guidelines fighting.
 */

export function ClientWall() {
  return (
    <div className="wall">
      <p className="wall-eyebrow" data-reveal>
        {clientWall.eyebrow}
      </p>
      <Words as="h2" className="wall-lede" text={clientWall.lede} />

      <ul className="wall-list">
        {clients.map((client, index) => (
          <li className="wall-item" key={client.slug} data-reveal style={{ "--reveal-i": index % 7 } as CSSProperties}>
            {/* The name is the accessible content; the mask is the picture of it. */}
            <span
              className="wall-mark"
              style={{ "--mask": `url("${clientMask(client)}")` } as CSSProperties}
              aria-hidden
            />
            <span className="visually-hidden">{client.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
