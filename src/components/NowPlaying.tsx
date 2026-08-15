import { useEffect, useRef, useState } from "react";
import { pauseAll, sounding_, watch, type Sounding } from "../lib/listening";
import { Volume } from "./Volume";

/**
 * A small player that appears only once the thing you started has scrolled away.
 *
 * Sound with no visible control is the rudest thing a site can do. While the
 * player you pressed is on screen this stays out of the way entirely; the moment
 * it leaves, a bar arrives with the title, a pause and the fader. Stop, and it
 * goes on its own — there is nothing to dismiss because nothing is left running.
 *
 * Mechanics only; each concept dresses it.
 */

export function NowPlaying() {
  const [track, setTrack] = useState<Sounding | null>(null);
  const [visible, setVisible] = useState(false);
  const observed = useRef<HTMLMediaElement | null>(null);

  /** Follow whatever is sounding. */
  useEffect(() => watch(() => setTrack(sounding_())), []);

  /** Show only while the source itself is off screen. */
  useEffect(() => {
    const element = track?.element ?? null;
    observed.current = element;
    if (!element) {
      setVisible(false);
      return;
    }

    // An <audio> element has no box of its own, so watch its nearest laid-out
    // ancestor instead: that is the player the reader actually pressed.
    const box = element.parentElement ?? element;
    const watcher = new IntersectionObserver(
      ([entry]) => setVisible(!(entry?.isIntersecting ?? true)),
      { threshold: 0 },
    );
    watcher.observe(box);
    return () => watcher.disconnect();
  }, [track]);

  if (!track) return null;

  return (
    <div className="playing" data-shown={visible}>
      <button
        type="button"
        className="playing-stop"
        onClick={() => pauseAll()}
        aria-label={`Stop ${track.title}`}
      >
        <span className="playing-stop-mark" aria-hidden />
      </button>

      <p className="playing-track">
        <span className="playing-title">{track.title}</span>
        {track.where ? <span className="playing-where">{track.where}</span> : null}
      </p>

      <Volume label="Volume" />
    </div>
  );
}
