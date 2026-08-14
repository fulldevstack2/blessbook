import type { CSSProperties } from "react";
import { clientMask, clients } from "../content/clients";

/**
 * The client wall, read as a tempo strip: a slow, continuous pass of the names
 * that have booked him. It answers the same question the static grid does, but a
 * page that has one thing quietly moving in it does not feel dead — and a strip
 * of Patek Philippe, Porsche and Dunhill drifting past is the argument this site
 * is making, stated as motion rather than as a list.
 *
 * Two identical halves translated by half the track's own width: the loop is
 * seamless, needs no measurement and no JavaScript. It pauses on hover so a name
 * can be read, and holds still entirely under reduced motion, where it becomes a
 * plain scrollable row.
 */

export function Marquee({ seconds = 46 }: { seconds?: number }) {
  const half = (
    <div className="marquee-half" aria-hidden>
      {clients.map((client) => (
        <span className="marquee-item" key={client.slug}>
          <span
            className="marquee-mark"
            style={{ "--mask": `url("${clientMask(client)}")` } as CSSProperties}
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" style={{ "--marquee-duration": `${seconds}s` } as CSSProperties}>
      <div className="marquee-track">
        {half}
        {half}
      </div>
      {/* The strip is decorative; the names themselves are already in the wall
          above it, so screen readers are not asked to read them twice. */}
    </div>
  );
}
