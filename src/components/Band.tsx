import type { Photo } from "../content/media";

/**
 * A full-bleed photographic band, used between sections.
 *
 * The page had a rhythm problem: every section carried the same generous air
 * above and below it, so the second half read as a column of blocks separated by
 * a screen of nothing. These bands take that space and put a photograph of him in
 * it — a breath rather than a gap.
 *
 * The image moves inside its own frame as the band passes (`data-parallax`
 * supplies `--shift`, the concept decides how far), and the caption is a single
 * line, because a band is a breath and not a section.
 */

interface BandProps {
  readonly photo: Photo;
  /** One line. If it needs two, it belongs in a section. */
  readonly line?: string;
  /** Taller where the frame carries the moment on its own. */
  readonly tall?: boolean;
}

export function Band({ photo, line, tall = false }: BandProps) {
  return (
    <figure className="band" data-tall={tall}>
      <div className="band-frame" data-parallax data-reveal="wipe">
        <img
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
        />
      </div>
      <figcaption className="band-caption">
        {line ? <span className="band-line">{line}</span> : null}
        <span className="band-credit">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}
