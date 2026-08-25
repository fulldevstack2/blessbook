import { useCallback, useEffect, useRef, useState } from "react";
import { demos, timecode } from "../content/work";
import { audioContext, resumeAudio } from "../lib/audioContext";
import { play, waveform } from "../lib/listening";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";
import { Crawl } from "./Crawl";
import { Volume } from "./Volume";

/**
 * Ten real commissions, as a wall of plaques.
 *
 * It was one player with a list of titles underneath it, which made nine of the
 * ten songs a line of text and the tenth a thing you could hear. A plaque is an
 * object: ten of them read as a body of work at a glance, and the one you press
 * turns into the player rather than driving a player somewhere else on the page.
 * The scope is drawn inside it, so the signal is written across the object being
 * listened to.
 *
 * Two faces per plaque, both always in the DOM because that is what lets the
 * turn be a turn. Whichever is facing away is `inert`, so a keyboard never lands
 * on a control it cannot see — a flip that leaves a focusable button behind its
 * own back is the commonest bug in this pattern.
 *
 * How a plaque opens belongs to each concept, not here: Phoenix turns it like a
 * struck medal, Nocturne brings a lamp up on it, Dragon floods it with ink. All
 * three are the same DOM and the same state; see `.plaque` in the three
 * stylesheets. Nothing is preloaded and nothing plays on arrival.
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
  /** Which plaque is turned over. Null until one is pressed. */
  const [open, setOpen] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [measured, setMeasured] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Set when a track change should start playing once the new src is attached. */
  const pending = useRef(false);

  const current = open ?? 0;
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
    play(element, { title: track.title, where: track.kind });
  }, [track]);

  /** Turn a plaque over and play it. Pressing the open one closes it. */
  const turn = useCallback(
    (position: number) => {
      if (position === open) {
        audioRef.current?.pause();
        setOpen(null);
        return;
      }
      pending.current = true;
      setOpen(position);
      setElapsed(0);
      setMeasured(0);
    },
    [open],
  );

  /** The src swap happens on render, so playing waits for the new file to land. */
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    start();
  }, [open, start]);

  /** The scope and the played fraction both run off one frame loop.
   *
   *  The canvas lives inside whichever plaque is open, so it unmounts and
   *  remounts as the reader moves between them — which is why the loop reads the
   *  ref every frame and re-measures when the element changes, rather than
   *  capturing it once at setup. */
  useEffect(() => {
    // Under reduced motion the scope is not drawn at all; the numeric readout
    // and the seek fill carry the same information without any movement.
    if (prefersReducedMotion()) return;

    const root = rootRef.current;
    if (!root) return;

    const trail = new Float32Array(COLUMNS);
    const samples = new Float32Array(1024);
    let head = 0;
    let raf = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let seen: HTMLCanvasElement | null = null;
    let width = 1;
    let height = 1;
    let trace = "currentColor";
    let edge = "currentColor";

    const size = (canvas: HTMLCanvasElement) => {
      const box = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(box.width * dpr));
      height = Math.max(1, Math.round(box.height * dpr));
      canvas.width = width;
      canvas.height = height;
      const style = getComputedStyle(canvas);
      trace = style.getPropertyValue("--reel-trace").trim() || "currentColor";
      edge = style.getPropertyValue("--reel-edge").trim() || trace;
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);

      const element = audioRef.current;
      if (element && element.duration > 0) {
        root.style.setProperty("--played", (element.currentTime / element.duration).toFixed(4));
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        seen = null;
        return;
      }
      if (canvas !== seen) {
        seen = canvas;
        size(canvas);
        // A new plaque is a new signal: clear the trail rather than letting the
        // previous track's decay draw itself across a fresh scope.
        trail.fill(0);
        head = 0;
      }
      const context = canvas.getContext("2d");
      if (!context) return;

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
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const element = audioRef.current;
    return () => element?.pause();
  }, []);

  return (
    <div className="reel" ref={rootRef}>
      <p className="reel-caption">{caption}</p>

      <ol className="plaques">
        {demos.map((demo, position) => {
          const on = position === open;
          return (
            <li className="plaque" key={demo.id} data-open={on} data-playing={on && playing}>
              <div className="plaque-turn">
                {/* The face: what it is, before you have heard it. */}
                <div className="plaque-face" inert={on}>
                  <button
                    type="button"
                    className="plaque-press"
                    onClick={() => turn(position)}
                    aria-label={`Play ${demo.title} — ${demo.note}`}
                  >
                    <span className="plaque-index" aria-hidden>
                      {index(position)}
                    </span>
                    <span className="plaque-name">{demo.title}</span>
                    <span className="plaque-kind">{demo.kind}</span>
                    <span className="plaque-foot">
                      <span className="plaque-time">{timecode(demo.seconds)}</span>
                      <span className="plaque-mark" aria-hidden />
                    </span>
                  </button>
                </div>

                {/* The reverse: the player, and the signal written across it. */}
                <div className="plaque-back" inert={!on}>
                  {on ? (
                    <>
                      {/* What you are listening to, still said while you listen.
                          The face has turned away, so the reverse has to carry
                          the name — a player that only tells you the number of
                          the thing playing is a player you have to turn back to
                          read. Both lines travel if they do not fit; see
                          `Crawl`. */}
                      <p className="plaque-said">
                        <span className="plaque-said-index" aria-hidden>
                          {index(position)}
                        </span>
                        <Crawl className="plaque-said-name" running={playing}>
                          {demo.title}
                        </Crawl>
                        <span className="plaque-said-kind">{demo.kind}</span>
                      </p>

                      <p className="plaque-note">
                        <Crawl running={playing}>{demo.note}</Crawl>
                      </p>
                      <canvas className="plaque-scope reel-scope" ref={canvasRef} aria-hidden />

                      <div className="plaque-transport">
                        <button
                          type="button"
                          className="plaque-play"
                          onClick={() => {
                            const element = audioRef.current;
                            if (!element) return;
                            if (element.paused) start();
                            else element.pause();
                          }}
                          aria-label={playing ? `Pause ${demo.title}` : `Play ${demo.title}`}
                        >
                          <span className="plaque-play-mark" data-playing={playing} aria-hidden />
                        </button>

                        <div className="plaque-seek reel-seek">
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
                            aria-label={`Seek within ${demo.title}`}
                            onChange={(event) => {
                              const element = audioRef.current;
                              const next = Number(event.target.value);
                              setElapsed(next);
                              if (element) element.currentTime = next;
                            }}
                          />
                        </div>

                        <p className="plaque-clock">
                          <span>{timecode(elapsed)}</span>
                          <span className="plaque-clock-sep" aria-hidden>
                            /
                          </span>
                          <span>{timecode(total)}</span>
                        </p>
                      </div>

                      <div className="plaque-tail">
                        <Volume label="Playback volume" />
                        <button
                          type="button"
                          className="plaque-shut"
                          onClick={() => turn(position)}
                        >
                          Turn back
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="reel-foot">
        Every one of these was commissioned, written and produced by Dennis, and
        no two of them were asked for by the same kind of client.
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
        /* On to the next plaque, which turns as it starts — the wall plays
           through in order if you leave it alone. */
        onEnded={() => {
          const next = (current + 1) % demos.length;
          pending.current = true;
          setOpen(next);
          setElapsed(0);
          setMeasured(0);
        }}
      />
    </div>
  );
}
