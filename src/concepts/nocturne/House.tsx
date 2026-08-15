import type { CSSProperties } from "react";
import { ScrollStage } from "../../lib/ScrollStage";
import { HOUSE_RATIO, HOUSE_RINGS, HOUSE_SEATS, HOUSE_STAGE, HOUSE_VIEWBOX } from "./house";

/**
 * The house, filling.
 *
 * This concept is a hall, and until now the largest thing that ever happened in
 * it was a number in a list: three thousand seats, sold out, twice. A number in
 * a list is the same size as every other number in the list, which is exactly
 * the problem the run of pages after the showreel had.
 *
 * So the hall is drawn. Three thousand seats in plan, stalls and two circles
 * around a stage, and the scroll fills them from the front row outwards the way
 * a house actually fills. Every seat is a real mark rather than a texture: the
 * quantity is the argument, and a quantity you can count is worth more than a
 * quantity you are told.
 *
 * Fifty rings, not three thousand nodes. See house.ts.
 */

/* The stage: an arc band in front of the first row, running off the bottom of
   the frame the way a stage runs off the front of a plan. */
const STAGE = (() => {
  const { cx, cy, r } = HOUSE_STAGE;
  const half = (HOUSE_STAGE.half * Math.PI) / 180;
  const outer = r - 14;
  const inner = r - 96;
  const at = (radius: number, angle: number) => ({
    x: (cx + Math.sin(angle) * radius).toFixed(1),
    y: (cy - Math.cos(angle) * radius).toFixed(1),
  });
  const a = at(outer, -half);
  const b = at(outer, half);
  const c = at(inner, half);
  const d = at(inner, -half);
  return `M${a.x} ${a.y}A${outer} ${outer} 0 0 1 ${b.x} ${b.y}L${c.x} ${c.y}A${inner} ${inner} 0 0 0 ${d.x} ${d.y}Z`;
})();

const LAST = HOUSE_RINGS.length - 1;

export function House() {
  return (
    <ScrollStage vh={340} cuts={1} className="house-plan">
      {() => (
        <>
          <div className="house-plan-head">
            <p className="nocturne-eyebrow" data-reveal>
              ACT VI <em>·</em> THE HOUSE
            </p>
            <h2 className="nocturne-statement nocturne-statement--small" data-reveal>
              THREE THOUSAND <em>seats</em>
            </h2>
            <p className="house-plan-legend" data-reveal>
              One mark for each of the three thousand seats
            </p>
          </div>

          <div
            className="house-plan-frame"
            style={{ "--house-ratio": HOUSE_RATIO } as CSSProperties}
          >
            <svg
              className="house-plan-svg"
              viewBox={HOUSE_VIEWBOX}
              role="img"
              aria-label={`A plan of a ${HOUSE_SEATS.toLocaleString()} seat hall, stalls and two circles around the stage, filling as the page scrolls.`}
            >
              {/* The lamp the lit seats pool under. */}
              <g className="house-plan-glow" aria-hidden>
                {HOUSE_RINGS.map((ring, index) => (
                  <path key={`glow-${index}`} d={ring} style={{ "--at": index / LAST } as CSSProperties} />
                ))}
              </g>

              <g className="house-plan-seats">
                {HOUSE_RINGS.map((ring, index) => (
                  <path key={index} d={ring} style={{ "--at": index / LAST } as CSSProperties} />
                ))}
              </g>

              <path className="house-plan-stage" d={STAGE} />
              <text
                className="house-plan-stage-label"
                x={HOUSE_STAGE.cx}
                y={HOUSE_STAGE.cy - HOUSE_STAGE.r + 44}
                textAnchor="middle"
              >
                STAGE
              </text>
            </svg>
          </div>

          <div className="house-plan-foot">
            <p className="house-plan-sold">
              The Phoenix Rising, October 2016, under music director Aubrey Suwito. Dennis filled a
              hall this size again in 2019 with The Chosen, and he is the first Malaysian
              instrumentalist to have done it at all.
            </p>
          </div>
        </>
      )}
    </ScrollStage>
  );
}
