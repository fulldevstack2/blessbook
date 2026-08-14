import { useState, type CSSProperties, type ReactNode } from "react";
import { clients } from "../../content/clients";
import { territories } from "../../content/dennis";
import { films } from "../../content/work";
import { pauseAll } from "../../lib/listening";
import { ScrollStage } from "../../lib/ScrollStage";
import type { Photo } from "../../content/media";

/**
 * Dragon's own furniture.
 *
 * Nothing here is used by another concept, and nothing another concept uses is
 * used here. Dragon had been borrowing Phoenix's masked logo wall, its unit
 * field, its dot map and its engraved stave, which made two different design
 * directions read as one template painted twice.
 *
 * Everything below comes from the same object the concept is built on: a hand
 * scroll. It unrolls, it is stamped with seals, and it is written with a brush.
 */

/** The pinned frame that pulls its contents sideways as the page goes down. */
export function Unroll({
  vh = 320,
  className,
  children,
}: {
  vh?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ScrollStage vh={vh} cuts={1} className={`unroll ${className ?? ""}`}>
      {() => (
        <div className="unroll-frame">
          <div className="unroll-track">{children}</div>
        </div>
      )}
    </ScrollStage>
  );
}

/**
 * Who books him, unrolled: the names written out along the scroll, each closed
 * with a cinnabar seal. No logos — a hand scroll does not carry trademarks, it
 * carries a hand.
 */
export function ClientScroll() {
  return (
    <Unroll className="dragon-clients" vh={300}>
      <div className="dragon-clients-head">
        <span className="dragon-clients-mark" lang="zh">
          请
        </span>
        <span className="dragon-clients-label">Who has asked for him</span>
      </div>
      {clients.map((client) => (
        <div className="dragon-client" key={client.slug}>
          <span className="dragon-client-name">{client.name}</span>
          <span className="dragon-client-field">{client.field}</span>
          <span className="dragon-client-seal" aria-hidden />
        </div>
      ))}
    </Unroll>
  );
}

/**
 * Where he has played, as chops stamped into the paper — the way a travelling
 * scroll collects the seals of everywhere it has been. Each is set at its own
 * angle because a hand never stamps twice the same.
 */
export function Stamps() {
  return (
    <div className="stamps">
      <p className="stamps-label">
        <span lang="zh">印</span> Twelve territories, stamped
      </p>
      <ul className="stamps-list">
        {territories.map((territory, index) => (
          <li
            className="stamp"
            key={territory.name}
            data-reveal
            style={
              {
                "--tilt": `${(((index * 37) % 9) - 4) * 0.9}deg`,
                "--reveal-i": index % 6,
              } as CSSProperties
            }
          >
            <span className="stamp-name">{territory.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One bow stroke, drawn as you arrive: a tapered sumi mark that starts thin,
 * presses, and lifts. It replaces the engraved stave here — engraving belongs to
 * the gilded concept; this one is written, not printed.
 */
export function BrushStroke({ caption }: { caption: string }) {
  return (
    <figure className="brush" data-scroll>
      <svg className="brush-mark" viewBox="0 0 900 220" role="img" aria-label="A single brush stroke, drawn left to right.">
        {/* Two overlaid paths: the wet body of the stroke, and its dry tail. */}
        <path
          className="brush-body"
          pathLength={1}
          d="M40 150 C 180 96, 300 78, 430 92 C 560 106, 660 132, 860 78"
        />
        <path
          className="brush-dry"
          pathLength={1}
          d="M46 158 C 190 108, 310 90, 436 104 C 566 118, 664 142, 858 88"
        />
      </svg>
      <figcaption className="brush-caption">{caption}</figcaption>
    </figure>
  );
}

/** A photograph washed into the paper, torn at both edges. */
export function Wash({ photo, line }: { photo: Photo; line?: string }) {
  return (
    <figure className="wash" data-parallax data-scroll>
      <div className="wash-frame">
        <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" />
      </div>
      <figcaption className="wash-caption">
        {line ? <span className="wash-line">{line}</span> : null}
        <span className="dragon-credit">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}

/**
 * The films as three hanging scrolls, opened one at a time. Nothing is fetched
 * from YouTube until a scroll is opened, and opening one hushes anything of ours
 * that is playing.
 */
export function FilmScrolls({ caption }: { caption: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const numerals = ["一", "二", "三", "四"];

  return (
    <div className="scrolls">
      <p className="scrolls-caption">{caption}</p>
      <div className="scrolls-row">
        {films.map((film, index) => (
          <figure className="scroll" key={film.id} data-open={open === film.id} data-reveal="wipe">
            <span className="scroll-rod" aria-hidden />
            <div className="scroll-frame">
              {open === film.id ? (
                <iframe
                  className="scroll-media"
                  src={`https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0`}
                  title={film.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="scroll-open"
                  onClick={() => {
                    pauseAll();
                    setOpen(film.id);
                  }}
                  aria-label={`Play ${film.title}`}
                >
                  <img src={film.poster} alt="" width={1280} height={720} loading="lazy" />
                  <span className="scroll-numeral" lang="zh" aria-hidden>
                    {numerals[index]}
                  </span>
                </button>
              )}
            </div>
            <figcaption className="scroll-caption">
              <span className="scroll-title">{film.title}</span>
              <span className="scroll-note">{film.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
