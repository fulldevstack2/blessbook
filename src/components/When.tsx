import { useEffect, useMemo, useRef, useState } from "react";
import { useFinePointer, useOpenDirection } from "../lib/pointer";

/**
 * A date, chosen off a drawn month.
 *
 * `input type="date"` is the browser's own calendar and cannot be styled at all
 * — not the grid, not the highlight, not the little arrows — so on a desktop it
 * arrives as a piece of Chrome in the middle of a page built to the hairline.
 * This draws the month instead.
 *
 * On a touch device it steps aside for the platform's own, which is a proper
 * wheel picker and better than anything drawn here; see `useFinePointer`.
 *
 * Everything is in local time on purpose. `new Date("2026-12-24")` is parsed as
 * UTC and can come back as the 23rd west of Greenwich, which is the classic
 * off-by-one in every date picker ever written, so the parts are handled as
 * numbers and never round-tripped through a UTC string.
 */

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** yyyy-mm-dd, built from local parts rather than from toISOString. */
function stamp(year: number, month: number, day: number): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function partsOf(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

/** Monday-first offset for the 1st of a month. */
function leading(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function lengthOf(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function When({
  id,
  value,
  min,
  onPick,
  label,
}: {
  id: string;
  value: string;
  /** yyyy-mm-dd. Nothing before this can be taken. */
  min: string;
  onPick: (value: string) => void;
  label?: string;
}) {
  const fine = useFinePointer();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pane = useRef<HTMLDivElement>(null);
  const way = useOpenDirection(root, pane, open);

  const floor = partsOf(min);
  const picked = partsOf(value);
  const [{ year, month }, setShowing] = useState(() => {
    const from = picked ?? floor ?? { year: new Date().getFullYear(), month: new Date().getMonth() };
    return { year: from.year, month: from.month };
  });

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const grid = useMemo(() => {
    const cells: (number | null)[] = Array.from({ length: leading(year, month) }, () => null);
    for (let day = 1; day <= lengthOf(year, month); day += 1) cells.push(day);
    return cells;
  }, [year, month]);

  if (!fine) {
    return (
      <input
        className="brief-input brief-input--date"
        id={id}
        type="date"
        min={min}
        value={value}
        aria-label={label}
        onChange={(event) => onPick(event.target.value)}
      />
    );
  }

  const tooEarly = (day: number) => Boolean(floor) && stamp(year, month, day) < min;
  const shift = (by: number) => {
    const next = new Date(year, month + by, 1);
    setShowing({ year: next.getFullYear(), month: next.getMonth() });
  };

  const spoken = picked
    ? `${picked.day} ${MONTHS[picked.month]} ${picked.year}`
    : "";

  return (
    <div className="when" ref={root} data-open={open} data-way={way}>
      <button
        type="button"
        className="when-face"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label ? `${label}${spoken ? `: ${spoken}` : ""}` : undefined}
        onClick={() => setOpen((was) => !was)}
      >
        <span className="when-value" data-empty={!picked}>
          {spoken || "Choose a date"}
        </span>
        <span className="when-caret" aria-hidden />
      </button>

      {open ? (
        <div
          className="when-pane"
          ref={pane}
          role="dialog"
          aria-modal={false}
          aria-label={`${label ?? "Date"} — ${MONTHS[month]} ${year}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
          }}
        >
          <div className="when-head">
            <button
              type="button"
              className="when-step"
              aria-label="Previous month"
              onClick={() => shift(-1)}
            >
              <span aria-hidden>‹</span>
            </button>
            <span className="when-month" aria-live="polite">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              className="when-step"
              aria-label="Next month"
              onClick={() => shift(1)}
            >
              <span aria-hidden>›</span>
            </button>
          </div>

          <div className="when-days" aria-hidden>
            {DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="when-grid" role="grid" aria-label={`${MONTHS[month]} ${year}`}>
            {grid.map((day, index) =>
              day === null ? (
                <span key={`blank-${index}`} className="when-blank" />
              ) : (
                <button
                  type="button"
                  key={day}
                  className="when-day"
                  data-on={value === stamp(year, month, day)}
                  disabled={tooEarly(day)}
                  aria-label={`${day} ${MONTHS[month]} ${year}`}
                  onClick={() => {
                    onPick(stamp(year, month, day));
                    setOpen(false);
                  }}
                >
                  {day}
                </button>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
