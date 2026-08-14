import type { CSSProperties } from "react";
import { artist } from "../content/dennis";

/**
 * His name, enormous, drifting past.
 *
 * Every hall he has played has had his name outside it at this size. The site
 * never did — it kept him at heading scale and read like a brochure. This is one
 * band of type doing what a marquee does, and it is the cheapest big gesture on
 * the page: no images, no canvas, one transform.
 */

export function Kinetic({ seconds = 34 }: { seconds?: number }) {
  const half = (
    <div className="kinetic-half" aria-hidden>
      {[0, 1, 2].map((index) => (
        <span className="kinetic-item" key={index}>
          <span className="kinetic-word">{artist.name}</span>
          <span className="kinetic-dot">◆</span>
          <span className="kinetic-word" lang="zh">
            {artist.chineseName}
          </span>
          <span className="kinetic-dot">◆</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="kinetic" style={{ "--kinetic-duration": `${seconds}s` } as CSSProperties}>
      <div className="kinetic-track">
        {half}
        {half}
      </div>
    </div>
  );
}
