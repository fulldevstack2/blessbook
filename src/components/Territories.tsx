import { useRef, type CSSProperties } from "react";
import { territories } from "../content/dennis";
import { useSectionProgress } from "../lib/useSectionProgress";

/**
 * Where he has played, plotted rather than listed.
 *
 * Equirectangular, cropped to the span of the points themselves — a whole world
 * with an empty half is a worse picture than the part of it he has actually
 * worked in. One series, so no legend; four places are labelled directly and the
 * rest are named in the line underneath, which doubles as the table view.
 *
 * Marks arrive west to east as the section passes, so twelve dots read as a
 * journey instead of a constellation.
 */

const WIDTH = 900;
const HEIGHT = 380;
const PAD = 46;
const R = 4.6;

/** Labelled by hand: enough to orient, few enough not to collide. */
const LABELLED = new Set(["Malaysia", "London", "Korea", "Australia"]);

const lons = territories.map((t) => t.lon);
const lats = territories.map((t) => t.lat);
const bounds = {
  west: Math.min(...lons),
  east: Math.max(...lons),
  south: Math.min(...lats),
  north: Math.max(...lats),
};

function project(lat: number, lon: number) {
  const x = PAD + ((lon - bounds.west) / (bounds.east - bounds.west)) * (WIDTH - PAD * 2);
  // Equirectangular: latitude maps linearly, north at the top.
  const y = PAD + ((bounds.north - lat) / (bounds.north - bounds.south)) * (HEIGHT - PAD * 2);
  return { x, y };
}

const ordered = [...territories].sort((a, b) => a.lon - b.lon);

export function Territories() {
  const root = useRef<HTMLDivElement>(null);
  useSectionProgress(root, { ease: 0.1 });

  return (
    <figure className="atlas" ref={root}>
      <svg
        className="atlas-plot"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`A map of the twelve territories he has performed in: ${territories
          .map((t) => t.name)
          .join(", ")}.`}
      >
        {/* Recessive graticule: enough structure to read as a map, not a grid. */}
        <g className="atlas-grid">
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={`h${f}`} x1={PAD * 0.5} x2={WIDTH - PAD * 0.5} y1={PAD + f * (HEIGHT - PAD * 2)} y2={PAD + f * (HEIGHT - PAD * 2)} />
          ))}
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={`v${f}`} y1={PAD * 0.5} y2={HEIGHT - PAD * 0.5} x1={PAD + f * (WIDTH - PAD * 2)} x2={PAD + f * (WIDTH - PAD * 2)} />
          ))}
        </g>

        {/* The route, drawn west to east behind the marks. */}
        <polyline
          className="atlas-route"
          pathLength={1}
          points={ordered
            .map((t) => {
              const { x, y } = project(t.lat, t.lon);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")}
        />

        <g className="atlas-marks">
          {ordered.map((territory, index) => {
            const { x, y } = project(territory.lat, territory.lon);
            const arrive = (index / ordered.length).toFixed(3);
            return (
              <g
                className="atlas-mark"
                key={territory.name}
                style={{ "--t": arrive } as CSSProperties}
              >
                {/* A surface ring, because Singapore and Kuala Lumpur overlap. */}
                <circle className="atlas-ring" cx={x} cy={y} r={R + 2.2} />
                <circle className="atlas-dot" cx={x} cy={y} r={R} />
                {LABELLED.has(territory.name) ? (
                  <text className="atlas-label" x={x + R + 8} y={y + 4}>
                    {territory.name}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </figure>
  );
}
