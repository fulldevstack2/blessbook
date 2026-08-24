import { useState } from "react";
import { films } from "../../content/work";
import { pauseAll } from "../../lib/listening";
import { Works } from "../../components/Works";

/**
 * Three films of the work in the room it was written for. The poster frames are
 * served from this site and nothing is requested from YouTube until someone
 * presses play — same rule as the strings and the reel, and it keeps the page
 * weight honest.
 */
export function Films({ caption }: { caption: string }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="films">
      <p className="films-caption">{caption}</p>

      {films.map((film) => (
        <figure className="film" key={film.id} data-reveal="wipe">
          <div className="film-frame">
            {open === film.id ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0`}
                title={film.title}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
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
                  onClick={() => {
                // A YouTube embed cannot be metered or faded, so stop ours first.
                pauseAll();
                setOpen(film.id);
              }}
                  aria-label={`Play ${film.title} on YouTube`}
                >
                  <span className="film-open-mark" aria-hidden />
                  <span className="film-open-word">Play film</span>
                </button>
              </>
            )}
          </div>
          <figcaption className="film-caption">
            <h3 className="film-title">{film.title}</h3>
            <p className="film-note">{film.note}</p>
          </figcaption>
        </figure>
      ))}

      <Works head="Also written and produced" />
    </div>
  );
}
