import { clients } from "../../content/clients";
import { films } from "../../content/work";
import { record } from "../../content/dennis";
import { useState } from "react";
import { useReady } from "../../lib/useReady";
import { photos } from "../../content/media";

/**
 * Nocturne's own furniture.
 *
 * The three concepts had drifted into being one template in three palettes:
 * the same masked logo wall, the same unit field, the same engraved stave,
 * recoloured. Presentation belongs to the concept, so these live here and are
 * used nowhere else. What stays shared is machinery the reader never sees — the
 * audio bus, the scroll hooks, the frame scrubber.
 *
 * Everything here is drawn from one idea: a printed programme for tonight.
 */

/** The client list as a cast page: names set, not logos pasted. */
export function Cast() {
  return (
    <div className="cast">
      <p className="cast-head">
        <em>with</em> THE COMPLIMENTS <em>of</em>
      </p>
      <ul className="cast-list">
        {clients.map((client) => (
          <li className="cast-item" key={client.slug}>
            <span className="cast-name">{client.name}</span>
            <span className="cast-leader" aria-hidden />
            <span className="cast-field">{client.field}</span>
          </li>
        ))}
      </ul>
      <p className="cast-foot">
        Engagements, not endorsements. Each of these has had him in the room.
      </p>
    </div>
  );
}

/** The record as a house board: figures with dotted leaders, as a box office posts them. */
export function BoxOffice() {
  return (
    <div className="board">
      <p className="board-head">
        THE HOUSE <em>to</em> DATE
      </p>
      <dl className="board-list">
        {record.map((item) => (
          <div className="board-row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              <span className="board-leader" aria-hidden />
              <span className="board-figure">{item.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The films as tonight's programme: one on the bill, the rest listed beneath it
 * with their running times. Nothing loads from YouTube until a title is pressed.
 */
export function Programme() {
  const [opened, setOpened] = useState<string | null>(null);
  const [featured, setFeatured] = useState(0);
  const film = films[featured];
  if (!film) throw new Error("the programme needs at least one film");

  return (
    <div className="programme">
      <div className="programme-bill">
        {opened === film.id ? (
          <iframe
            className="programme-frame"
            src={`https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0`}
            title={film.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="programme-open"
            onClick={() => setOpened(film.id)}
            aria-label={`Play ${film.title}`}
          >
            <img src={film.poster} alt="" width={1280} height={720} loading="lazy" />
            <span className="programme-open-word">
              <em>play</em> TONIGHT&rsquo;S FILM
            </span>
          </button>
        )}
      </div>

      <ol className="programme-list">
        {films.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className="programme-item"
              data-current={index === featured}
              onClick={() => {
                setFeatured(index);
                setOpened(null);
              }}
            >
              <span className="programme-index">{["I", "II", "III", "IV"][index]}</span>
              <span className="programme-title">{item.title}</span>
              <span className="programme-note">{item.note}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A printed rule between the halves of the evening. */
export function Interval({ label = "Interval" }: { label?: string }) {
  return (
    <div className="interval" aria-hidden>
      <span className="interval-rule" />
      <span className="interval-word">{label}</span>
      <span className="interval-rule" />
    </div>
  );
}


/**
 * House lights. One lamp comes up on an empty velvet house while the page loads,
 * and when it is ready the curtain parts — the same gesture the hero makes, so
 * arriving and scrolling are one continuous movement.
 */
export function Loader() {
  const ready = useReady(photos.press.src);

  return (
    <div className="house" data-ready={ready} aria-hidden={ready}>
      <div className="house-half house-half--left" />
      <div className="house-half house-half--right" />
      <span className="house-lamp" />
      <p className="house-name">
        <em>the</em> Dennis Lau
      </p>
      <p className="house-mark">03 · Nocturne — Velvet and lamplight</p>
    </div>
  );
}
