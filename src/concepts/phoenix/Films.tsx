import { films } from "../../content/work";
import { Lightbox, useLightbox } from "../../components/Lightbox";
import { Works } from "../../components/Works";

/**
 * Three films of the work in the room it was written for. The poster frames are
 * served from this site and nothing is requested from YouTube until someone
 * presses play — same rule as the strings and the reel, and it keeps the page
 * weight honest.
 *
 * They open into the same stage the catalogue does. A film played inside a
 * third of a column is a film nobody watches to the end, and there was no reason
 * for three of the seventeen to be the ones shown small.
 */
export function Films({ caption }: { caption: string }) {
  const { work, from, show, hide } = useLightbox();

  return (
    <div className="films">
      <p className="films-caption">{caption}</p>

      {films.map((film) => (
        <figure className="film" key={film.id} data-reveal="wipe">
          <div className="film-frame">
            <img
              src={film.poster}
              width={1280}
              height={720}
              alt={`Still from ${film.title}`}
              loading="lazy"
            />
            <button
              type="button"
              className="film-open"
              onClick={(event) => show(film, event)}
              aria-label={`Watch ${film.title}. ${film.note}`}
            >
              <span className="film-open-mark" aria-hidden />
              <span className="film-open-word">Play film</span>
            </button>
          </div>
          <figcaption className="film-caption">
            <h3 className="film-title">{film.title}</h3>
            <p className="film-note">{film.note}</p>
          </figcaption>
        </figure>
      ))}

      <Lightbox work={work} from={from} onClose={hide} />

      <Works head="Also written and produced" />
    </div>
  );
}
