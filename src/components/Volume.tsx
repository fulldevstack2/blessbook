import { useState, type CSSProperties } from "react";
import { setVolume, volume } from "../lib/listening";

/**
 * One fader for the site.
 *
 * Machinery, not decoration: it holds the master gain that every player on the
 * page runs through, and the setting is remembered between visits. Each concept
 * styles it in its own language; what it does is the same everywhere.
 *
 * A range input rather than a bespoke slider, because a range input is
 * keyboard-operable, screen-reader-labelled and draggable on a phone for free.
 */

export function Volume({ label = "Volume" }: { label?: string }) {
  const [level, setLevel] = useState(volume);

  return (
    <div
      className="volume"
      data-muted={level === 0}
      style={{ "--level": level.toFixed(2) } as CSSProperties}
    >
      <button
        type="button"
        className="volume-mark"
        data-muted={level === 0}
        aria-label={level === 0 ? "Unmute" : "Mute"}
        onClick={() => {
          const next = level === 0 ? 0.8 : 0;
          setLevel(next);
          setVolume(next);
        }}
      >
        <span className="volume-bar" />
        <span className="volume-bar" />
        <span className="volume-bar" />
      </button>

      <input
        className="volume-input"
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(level * 100)}
        aria-label={label}
        onChange={(event) => {
          const next = Number(event.target.value) / 100;
          setLevel(next);
          setVolume(next);
        }}
      />
    </div>
  );
}
