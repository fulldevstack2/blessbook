import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { commission, promise } from "../content/commission";
import { artist, record } from "../content/dennis";
import { photos } from "../content/media";
import { concepts, type Concept } from "../concepts/registry";
import { useFonts } from "../lib/useFonts";
import "./chooser.css";

/**
 * The front door, and the only page on this site that is not part of the work.
 *
 * The people who open it are Dennis and his team, and the first draft made that
 * a puzzle: it wore his own masthead, quoted his own biography back at him, and
 * only mentioned three designs in the fifth sentence of a paragraph. Reading it
 * as its actual audience, the questions are obvious. What am I looking at. What
 * is the same between these and what is different. What do I do next. So the
 * page answers those three in that order, and his record appears once, low, with
 * a reason to be there: it is the material every design is set from, and he is
 * the only person who can tell us whether it is right.
 */

const CHOOSER_FONTS =
  "https://fonts.googleapis.com/css2?family=Commissioner:wght@200..800&family=Martian+Mono:wght@300..600&display=swap";

/** Each panel is painted in its own concept's colours so the sheet compares palettes honestly. */
function panelStyle(concept: Concept): CSSProperties {
  const [first, ...rest] = concept.swatches;
  const background = first?.value ?? "#111";
  const accent = rest.at(-1)?.value ?? "#999";
  const foreground = concept.theme === "dark" ? "oklch(92% 0.01 85)" : "oklch(24% 0.012 250)";

  return {
    "--panel-bg": background,
    "--panel-fg": foreground,
    "--panel-accent": accent,
    "--panel-display": `"${concept.display}", serif`,
  } as CSSProperties;
}

/** What to do with this page, in the order you would do it. */
const HOW = [
  "Open all three. Each one is two pages — the work first, then the man behind it — scroll and sound included.",
  "The writing, the music and the photographs are identical in all three. Only the design changes.",
  "Come back with the direction you want and anything you would change inside it.",
];

export function ChooserPage() {
  useFonts(CHOOSER_FONTS);
  // The specimens need each concept's display face, so load all three sheets here.
  useFonts(concepts[0]?.fonts ?? CHOOSER_FONTS);
  useFonts(concepts[1]?.fonts ?? CHOOSER_FONTS);
  useFonts(concepts[2]?.fonts ?? CHOOSER_FONTS);

  return (
    <div className="chooser">
      <header className="chooser-head">
        <div>
          <p className="chooser-kicker">Design proposal · Three directions</p>
          <h1 className="chooser-wordmark">Blesspoke</h1>
          <p className="chooser-lede">
            Three complete designs for the site where a client commissions a song from{" "}
            {artist.name}.
          </p>
        </div>
        <ol className="chooser-promise">
          {HOW.map((line, index) => (
            <li key={line}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {line}
            </li>
          ))}
        </ol>
      </header>

      <p className="chooser-note">
        The site sells one thing. A client writes a paragraph about who the song is for and
        what it should say, {artist.name}'s team replies from their own address, a private
        sample comes back inside seven days, and the finished song transfers to the client in
        full. Everything above that on the page is the case for handing him the job, and the
        three designs below each make that case a different way.
      </p>

      <div className="chooser-band">
        <p className="chooser-kicker">The three directions</p>
        <p className="chooser-band-note">
          Each one is named after an instrument built to {artist.name}'s own drawings. Open a
          design and it takes the whole window; the link in the top left corner brings you
          back here.
        </p>
      </div>

      <ul className="chooser-grid">
        {concepts.map((concept) => (
          <li key={concept.id}>
            <Link className="chooser-panel" to={concept.path} style={panelStyle(concept)}>
              <span className="chooser-panel-top">
                <span>Design {concept.ordinal}</span>
                <span>{concept.theme === "dark" ? "Dark" : "Daylight"}</span>
              </span>

              <span>
                <span className="chooser-panel-name">{concept.name}</span>
                <span className="chooser-panel-tag"> · {concept.tagline}</span>
              </span>

              <span className="chooser-specimen">{promise.headline}</span>

              <span className="chooser-swatches" aria-hidden>
                {concept.swatches.map((swatch) => (
                  <span
                    key={swatch.name}
                    className="chooser-swatch"
                    style={{ background: swatch.value }}
                  />
                ))}
              </span>

              <span className="chooser-panel-premise">{concept.premise}</span>
              <span className="chooser-panel-cta">Open design {concept.ordinal} &rarr;</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="chooser-band">
        <p className="chooser-kicker">The record all three are built from</p>
        <p className="chooser-band-note">
          Taken from {artist.name}'s own site and his published biography. Anything wrong here
          is wrong in all three designs, so it is worth a read.
        </p>
      </div>

      <section className="chooser-artist">
        <img
          className="chooser-artist-photo"
          src={photos.press.src}
          width={photos.press.width}
          height={photos.press.height}
          alt={photos.press.alt}
        />
        <div>
          <p className="chooser-artist-name">
            {artist.name}
            <span className="chooser-artist-cn" lang="zh">
              {artist.chineseName}
            </span>
          </p>
          <p className="chooser-artist-roles">
            {artist.roles} · {artist.city}
          </p>
          <p className="chooser-artist-line">{artist.oneLine}</p>
        </div>
        <dl className="chooser-tallies">
          {record.slice(0, 4).map((item) => (
            <div className="chooser-tally" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="chooser-foot">
        <p>
          Commissions from {commission.from} · {commission.turnaround} · {promise.ownership}
        </p>
      </footer>
    </div>
  );
}
