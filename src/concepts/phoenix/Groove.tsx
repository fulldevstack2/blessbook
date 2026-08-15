import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { livePhrase } from "../../content/media";
import { play } from "../../lib/listening";
import { audioContext, resumeAudio } from "../../lib/audioContext";
import { peaks } from "../../lib/peaks";
import { useSectionProgress } from "../../lib/useSectionProgress";
import { Volume } from "../../components/Volume";

/**
 * The recording, cut as a groove.
 *
 * This used to be engraved notation: a staff, noteheads, beams. It was derived
 * honestly but it read as a prop, because it was not the notation of anything a
 * reader could check — and half-real music on a musician's page is worse than
 * none. What is on the page now is the take itself. The mp3 is decoded in the
 * browser and its amplitude envelope is drawn as a lathe cut: forty seconds of
 * him playing, at the width of the column, every attack in its true place.
 *
 * The groove opens as the section arrives, fills with gold as it plays, and can
 * be dragged to move through the phrase.
 */

/* Few enough that every bar has air around it. A solid fill of 400 bars is a
   blob with a fuzzy edge; a hairline every five pixels is a lathe cut. */
const BUCKETS = 190;
const VIEW_W = 1000;
const VIEW_H = 120;
const MID = VIEW_H / 2;
const REACH = 54;

/** One hairline per bucket, struck from the centre — the whole take, in gold. */
function cut(values: Float32Array): string {
  const step = VIEW_W / (values.length - 1);
  let d = "";

  for (let i = 0; i < values.length; i += 1) {
    const x = (i * step).toFixed(2);
    const reach = (values[i] as number) * REACH;
    // A floor, so the quiet passages are still a spine rather than a gap.
    const height = Math.max(1.1, reach);
    d += `M${x} ${(MID - height).toFixed(2)}V${(MID + height).toFixed(2)}`;
  }

  return d;
}

function clock(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function Groove({ caption }: { caption?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [shape, setShape] = useState<Float32Array | null>(null);
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [length, setLength] = useState<number>(livePhrase.seconds);
  useSectionProgress(root, { ease: 0.1 });

  useEffect(() => {
    let live = true;
    void peaks(livePhrase.src, BUCKETS).then((result) => {
      if (live) setShape(result);
    });
    return () => {
      live = false;
    };
  }, []);

  const path = useMemo(() => (shape ? cut(shape) : null), [shape]);

  const toggle = () => {
    const element = audioRef.current;
    if (!element) return;
    if (!element.paused) {
      element.pause();
      return;
    }
    const ctx = audioContext();
    if (ctx) resumeAudio(ctx);
    play(element, { title: livePhrase.title, where: livePhrase.where });
  };

  /** Drag anywhere along the cut to move through it. */
  const seek = (event: PointerEvent<HTMLDivElement>) => {
    const element = audioRef.current;
    const box = track.current?.getBoundingClientRect();
    if (!element || !box || box.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const duration = Number.isFinite(element.duration) ? element.duration : livePhrase.seconds;
    element.currentTime = ratio * duration;
    setAt(ratio * duration);
  };

  const played = length > 0 ? at / length : 0;

  return (
    <div
      className="groove"
      ref={root}
      data-playing={playing}
      data-cut={path !== null}
      style={{ "--played": played.toFixed(4) } as CSSProperties}
    >
      <div
        className="groove-track"
        ref={track}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          seek(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) seek(event);
        }}
        role="presentation"
      >
        <svg
          className="groove-cut"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          {path ? (
            <>
              {/* The whole cut, unlit. */}
              <path className="groove-shape" d={path} />
              {/* And the part of it that has sounded. */}
              <g className="groove-lit">
                <path d={path} />
              </g>
            </>
          ) : null}

          <line className="groove-axis" x1="0" x2={VIEW_W} y1={MID} y2={MID} />
        </svg>

        <span className="groove-head" aria-hidden />
      </div>

      <div className="groove-legend">
        <button
          type="button"
          className="groove-play"
          onClick={toggle}
          aria-label={playing ? `Pause ${livePhrase.title}` : `Play ${livePhrase.title}`}
        >
          <span className="groove-play-mark" data-playing={playing} aria-hidden />
          <span className="groove-play-word">{playing ? "Playing" : "Play the take"}</span>
        </button>

        <p className="groove-time">
          <span>{clock(at)}</span>
          <span className="groove-time-of">of</span>
          <span>{clock(length)}</span>
        </p>

        <Volume label="Playback volume" />

        <p className="groove-provenance">
          {caption ?? `The waveform of the recording. ${livePhrase.title}, ${livePhrase.where}.`}
        </p>
      </div>

      <audio
        ref={audioRef}
        src={livePhrase.src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setAt(0);
        }}
        onLoadedMetadata={(event) => {
          const duration = event.currentTarget.duration;
          if (Number.isFinite(duration) && duration > 0) setLength(duration);
        }}
        onTimeUpdate={(event) => setAt(event.currentTarget.currentTime)}
      />
    </div>
  );
}
