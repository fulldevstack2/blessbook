import { useRef, type CSSProperties } from "react";
import { score, staffPosition } from "../content/score";
import { listen } from "../lib/listening";
import { audioContext, resumeAudio } from "../lib/audioContext";
import { livePhrase } from "../content/media";
import { useSectionProgress } from "../lib/useSectionProgress";
import { useState } from "react";

/**
 * Four bars, engraved.
 *
 * The site kept saying "musical" in its labels — movements, markings, tempi —
 * without ever putting music on the page. This does: a real treble staff with
 * real noteheads, stems and beams, laid out diatonically from the contour in
 * `content/score.ts`, which was taken off his own recording.
 *
 * It writes itself as you scroll: the staff lines draw left to right, each note
 * arrives as the scroll passes its bar, and pressing play walks a barline across
 * it in time with the audio. Everything is geometry and CSS custom properties —
 * no notation font, no icon set, nothing to load.
 */

const SPACE = 11; // one staff space
const HALF = SPACE / 2;
const EIGHTH = 27; // horizontal distance per eighth note
const LEFT = 26;
const TOP = 46; // room above the staff for stems, beams and the tempo mark
const STAFF_HEIGHT = SPACE * 4;
const STEM = SPACE * 2.8;
const BEAM = 5.2;
/** Engravers cap a beam's slope; without this a big leap looks like a ramp. */
const MAX_SLOPE = 13;

const totalEighths = score.notes.reduce((sum, note) => sum + note.eighths, 0);
const WIDTH = LEFT * 2 + totalEighths * EIGHTH;
const HEIGHT = TOP + STAFF_HEIGHT + 46;

interface Placed {
  readonly midi: number;
  readonly eighths: number;
  readonly at: number;
  readonly x: number;
  readonly y: number;
  readonly up: boolean;
  /** Where this note's stem ends — on the beam, when it is beamed. */
  stemY: number;
  /** Index of the note it beams to, when this is the first of a pair. */
  readonly beamTo: number | null;
}

/** Laid out once at module load: the phrase never changes. */
const placed: readonly Placed[] = (() => {
  const notes: Placed[] = [];
  let at = 0;

  score.notes.forEach((note, index) => {
    const position = staffPosition(note.midi);
    const previous = score.notes[index - 1];
    const beamsBack = note.eighths === 1 && previous?.eighths === 1 && at % 2 === 1;
    const next = score.notes[index + 1];
    const beamsOn = note.eighths === 1 && next?.eighths === 1 && at % 2 === 0;

    const y = TOP + STAFF_HEIGHT - position * HALF;
    // Stems turn at the middle line, as an engraver would set them.
    const up = position < 4;

    notes.push({
      midi: note.midi,
      eighths: note.eighths,
      at,
      x: LEFT + at * EIGHTH,
      y,
      up,
      stemY: up ? y - STEM : y + STEM,
      beamTo: beamsOn ? index + 1 : null,
    });
    void beamsBack;
    at += note.eighths;
  });

  // Beamed pairs share one line, and both stems are cut to it — which is what
  // makes engraved music look engraved rather than assembled.
  notes.forEach((note) => {
    if (note.beamTo === null) return;
    const partner = notes[note.beamTo];
    if (!partner) return;
    const slope = Math.max(-MAX_SLOPE, Math.min(MAX_SLOPE, partner.stemY - note.stemY));
    // Both stems reach outward far enough that neither is shorter than a space.
    const outward = note.up ? Math.min : Math.max;
    const start = outward(note.stemY, partner.stemY - slope);
    note.stemY = start;
    partner.stemY = start + slope;
  });

  return notes;
})();

const barlines = Array.from({ length: Math.floor(totalEighths / 8) }, (_, index) => index + 1);

function stemEnd(note: Placed): number {
  return note.stemY;
}

export function Score({ caption }: { caption?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  useSectionProgress(root, { ease: 0.1 });

  const toggle = () => {
    const element = audioRef.current;
    if (!element) return;
    if (!element.paused) {
      element.pause();
      return;
    }
    listen(element);
    const ctx = audioContext();
    if (ctx) resumeAudio(ctx);
    void element.play().catch(() => setPlaying(false));
  };

  return (
    <div className="score" ref={root} data-playing={playing}>
      <svg
        className="score-sheet"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Four bars in ${score.key}, ${score.meter}, at ${score.bpm} beats per minute: the melodic contour of ${score.source}.`}
      >
        {/* the five lines, drawn left to right on scroll */}
        <g className="score-staff">
          {[0, 1, 2, 3, 4].map((line) => (
            <line
              key={line}
              x1={LEFT * 0.4}
              x2={WIDTH - LEFT * 0.4}
              y1={TOP + line * SPACE}
              y2={TOP + line * SPACE}
              pathLength={1}
              style={{ "--t": (line * 0.06).toFixed(2) } as CSSProperties}
            />
          ))}
        </g>

        {/* bars, and the double bar that ends the phrase */}
        <g className="score-bars">
          {barlines.map((bar) => (
            <line
              key={bar}
              x1={LEFT + bar * 8 * EIGHTH - EIGHTH * 0.5}
              x2={LEFT + bar * 8 * EIGHTH - EIGHTH * 0.5}
              y1={TOP}
              y2={TOP + STAFF_HEIGHT}
              style={{ "--t": ((bar * 8) / totalEighths).toFixed(3) } as CSSProperties}
            />
          ))}
        </g>

        {/* beams first, so the noteheads sit on top of them */}
        <g className="score-beams">
          {placed.map((note) =>
            note.beamTo === null ? null : (
              <polygon
                key={`beam-${note.at}`}
                points={(() => {
                  const partner = placed[note.beamTo] as Placed;
                  const y1 = stemEnd(note);
                  const y2 = stemEnd(partner);
                  const x1 = note.x + (note.up ? 6 : -6);
                  const x2 = partner.x + (partner.up ? 6 : -6);
                  const thickness = note.up ? BEAM : -BEAM;
                  return `${x1},${y1} ${x2},${y2} ${x2},${y2 + thickness} ${x1},${y1 + thickness}`;
                })()}
                style={{ "--t": (note.at / totalEighths).toFixed(3) } as CSSProperties}
              />
            ),
          )}
        </g>

        <g className="score-notes">
          {placed.map((note) => (
            <g
              key={`${note.at}-${note.midi}`}
              className="score-note"
              style={{ "--t": (note.at / totalEighths).toFixed(3) } as CSSProperties}
            >
              <line
                className="score-stem"
                x1={note.x + (note.up ? 6 : -6)}
                x2={note.x + (note.up ? 6 : -6)}
                y1={note.y}
                y2={stemEnd(note)}
              />
              {/* Noteheads are ellipses on a slant, the way a nib cuts them. */}
              <ellipse
                className="score-head"
                cx={note.x}
                cy={note.y}
                rx={7.2}
                ry={5.1}
                transform={`rotate(-20 ${note.x} ${note.y})`}
              />
            </g>
          ))}
        </g>

        {/* the playhead: a barline walking the phrase while it sounds */}
        <line
          className="score-playhead"
          x1={LEFT}
          x2={LEFT}
          y1={TOP - SPACE}
          y2={TOP + STAFF_HEIGHT + SPACE}
          style={{ "--span": `${totalEighths * EIGHTH}` } as CSSProperties}
        />
      </svg>

      <div className="score-legend">
        <button type="button" className="score-play" onClick={toggle}>
          <span className="score-play-mark" data-playing={playing} aria-hidden />
          <span>{playing ? "Playing" : "Play the phrase"}</span>
        </button>
        <p className="score-meta">
          {score.key} · {score.meter} · quarter note = {score.bpm}
        </p>
        <p className="score-provenance">
          {caption ?? `${score.provenance} — ${score.source}`}
        </p>
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
            root.current?.style.setProperty(
              "--played",
              (element.currentTime / element.duration).toFixed(4),
            );
          }
        }}
      />
    </div>
  );
}
