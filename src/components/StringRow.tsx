import { useCallback, useEffect, useRef, useState } from "react";
import { pluck, violinStrings } from "../lib/plucker";

/**
 * The four open strings of a violin. Clicking one plucks it. This is the one
 * place the site makes a sound, and only ever because someone asked it to.
 */
interface StringRowProps {
  caption: string;
  /** Some concepts want the note name, others want the measurement. */
  readout?: "note" | "frequency";
}

export function StringRow({ caption, readout = "note" }: StringRowProps) {
  const [ringing, setRinging] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const strike = useCallback((name: string, frequency: number) => {
    pluck(frequency);
    setRinging(name);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRinging(null), 900);
  }, []);

  return (
    <div className="strings">
      <p className="strings-caption">{caption}</p>
      <ul className="strings-list">
        {violinStrings.map((string) => (
          <li key={string.name}>
            <button
              type="button"
              className="string"
              data-ringing={ringing === string.name}
              onClick={() => strike(string.name, string.frequency)}
            >
              <span className="string-name">{string.name}</span>
              <span className="string-wire" aria-hidden />
              <span className="string-pitch">
                {readout === "frequency" ? `${string.frequency.toFixed(2)} Hz` : string.label}
              </span>
              <span className="visually-hidden">
                Pluck the {string.name} string, {string.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
