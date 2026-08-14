import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { commission, promise } from "../content/commission";
import { artist, tallies } from "../content/dennis";
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
          <p className="chooser-kicker">Three designs · one product</p>
          <h1 className="chooser-wordmark">Blesspoke</h1>
        </div>
        <ul className="chooser-promise">
          <li>
            <span>01</span>
            {promise.headline}
          </li>
          <li>
            <span>02</span>
            {promise.request}
          </li>
          <li>
            <span>03</span>
            {promise.ownership}
          </li>
        </ul>
      </header>

      <p className="chooser-note">
        One artist — {artist.name} — and no roster behind him. Below are three complete
        design directions for the same commission, each named after one of the three
        instruments Alistair Hay built to his drawings. Open any of them: the whole page
        is built, scroll included. Pick the one that feels right and that becomes
        Blesspoke.
      </p>

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
            {artist.name} <span lang="zh">{artist.chineseName}</span>
          </p>
          <p className="chooser-artist-roles">
            {artist.roles} · {artist.city}
          </p>
          <p className="chooser-artist-line">{artist.oneLine}</p>
        </div>
        <dl className="chooser-tallies">
          {tallies.slice(0, 3).map((item) => (
            <div className="chooser-tally" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

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
                <span className="chooser-panel-tag"> — {concept.tagline}</span>
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
