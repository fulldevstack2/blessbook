import type { CSSProperties, ElementType } from "react";

/**
 * A heading that rises into place a word at a time, each word climbing out from
 * behind its own edge.
 *
 * This is the difference between type that appears and type that arrives. The
 * mechanism is a mask per word rather than per line: line masks need measurement
 * and re-measurement on every resize and every font swap, and get it wrong often
 * enough to be visible. A word mask cannot be wrong.
 *
 * The reveal itself is fired by useScrollReveal, which already sets
 * `data-revealed` on the container; the stagger is a custom property per word so
 * CSS does the timing.
 */

interface WordsProps {
  readonly text: string;
  /** Rendered element. Headings should stay headings. */
  readonly as?: ElementType;
  readonly className?: string;
  /** Milliseconds between words. */
  readonly stagger?: number;
  /** Passed through, so a heading can still carry its own spacing. */
  readonly style?: CSSProperties;
}

export function Words({ text, as: Tag = "h2", className, stagger = 46, style }: WordsProps) {
  const words = text.split(" ");

  return (
    <Tag className={className} style={style} data-reveal="words">
      {words.map((word, index) => (
        // The trailing space is inside the mask, so the line breaks naturally.
        <span className="word" key={`${word}-${index}`}>
          <span className="word-in" style={{ "--i": index * stagger } as CSSProperties}>
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
