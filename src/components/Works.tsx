import { catalogue } from "../content/work";
import { Lightbox, useLightbox } from "./Lightbox";

/**
 * The catalogue, playable.
 *
 * Seventeen commissions, three of them featured above and the rest here. It was
 * a list of titles, on the argument that fourteen embeds is fourteen megabytes;
 * that was true of *embeds* and not of frames. Nothing is requested from
 * YouTube, Spotify or Instagram until a reader presses a card — what loads with
 * the page is one WebP each, served from this site, fetched once by
 * `tools/posters.py`. The whole grid is about three hundred kilobytes and it is
 * lazy, so most of it never loads at all.
 *
 * Pressing one no longer plays it in place. A card is two hundred and sixty
 * pixels across — a thumbnail with sound — so the card opens instead: the poster
 * travels out of the grid and into a stage the size the film was cut for. See
 * `Lightbox`.
 *
 * Machinery, as with the reel and the brief: a poster, a press, a frame
 * somewhere worth watching it. Each concept paints it.
 */

export function Works({ head }: { head: string }) {
  const { work: showing, from, show, hide } = useLightbox();

  return (
    <div className="gallery">
      <p className="gallery-head">{head}</p>

      <ul className="gallery-grid">
        {catalogue.map((work) => (
          <li className="gallery-item" key={work.id} data-on={work.on} data-reveal="wipe">
            <div className="gallery-frame">
              <button
                type="button"
                className="gallery-open"
                onClick={(event) => show(work, event)}
                aria-label={`Watch ${work.title}. ${work.note}`}
              >
                {work.poster ? (
                  <img
                    src={work.poster}
                    width={640}
                    height={360}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  /* Instagram hands out no frame. Rather than a grey box with a
                     broken icon in it, the card says what it is. */
                  <span className="gallery-plate" aria-hidden>
                    {work.title}
                  </span>
                )}
                <span className="gallery-mark" aria-hidden />
              </button>
            </div>

            <div className="gallery-caption">
              <h4 className="gallery-title">{work.title}</h4>
              <p className="gallery-note">{work.note}</p>
              <a
                className="gallery-on"
                href={work.href}
                rel="noreferrer noopener"
                target="_blank"
              >
                {work.on}
              </a>
            </div>
          </li>
        ))}
      </ul>

      <Lightbox work={showing} from={from} onClose={hide} />
    </div>
  );
}
