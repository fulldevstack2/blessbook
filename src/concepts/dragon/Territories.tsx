import type { CSSProperties } from "react";
import { ScrollStage } from "../../lib/ScrollStage";
import { territories } from "../../content/dennis";
import { LAND, LAT1, MAP_W, MAP_H, project } from "./land";

/**
 * Where Dennis has played, drawn as a chart and travelled as you scroll.
 *
 * A row of boxes wearing the word "stamped" was the wrong answer twice. Twelve
 * place names are geography, and geography wants a map: the land as a field of
 * pressed dots, one ink line running the length of the tour, and a cinnabar
 * chop coming down on each territory as the line reaches it. The scroll is the
 * journey, which is the one motion this concept has been about from the start.
 *
 * On a phone the map is taller than the frame is wide, so it pans instead of
 * shrinking: you travel from London to Melbourne rather than squint at both.
 * That is also how a hand scroll is read, which is the whole conceit.
 */

/** The order the line travels: west to east, then south to Melbourne. */
const ROUTE = [
  "London",
  "India",
  "Sri Lanka",
  "Thailand",
  "Malaysia",
  "Singapore",
  "Indonesia",
  "Macau",
  "Hong Kong",
  "China",
  "Korea",
  "Australia",
] as const;

/**
 * Where each name sits relative to its chop, in map units, and which side of
 * that point the type runs. Hand-placed: Hong Kong and Macau are six units
 * apart at this scale, and no automatic labeller survives that. Every label is
 * pushed out over water where there is water to use.
 */
const LABELS: Record<string, { dx: number; dy: number; anchor: "start" | "end" }> = {
  London: { dx: 46, dy: -34, anchor: "start" },
  India: { dx: -44, dy: -14, anchor: "end" },
  "Sri Lanka": { dx: -38, dy: 62, anchor: "end" },
  Thailand: { dx: 34, dy: 44, anchor: "start" },
  Malaysia: { dx: -46, dy: 34, anchor: "end" },
  Singapore: { dx: 46, dy: 26, anchor: "start" },
  Indonesia: { dx: 52, dy: 56, anchor: "start" },
  Macau: { dx: -52, dy: 66, anchor: "end" },
  "Hong Kong": { dx: 56, dy: 16, anchor: "start" },
  China: { dx: 52, dy: 8, anchor: "start" },
  Korea: { dx: 34, dy: -54, anchor: "start" },
  Australia: { dx: -40, dy: 20, anchor: "end" },
};

/** Meridians and parallels every thirty degrees, as chart paper under the ink. */
const GRATICULE = (() => {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let lon = -30; lon <= 160; lon += 30) {
    const a = project(LAT1, lon);
    const b = project(LAT1 - MAP_H / 10, lon);
    if (a.x >= 0 && a.x <= MAP_W) lines.push({ x1: a.x, y1: 0, x2: b.x, y2: MAP_H });
  }
  for (let lat = 60; lat >= -60; lat -= 30) {
    const a = project(lat, 0);
    if (a.y >= 0 && a.y <= MAP_H) lines.push({ x1: 0, y1: a.y, x2: MAP_W, y2: a.y });
  }
  return lines;
})();

const plotted = ROUTE.map((name) => {
  const territory = territories.find((t) => t.name === name);
  if (!territory) throw new Error(`Territories: no coordinate for ${name}`);
  const { x, y } = project(territory.lat, territory.lon);
  return { name, x, y, ...(LABELS[name] ?? { dx: 40, dy: 0, anchor: "start" as const }) };
});

/**
 * A smooth line through the points, Catmull-Rom converted to cubics. Straight
 * segments between twelve cities would draw a bar chart lying on its side; a
 * hand crossing a chart curves.
 */
function route(points: readonly { x: number; y: number }[]): string {
  /* Textbook Catmull-Rom builds each handle from the *neighbours* of a point,
     which is fine on an even curve and disastrous on this one: Macau and Hong
     Kong are six units apart and Australia is three hundred away, so the handles
     ran far longer than the segments they belonged to and the line tied itself
     in knots around the Malacca Strait. Capping each handle at a fraction of its
     own segment is the standard cure and costs nothing. */
  const K = 0.3;
  const CAP = 0.4;

  const clamp = (hx: number, hy: number, span: number) => {
    const length = Math.hypot(hx, hy);
    const limit = span * CAP;
    if (length <= limit || length === 0) return [hx, hy] as const;
    return [(hx / length) * limit, (hy / length) * limit] as const;
  };

  let d = `M${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    const span = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    const [h1x, h1y] = clamp((p2.x - p0.x) * K, (p2.y - p0.y) * K, span);
    const [h2x, h2y] = clamp((p3.x - p1.x) * K, (p3.y - p1.y) * K, span);

    const c1x = (p1.x + h1x).toFixed(1);
    const c1y = (p1.y + h1y).toFixed(1);
    const c2x = (p2.x - h2x).toFixed(1);
    const c2y = (p2.y - h2y).toFixed(1);
    d += `C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * How far along the line each stop falls, so a chop presses at the moment the
 * ink reaches it. Straight-line distance rather than true arc length: the curve
 * is longer than the chords by a percent or two, evenly, and a chop landing a
 * frame early looks like anticipation while one landing late looks broken.
 */
const stops = (() => {
  const spans: number[] = [0];
  let total = 0;
  for (let i = 1; i < plotted.length; i += 1) {
    const a = plotted[i - 1]!;
    const b = plotted[i]!;
    total += Math.hypot(b.x - a.x, b.y - a.y);
    spans.push(total);
  }
  // The line is drawn over the first four fifths of the scroll, so the last
  // chop is not still landing as the section leaves the screen.
  return spans.map((run) => (run / total) * 0.8);
})();

const LINE = route(plotted);

export function Territories() {
  return (
    <ScrollStage vh={300} cuts={1} className="dragon-map">
      {() => (
        <>
          <div className="dragon-map-head">
            <p className="dragon-map-eyebrow">
              <span lang="zh" aria-hidden>
                印
              </span>
              Territories
            </p>
            <h2 className="dragon-map-lede">Twelve territories, five continents</h2>
            <p className="dragon-map-note">
              Dennis works out of Kuala Lumpur. The line runs from London in the west to Melbourne in
              the south, and every seal on it is a place he has performed.
            </p>
          </div>

          <div
            className="dragon-map-frame"
            style={{ "--map-ratio": MAP_W / MAP_H } as CSSProperties}
          >
            <svg
              className="dragon-map-svg"
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              role="img"
              aria-label={`A map of the twelve territories Dennis Lau has performed in: ${ROUTE.join(", ")}.`}
            >
              <g className="dragon-map-grid" aria-hidden>
                {GRATICULE.map((line) => (
                  <line key={`${line.x1}-${line.y1}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
                ))}
              </g>

              <path className="dragon-map-land" d={LAND} />

              <path className="dragon-map-line" d={LINE} pathLength={1} />

              {plotted.map((stop, index) => (
                <g
                  className="dragon-map-stop"
                  key={stop.name}
                  style={{ "--at": stops[index] ?? 0, "--tilt": `${((index * 5) % 9) - 4}deg` } as CSSProperties}
                >
                  <line
                    className="dragon-map-leader"
                    x1={stop.x}
                    y1={stop.y}
                    x2={stop.x + stop.dx}
                    y2={stop.y + stop.dy}
                  />
                  <rect className="dragon-map-seal" x={stop.x - 9} y={stop.y - 9} width={18} height={18} />
                  <text
                    className="dragon-map-name"
                    x={stop.x + stop.dx + (stop.anchor === "end" ? -12 : 12)}
                    y={stop.y + stop.dy}
                    textAnchor={stop.anchor}
                    dominantBaseline="central"
                  >
                    {stop.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </>
      )}
    </ScrollStage>
  );
}
