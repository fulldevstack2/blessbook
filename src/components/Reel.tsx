import { useCallback, useEffect, useRef, useState } from "react";
import { demos, timecode } from "../content/work";
import { audioContext, resumeAudio } from "../lib/audioContext";
import { play, waveform } from "../lib/listening";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { Volume } from "./Volume";

/**
 * Ten real commissions, playable. The scope draws the signal as it arrives —
 * the song is written across the panel while you listen, which is the same
 * gesture the whole site is selling.
 *
 * Nothing is preloaded and nothing plays on arrival. As with the plucked
 * strings, sound only ever happens because someone asked for it.
 */

/** ~3.7 seconds of trail at 60fps, which is about one phrase. */
const COLUMNS = 220;

interface ReelProps {
  caption: string;
  /** Chosen numbers its rows in section codes; the others just count. */
  index?: (position: number) => string;
}

function twoDigit(position: number): string {
  return String(position + 1).padStart(2, "0");
}

export function Reel({ caption, index = twoDigit }: ReelProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [measured, setMeasured] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Set when a track change should start playing once the new src is attached. */
  const pending = useRef(false);

  const track = demos[current];
  if (!track) throw new Error("the reel needs at least one demo");

  const total = measured > 0 ? measured : track.seconds;

  const start = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    // The shared bus owns the analyser, so the scope here and the scenes in the
    // heroes are reading the same signal — and starting here hushes the hero.
    const ctx = audioContext();
    if (ctx) resumeAudio(ctx);
    play(element);
  }, []);

  const move = useCallback((position: number) => {
    pending.current = true;
    setCurrent(position);
    setElapsed(0);
    setMeasured(0);
  }, []);

  const select = useCallback(
    (position: number) => {
      const element = audioRef.current;
      if (position !== current) {
        move(position);
        return;
      }
      if (!element || element.paused) start();
      else element.pause();
    },
    [current, move, start],
  );

  /** The src swap happens on render, so playing waits for the new file to land. */
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    start();
  }, [current, start]);

  /** The scope and the played fraction both run off one frame loop. */
  useEffect(() => {
    // Under reduced motion the scope is not drawn at all; the numeric readout
    // and the seek fill carry the same information without any movement.
    if (prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const trail = new Float32Array(COLUMNS);
    const samples = new Float32Array(1024);
    let head = 0;
    let raf = 0;

    const style = getComputedStyle(canvas);
    const trace = style.getPropertyValue("--reel-trace").trim() || "currentColor";
    const edge = style.getPropertyValue("--reel-edge").trim() || trace;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 1;
    let height = 1;

    const size = () => {
      const box = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(box.width * dpr));
      height = Math.max(1, Math.round(box.height * dpr));
      canvas.width = width;
      canvas.height = height;
    };
    size();

    const observer = new ResizeObserver(size);
    observer.observe(canvas);

    const draw = () => {
      raf = requestAnimationFrame(draw);

      const element = audioRef.current;

      if (element && element.duration > 0) {
        root.style.setProperty("--played", (element.currentTime / element.duration).toFixed(4));
      }

      // On pause the trail decays rather than cutting, so it settles out.
      let peak = 0;
      if (element && !element.paused && waveform(samples)) {
        for (let i = 0; i < samples.length; i += 1) {
          const value = Math.abs(samples[i] as number);
          if (value > peak) peak = value;
        }
      } else {
        peak = (trail[(head - 1 + COLUMNS) % COLUMNS] as number) * 0.9;
      }

      trail[head] = peak;
      head = (head + 1) % COLUMNS;

      context.clearRect(0, 0, width, height);

      const middle = height / 2;
      const column = width / (COLUMNS - 1);
      // Silence still draws: the trace never thins past a hairline, so at rest
      // the scope reads as an instrument sitting idle rather than a blank box.
      const rest = Math.max(0.75, dpr * 0.5);
      const amplitude = (i: number) =>
        Math.max(rest, trail[(head + i) % COLUMNS] * middle * 0.92);

      context.beginPath();
      context.moveTo(0, middle);
      for (let i = 0; i < COLUMNS; i += 1) {
        context.lineTo(i * column, middle - amplitude(i));
      }
      for (let i = COLUMNS - 1; i >= 0; i -= 1) {
        context.lineTo(i * column, middle + amplitude(i));
      }
      context.closePath();
      context.fillStyle = trace;
      context.fill();

      // The write head: where the signal is arriving right now.
      context.fillStyle = edge;
      context.fillRect(width - Math.max(1, dpr), 0, Math.max(1, dpr), height);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = audioRef.current;
    return () => element?.pause();
  }, []);

  return (
    <div className="reel" ref={rootRef}>
      <p className="reel-caption">{caption}</p>

      <div className="reel-stage">
        <div className="reel-now">
          <p className="reel-kind">{track.kind}</p>
          <h3 className="reel-title">{track.title}</h3>
          <p className="reel-note">{track.note}</p>
        </div>

        <canvas className="reel-scope" ref={canvasRef} aria-hidden />

        <div className="reel-transport">
          <button
            type="button"
            className="reel-play"
            onClick={() => select(current)}
            aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            <span className="reel-play-mark" data-playing={playing} aria-hidden />
            <span className="reel-play-word">{playing ? "Pause" : "Play"}</span>
          </button>

          <div className="reel-seek">
            <div className="reel-seek-rail" aria-hidden>
              <div className="reel-seek-fill" />
            </div>
            <input
              type="range"
              className="reel-seek-input"
              min={0}
              max={Math.round(total)}
              step={1}
              value={Math.min(Math.round(elapsed), Math.round(total))}
              aria-label={`Seek within ${track.title}`}
              onChange={(event) => {
                const element = audioRef.current;
                const next = Number(event.target.value);
                setElapsed(next);
                if (element) element.currentTime = next;
              }}
            />
          </div>

          <Volume label="Playback volume" />

          <p className="reel-time">
            <span>{timecode(elapsed)}</span>
            <span className="reel-time-sep" aria-hidden>
              /
            </span>
            <span>{timecode(total)}</span>
          </p>
        </div>
      </div>

      <ol className="reel-list">
        {demos.map((demo, position) => (
          <li key={demo.id}>
            <button
              type="button"
              className="reel-item"
              data-current={position === current}
              data-playing={position === current && playing}
              onClick={() => select(position)}
              {...(position === current ? { "aria-current": "true" as const } : {})}
            >
              <span className="reel-item-index" aria-hidden>
                {index(position)}
              </span>
              <span className="reel-item-title">{demo.title}</span>
              <span className="reel-item-kind">{demo.kind}</span>
              <span className="reel-item-time">{timecode(demo.seconds)}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className="reel-foot">
        Every one of these was commissioned, written and produced by Dennis. They
        are here because the range is the argument.
      </p>

      <audio
        ref={audioRef}
        src={track.src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setMeasured(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          const element = event.currentTarget;
          setElapsed(element.currentTime);
          // Keeps the seek fill honest when the frame loop is not running.
          if (element.duration > 0) {
            rootRef.current?.style.setProperty(
              "--played",
              (element.currentTime / element.duration).toFixed(4),
            );
          }
        }}
        onEnded={() => move((current + 1) % demos.length)}
      />
    </div>
  );
}
