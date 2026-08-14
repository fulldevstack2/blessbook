import { useCallback, useRef, useState } from "react";
import { showreel } from "../content/media";
import { audioContext, resumeAudio } from "../lib/audioContext";
import { play } from "../lib/listening";
import { Volume } from "./Volume";

/**
 * His own 2021 showreel, self-hosted and click-to-play.
 *
 * Self-hosted on purpose: the films section embeds YouTube because those films
 * live there, but the showreel is the one piece of footage the site cannot
 * afford to hand to a third party's player, cookie banner and recommendation
 * rail. Ten megabytes, fetched only when someone asks to watch.
 */

export function Showreel({ caption }: { caption: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = useCallback(() => {
    setStarted(true);
    // The element only exists after the poster is replaced, so play on the next
    // tick — and route it through the shared bus so the heroes react to it too.
    requestAnimationFrame(() => {
      const element = videoRef.current;
      if (!element) return;
      const ctx = audioContext();
      if (ctx) resumeAudio(ctx);
      play(element);
    });
  }, []);

  return (
    <figure className="showreel">
      <div className="showreel-frame" data-started={started}>
        {started ? (
          <video
            ref={videoRef}
            className="showreel-video"
            src={showreel.full}
            poster={showreel.poster}
            controls
            playsInline
          />
        ) : (
          <button type="button" className="showreel-open" onClick={start}>
            <img
              className="showreel-poster"
              src={showreel.poster}
              width={1280}
              height={720}
              alt="Dennis Lau performing, the opening frame of his showreel."
              loading="lazy"
            />
            <span className="showreel-play">
              <span className="showreel-play-mark" aria-hidden />
              <span className="showreel-play-word">Watch the showreel</span>
            </span>
          </button>
        )}
      </div>

      <figcaption className="showreel-caption">
        <Volume label="Showreel volume" />
        <span className="showreel-note">{caption}</span>
        <span className="showreel-credit">{showreel.credit}</span>
      </figcaption>
    </figure>
  );
}
