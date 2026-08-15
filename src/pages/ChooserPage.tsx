import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { commission, promise } from "../content/commission";
import { artist, record } from "../content/dennis";
import { photos } from "../content/media";
import { concepts, type Concept } from "../concepts/registry";
import { useFonts } from "../lib/useFonts";
import "./chooser.css";

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
          <p className="chooser-kicker">
            {artist.roles} · {artist.city}
          </p>
          <h1 className="chooser-wordmark">
            {artist.name}
            <span className="chooser-wordmark-cn" lang="zh">
              {artist.chineseName}
            </span>
          </h1>
          <p className="chooser-showman">{artist.showman}</p>
        </div>
        <ul className="chooser-promise">
          <li>
            <span>01</span>
            First anywhere to play a six-string 24K gold violin
          </li>
          <li>
            <span>02</span>
            Two sold-out concerts of three thousand seats
          </li>
          <li>
            <span>03</span>
            Patek Philippe, Porsche, Dunhill, Grand Hyatt
          </li>
        </ul>
      </header>

      <p className="chooser-note">
        This is {artist.name}'s site. He has spent eighteen years on stage, in five
        continents, in front of a hundred and sixty-eight thousand people. The
        quietest thing he does is write one song for one person, and that is what
        Blesspoke is. Below are three complete design directions for that site, each
        named after one of the three instruments Alistair Hay built to his drawings.
        Open any of them: the whole page is built, scroll included. Pick the one that
        feels right.
      </p>

      <section className="chooser-artist">
        <img
          className="chooser-artist-photo"
          src={photos.press.src}
          width={photos.press.width}
          height={photos.press.height}
          alt={photos.press.alt}
        />
        {/* The masthead above already carries his name and roles, so this card
            only has to add what it can: the training, and the record. */}
        <div>
          <p className="chooser-artist-name">Trained from three, on stage since 2006</p>
          <p className="chooser-artist-roles">
            Piano at 3 · Violin at 8 · Grade 8 at 11 · Trinity College London, twice
            cited for outstanding performance
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

      <p className="chooser-kicker chooser-kicker--grid">
        Three designs · one product · {promise.headline.toLowerCase()}
      </p>

      <ul className="chooser-grid">
        {concepts.map((concept) => (
          <li key={concept.id}>
            <Link className="chooser-panel" to={concept.path} style={panelStyle(concept)}>
              <span className="chooser-panel-top">
                <span>Design {concept.ordinal}</span>
                <span>{concept.theme}</span>
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
              <span className="chooser-panel-object">{concept.object}</span>
              <span className="chooser-panel-cta">Open design {concept.ordinal} &rarr;</span>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="chooser-foot">
        <p>
          {commission.from} · {commission.slots} · {commission.turnaround}
        </p>
      </footer>
    </div>
  );
}
