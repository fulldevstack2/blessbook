/**
 * A real five-line stave carrying a real phrase, drawn as plain SVG so it takes
 * the concept's own colour. Used where a section needs a rule anyway — the
 * notation replaces the rule rather than sitting on top of it as an ornament.
 */

export interface StaveNote {
  /** Staff step: 0 is the bottom line, 1 the space above it, and so on. */
  readonly step: number;
  /** Duration in beats — sets notehead fill and stem flags. */
  readonly beats: 1 | 2 | 4;
}

/** Four bars that outline the shape of the offer: ask, wait, hear, own. */
export const commissionPhrase: readonly StaveNote[] = [
  { step: 2, beats: 1 },
  { step: 4, beats: 1 },
  { step: 6, beats: 2 },
  { step: 5, beats: 1 },
  { step: 3, beats: 1 },
  { step: 7, beats: 2 },
  { step: 6, beats: 1 },
  { step: 4, beats: 1 },
  { step: 2, beats: 4 },
];

const LINE_GAP = 7;
const TOP = 10;
const STEP = LINE_GAP / 2;
const LEFT = 46;
const NOTE_GAP = 34;

interface StaveProps {
  notes?: readonly StaveNote[];
  timeSignature?: string;
  tempo?: string;
  className?: string;
}

export function Stave({
  notes = commissionPhrase,
  timeSignature = "4/4",
  tempo,
  className,
}: StaveProps) {
  const width = LEFT + notes.length * NOTE_GAP + 30;
  const height = TOP + LINE_GAP * 4 + 26;
  const bottom = TOP + LINE_GAP * 4;

  return (
    <svg
      className={`stave ${className ?? ""}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label={`A four-bar phrase in ${timeSignature}${tempo ? `, ${tempo}` : ""}`}
    >
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1="0"
          x2={width}
          y1={TOP + line * LINE_GAP}
          y2={TOP + line * LINE_GAP}
          className="stave-line"
        />
      ))}

      <text x="10" y={bottom - LINE_GAP * 0.6} className="stave-meter">
        {timeSignature.split("/")[0]}
      </text>
      <text x="10" y={bottom} className="stave-meter">
        {timeSignature.split("/")[1]}
      </text>

      {notes.map((note, index) => {
        const x = LEFT + index * NOTE_GAP;
        const y = bottom - note.step * STEP;
        const stemUp = note.step < 5;
        const stemY = stemUp ? y - 20 : y + 20;

        return (
          <g key={`${note.step}-${index}`} className="stave-note">
            {/* Ledger line for notes that sit off the stave. */}
            {note.step > 8 && (
              <line x1={x - 7} x2={x + 7} y1={TOP - LINE_GAP} y2={TOP - LINE_GAP} className="stave-line" />
            )}
            <ellipse
              cx={x}
              cy={y}
              rx="4.2"
              ry="3.1"
              transform={`rotate(-18 ${x} ${y})`}
              className={note.beats === 4 ? "stave-head stave-head--open" : "stave-head"}
            />
            {note.beats !== 4 && (
              <line
                x1={stemUp ? x + 4 : x - 4}
                x2={stemUp ? x + 4 : x - 4}
                y1={y}
                y2={stemY}
                className="stave-stem"
              />
            )}
            {note.beats === 1 && (
              <line
                x1={stemUp ? x + 4 : x - 4}
                x2={stemUp ? x + 12 : x - 12}
                y1={stemY}
                y2={stemY + (stemUp ? 6 : -6)}
                className="stave-stem"
              />
            )}
          </g>
        );
      })}

      {tempo && (
        <text x="0" y={height - 4} className="stave-tempo">
          {tempo}
        </text>
      )}
    </svg>
  );
}
