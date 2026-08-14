import { useCallback, useEffect, useRef, useState } from "react";
import { livePhrase } from "../content/media";
import { audioContext, resumeAudio } from "../lib/audioContext";
import { play } from "../lib/listening";

/**
 * Forty seconds of Dennis playing, live, on the gold violin.
 *
 * This is the site's answer to "why should I care about this man": the fastest
 * possible route from arriving to hearing him. It sits in every hero, and while
 * it plays the hero's scene is drawn by the signal rather than by a timer — so
 * pressing it does not just add sound, it hands the picture over to the music.
 *
 * Mechanics only. Each concept styles it in its own language.
 */

interface ListenProps {
  /** Overrides the default invitation where a concept wants its own wording. */
  label?: string;
}

export function Listen({ label = "Hear him play" }: ListenProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;

    if (!element.paused) {
      element.pause();
      return;
    }

    const ctx = audioContext();
    if (ctx) resumeAudio(ctx);
    // Starting anything stops everything else: one player on the site.
    play(element);
  }, []);

  /** Nothing should still be sounding after the listener has left the page. */
  useEffect(() => {
    const element = audioRef.current;
    return () => element?.pause();
  }, []);

  return (
    <div className="listen" ref={rootRef} data-playing={playing}>
      <button type="button" className="listen-button" onClick={toggle}>
        <span className="listen-mark" data-playing={playing} aria-hidden />
        <span className="listen-label">{playing ? "Playing" : label}</span>
      </button>

      <p className="listen-track">
        <span className="listen-title">{livePhrase.title}</span>
        <span className="listen-where">{livePhrase.where}</span>
      </p>

      <div className="listen-rail" aria-hidden>
        <div className="listen-fill" />
      </div>

      <audio
        ref={audioRef}
        src={livePhrase.src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const element = event.currentTarget;
          if (element.duration > 0) {
            rootRef.current?.style.setProperty(
              "--played",
              (element.currentTime / element.duration).toFixed(4),
            );
          }
        }}
      />
    </div>
  );
}
