import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Stave } from "../../components/Stave";
import { StringRow } from "../../components/StringRow";
import { commission, promise, rights, steps } from "../../content/commission";
import { artist, credentials, milestones, tallies, training } from "../../content/dennis";
import { photos } from "../../content/media";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { conceptById } from "../registry";
import { createPhoenixScene } from "./phoenixScene";
import "./phoenix.css";

const concept = conceptById("phoenix");

const cuts = [
  {
    mark: "Blesspoke",
    line: promise.headline,
    sub: "A song that exists because you asked for it, and for no other reason.",
  },
  {
    mark: "The ask",
    line: promise.request,
    sub: "One paragraph from you. No brief templates, no rounds of stakeholder notes.",
  },
  {
    mark: "The deed",
    line: promise.ownership,
    sub: "Master and composition transfer to your name. The artist keeps nothing.",
  },
  {
    mark: "One artist, no roster",
    line: artist.name,
    sub: artist.oneLine,
  },
];

export function PhoenixPage() {
  useFonts(concept.fonts);

  return (
    <div className="phoenix">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ConceptChrome concept={concept} />

      <ScrollStage vh={420} cuts={cuts.length} className="phoenix-stage">
        {({ stage, progress }) => (
          <>
            <SceneCanvas
              factory={createPhoenixScene}
              progress={progress}
              label="A gilded plume, shaped like the wing of the Phoenix violin, that scatters into gold dust and draws back together as a single vibrating string."
            />
            <div className="phoenix-frame" />

            <div className="phoenix-hero">
              <div className="phoenix-cuts">
                {cuts.map((cut, index) => (
                  <div
                    key={cut.mark}
                    className="phoenix-cut"
                    data-active={stage === index}
                  >
                    <span className="phoenix-mark">{cut.mark}</span>
                    {index === 0 ? (
                      <h1>{cut.line}</h1>
                    ) : (
                      <p className="phoenix-line">{cut.line}</p>
                    )}
                    <p className="phoenix-sub">{cut.sub}</p>
                  </div>
                ))}
              </div>

              <div className="phoenix-hero-foot">
                <span>Kuala Lumpur</span>
                <span className="phoenix-progress" aria-hidden />
                <span>Scroll</span>
              </div>
            </div>
          </>
        )}
      </ScrollStage>

      <main id="main" className="phoenix-body">
        <section className="phoenix-plate">
          <img
            src={photos.violin.src}
            width={photos.violin.width}
            height={photos.violin.height}
            alt={photos.violin.alt}
          />
          <div className="phoenix-plate-caption">
            <p className="phoenix-plate-name">{concept.instrument.name}</p>
            <p className="phoenix-plate-meta">
              {concept.instrument.year} · {concept.instrument.material}
            </p>
            <p className="phoenix-credit">{photos.violin.credit}</p>
          </div>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow">Movement I — The only artist</p>
          <div className="phoenix-portrait">
            <figure style={{ margin: 0 }}>
              <div className="phoenix-photo">
                <img
                  src={photos.live.src}
                  width={photos.live.width}
                  height={photos.live.height}
                  alt={photos.live.alt}
                  loading="lazy"
                />
              </div>
              <figcaption className="phoenix-credit">{photos.live.credit}</figcaption>
            </figure>

            <div>
              <p className="phoenix-artist-name">
                {artist.name}
                <span className="phoenix-artist-cn">{artist.chineseName}</span>
              </p>
              <p className="phoenix-roles">
                {artist.roles} · {artist.city}
              </p>
              <p className="phoenix-lede" style={{ marginTop: "var(--space-lg)" }}>
                {artist.paragraph}
              </p>
              <dl className="phoenix-figures">
                {credentials.map((item) => (
                  <div className="phoenix-figure" key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <StringRow caption="The four strings everything is written on — pluck one" />
            </div>
          </div>

          <ol className="phoenix-training">
            {training.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow">Movement II — The record</p>
          <div className="phoenix-portrait">
            <div>
              <ul className="phoenix-record" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
                {milestones.map((item) => (
                  <li className="phoenix-record-item" key={item.year}>
                    <span className="phoenix-record-year">{item.year}</span>
                    <div>
                      <h3 className="phoenix-record-title">{item.title}</h3>
                      <p className="phoenix-record-detail">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="phoenix-terms">
                {tallies.map((item) => (
                  <div className="phoenix-term" key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure style={{ margin: 0 }}>
              <div className="phoenix-photo">
                <img
                  src={photos.seated.src}
                  width={photos.seated.width}
                  height={photos.seated.height}
                  alt={photos.seated.alt}
                  loading="lazy"
                />
              </div>
              <figcaption className="phoenix-credit">{photos.seated.credit}</figcaption>
            </figure>
          </div>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow">Movement III — How a commission runs</p>
          <Stave tempo="Adagio · quarter note = 58" />
          <ol className="phoenix-steps" style={{ marginTop: "var(--space-4xl)" }}>
            {steps.map((step) => (
              <li className="phoenix-step" key={step.index}>
                <span className="phoenix-step-index">{step.index}</span>
                <div>
                  <h3 className="phoenix-step-title">
                    {step.title}
                    <span className="phoenix-step-marking">{step.marking}</span>
                  </h3>
                  <p className="phoenix-step-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow">Movement IV — What you actually own</p>
          <h2 className="phoenix-h2">{promise.ownership}</h2>
          <div className="phoenix-deed">
            <div className="phoenix-deed-head">
              <p className="phoenix-deed-title">Deed of transfer</p>
              <p className="phoenix-deed-seal">Signed on delivery</p>
            </div>
            <dl className="phoenix-rights">
              {rights.map((right) => (
                <div className="phoenix-right" key={right.term}>
                  <dt>{right.term}</dt>
                  <dd>{right.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow">Coda — Commission</p>
          <h2 className="phoenix-h2">{promise.headline}</h2>
          <dl className="phoenix-terms">
            <div className="phoenix-term">
              <dt>From</dt>
              <dd>{commission.from}</dd>
            </div>
            <div className="phoenix-term">
              <dt>Availability</dt>
              <dd>{commission.slots}</dd>
            </div>
            <div className="phoenix-term">
              <dt>Delivery</dt>
              <dd>{commission.turnaround}</dd>
            </div>
          </dl>
          <a className="phoenix-cta" href="#main">
            Write the prompt
          </a>
          <p className="phoenix-note">{commission.note}</p>
        </section>

        <ConceptSwitch concept={concept} />
      </main>
    </div>
  );
}
