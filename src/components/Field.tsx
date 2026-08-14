import { useRef, type CSSProperties } from "react";
import { useSectionProgress } from "../lib/useSectionProgress";

/**
 * Ten thousand performances, as one hundred marks.
 *
 * The record used to be a row of numerals, and a numeral that large stops meaning
 * anything — "10,000" reads as "a lot". A unit field makes it countable: one mark
 * is a hundred nights, and there are a hundred marks. The eye does the arithmetic
 * on its own.
 *
 * One series, so there is no legend and no colour to decode; the only direct label
 * is the total. Marks fill in as the section passes, ordered so it reads as
 * accumulation rather than as a pattern appearing.
 */

const COLUMNS = 20;
const ROWS = 5;
const MARKS = COLUMNS * ROWS;
const STEP = 30;
const RADIUS = 4.6; // ≥ 8px across, so the mark survives a phone
const WIDTH = COLUMNS * STEP;
const HEIGHT = ROWS * STEP;

export function Field({
  total = "10,000+",
  label = "performances",
  note = "One mark is one hundred nights.",
}: {
  total?: string;
  label?: string;
  note?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useSectionProgress(root, { ease: 0.1 });

  return (
    <figure className="field" ref={root}>
      <div className="field-head">
        <p className="field-total">{total}</p>
        <p className="field-label">{label}</p>
      </div>

      <svg
        className="field-plot"
        viewBox={`${-RADIUS} ${-RADIUS} ${WIDTH + RADIUS * 2 - STEP + RADIUS} ${HEIGHT + RADIUS * 2 - STEP + RADIUS}`}
        role="img"
        aria-label={`A field of one hundred marks, each standing for one hundred performances: ${total} in total.`}
      >
        {Array.from({ length: MARKS }, (_, index) => {
          const column = index % COLUMNS;
          const row = Math.floor(index / COLUMNS);
          return (
            <circle
              key={index}
              className="field-mark"
              cx={column * STEP}
              cy={row * STEP}
              r={RADIUS}
              style={{ "--t": (index / MARKS).toFixed(3) } as CSSProperties}
            />
          );
        })}
      </svg>

      <figcaption className="field-note">{note}</figcaption>
    </figure>
  );
}
