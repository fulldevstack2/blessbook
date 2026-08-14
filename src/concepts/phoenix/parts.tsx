import type { CSSProperties } from "react";
import { clientMask, clients, clientWall } from "../../content/clients";
import { artist, record, territories } from "../../content/dennis";
import type { Photo } from "../../content/media";

/**
 * Phoenix's own furniture.
 *
 * Every presentational piece on this concept now lives here and is used by no
 * other. What the three concepts still share is machinery the reader never sees:
 * the audio bus, the scroll hooks, the frame scrubber, the grain. Anything with a
 * shape of its own belongs to one concept.
 *
 * The shape here is gilding: a hairline of gold, struck numerals, engraved
 * plaques. Nothing is drawn as a dot or a chart, because this concept does not
 * measure — it strikes.
 */

/**
 * The record as gilded gauges: a hairline that fills with gold, and the figure
 * struck at the end of it. Replaces the dot field, which belonged to nobody.
 */
export function Gauges() {
  return (
    <div className="gauges">
      {record.map((item, index) => (
        <div
          className="gauge"
          key={item.label}
          data-scroll
          style={{ "--i": index } as CSSProperties}
        >
          <span className="gauge-label">{item.label}</span>
          <span className="gauge-rule" aria-hidden>
            <span className="gauge-fill" />
          </span>
          <span className="gauge-figure">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Where he has played, struck as a gilded index rather than plotted. A map is a
 * diagram; this concept sets its facts the way a plaque sets them.
 */
export function Index() {
  return (
    <div className="index">
      <p className="index-head">Five continents</p>
      <ol className="index-list">
        {territories.map((territory, index) => (
          <li key={territory.name} data-reveal style={{ "--reveal-i": index % 6 } as CSSProperties}>
            <span className="index-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="index-name">{territory.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Who books him, as engraved plaques: each mark struck into its own lacquer
 * panel with a gold hairline, the way a maker's plate is set into a case.
 */
export function Plaques() {
  return (
    <div className="plaques">
      <p className="plaques-eyebrow" data-reveal>
        {clientWall.eyebrow}
      </p>
      <h2 className="plaques-lede" data-reveal>
        {clientWall.lede}
      </h2>
      <ul className="plaques-list">
        {clients.map((client, index) => (
          <li
            className="plaque"
            key={client.slug}
            data-reveal
            style={{ "--reveal-i": index % 7 } as CSSProperties}
          >
            <span
              className="plaque-mark"
              style={{ "--mask": `url("${clientMask(client)}")` } as CSSProperties}
              aria-hidden
            />
            <span className="visually-hidden">{client.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** His name struck across the page in gold, once, at the size of a hall sign. */
export function Struck() {
  return (
    <div className="struck" data-scroll aria-hidden>
      <span className="struck-name">{artist.name}</span>
      <span className="struck-cn" lang="zh">
        {artist.chineseName}
      </span>
    </div>
  );
}

/** A gilded photographic plate, full bleed, between movements. */
export function Plate({ photo, line, tall = false }: { photo: Photo; line?: string; tall?: boolean }) {
  return (
    <figure className="gplate" data-tall={tall}>
      <div className="gplate-frame" data-parallax data-reveal="wipe">
        <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" />
      </div>
      <figcaption className="gplate-caption">
        {line ? <span className="gplate-line">{line}</span> : null}
        <span className="phoenix-credit">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}
