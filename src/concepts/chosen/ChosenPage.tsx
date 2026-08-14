import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Stave } from "../../components/Stave";
import { StringRow } from "../../components/StringRow";
import { commission, promise, rights, steps } from "../../content/commission";
import {
  artist,
  credentials,
  milestones,
  tallies,
  training,
  violins,
} from "../../content/dennis";
import { photos } from "../../content/media";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { conceptById } from "../registry";
import { createChosenScene } from "./chosenScene";
import "./chosen.css";

const concept = conceptById("chosen");

const cuts = [
  {
    ref: "Ref. 00 — Subject",
    line: promise.headline,
    sub: "A song that exists because you asked for it, and for no other reason.",
  },
  {
    ref: "Ref. 01 — Input",
    line: promise.request,
    sub: "One paragraph in. One song out. The brief is the prompt, and the prompt is the whole of it.",
  },
  {
    ref: "Ref. 02 — Transfer",
    line: promise.ownership,
    sub: "Master and composition transfer to your name on signature. Retained rights: none.",
  },
  {
    ref: "Ref. 03 — Operator",
    line: artist.name,
    sub: artist.oneLine,
  },
];

function Head({ reference, title }: { reference: string; title: string }) {
  return (
    <div className="chosen-head">
      <span className="chosen-head-ref">{reference}</span>
      <span>{title}</span>
    </div>
  );
}

export function ChosenPage() {
  useFonts(concept.fonts);

  return (
    <div className="chosen">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ConceptChrome concept={concept} />

      <ScrollStage vh={420} cuts={cuts.length} className="chosen-stage">
        {({ stage, progress }) => (
          <>
            <SceneCanvas
              factory={createChosenScene}
              progress={progress}
              label="A flat measured drawing that lifts off the sheet and assembles into the teardrop body of a carbon-fibre violin, scanned by a moving line of light."
            />
            <div className="chosen-grid" />

            <div className="chosen-hero">
              <div className="chosen-hero-top">
                <span>Blesspoke</span>
                <span>Kuala Lumpur · {concept.instrument.year}</span>
              </div>

              <div className="chosen-cuts">
                {cuts.map((cut, index) => (
                  <div key={cut.ref} className="chosen-cut" data-active={stage === index}>
                    <span className="chosen-index">{cut.ref}</span>
                    {index === 0 ? (
                      <h1>{cut.line}</h1>
                    ) : (
                      <p className="chosen-line">{cut.line}</p>
                    )}
                    <p className="chosen-sub">{cut.sub}</p>
                  </div>
                ))}
              </div>

              <div className="chosen-hero-foot">
                <span>Assembly {(stage + 1) * 25}%</span>
                <span className="chosen-readout" aria-hidden />
                <span>Scroll</span>
              </div>
            </div>
          </>
        )}
      </ScrollStage>

      <main id="main" className="chosen-body">
        <section className="chosen-section">
          <Head reference="§01" title="Subject" />
          <h2 className="chosen-h2">{artist.name}</h2>
          <p className="chosen-lede">{artist.paragraph}</p>

          <div className="chosen-cols">
            <div>
              <dl className="chosen-spec">
                {credentials.map((item) => (
                  <div className="chosen-spec-row" key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
                {training.map((line, index) => (
                  <div className="chosen-spec-row" key={line}>
                    <dt>Qualification {index + 1}</dt>
                    <dd>{line}</dd>
                  </div>
                ))}
              </dl>
              <StringRow
                caption="Open strings — pluck to hear the instrument"
                readout="frequency"
              />
            </div>

            <figure className="chosen-photo chosen-photo--tall">
              <img
                src={photos.seated.src}
                width={photos.seated.width}
                height={photos.seated.height}
                alt={photos.seated.alt}
                loading="lazy"
              />
              <figcaption className="chosen-caption">
                <span>{artist.chineseName}</span>
                <span>{photos.seated.credit}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="chosen-section">
          <Head reference="§02" title="Record" />
          <dl className="chosen-spec" style={{ marginTop: "var(--space-xl)" }}>
            {milestones.map((item) => (
              <div className="chosen-spec-row" key={item.year}>
                <dt>{item.year}</dt>
                <dd>
                  {item.title} — {item.detail}
                </dd>
              </div>
            ))}
          </dl>
          <dl className="chosen-figures">
            {tallies.map((item) => (
              <div className="chosen-figure" key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="chosen-section">
          <Head reference="§03" title="Instruments" />
          <h2 className="chosen-h2">Three built to his drawings</h2>
          <p className="chosen-lede">
            Alistair Hay of Emerald Guitars cut all three from Dennis's own sketches.
            This design is named for the last of them — the carbon teardrop, light
            enough to travel in a whisky case.
          </p>

          <div className="chosen-cols">
            <dl className="chosen-spec">
              {violins.map((instrument) => (
                <div className="chosen-spec-row" key={instrument.id}>
                  <dt>
                    {instrument.name} · {instrument.year}
                  </dt>
                  <dd>
                    {instrument.material}. {instrument.note}
                  </dd>
                </div>
              ))}
            </dl>

            <figure className="chosen-photo chosen-photo--wide">
              <img
                src={photos.violin.src}
                width={photos.violin.width}
                height={photos.violin.height}
                alt={photos.violin.alt}
                loading="lazy"
              />
              <figcaption className="chosen-caption">
                <span>The Phoenix · 2016</span>
                <span>{photos.violin.credit}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="chosen-section">
          <Head reference="§04" title="Process" />
          <h2 className="chosen-h2">{promise.request}</h2>
          <Stave tempo="Adagio · quarter note = 58" />
          <ol className="chosen-steps">
            {steps.map((step, index) => (
              <li className="chosen-step" key={step.index}>
                <span className="chosen-step-ref">Stage {String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="chosen-step-title">
                    {step.title}
                    <span className="chosen-step-marking">{step.marking}</span>
                  </h3>
                  <p className="chosen-step-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="chosen-section">
          <Head reference="§05" title="Transfer" />
          <h2 className="chosen-h2">{promise.ownership}</h2>
          <dl className="chosen-spec" style={{ marginTop: "var(--space-xl)" }}>
            {rights.map((right) => (
              <div className="chosen-spec-row" key={right.term}>
                <dt>{right.term}</dt>
                <dd>{right.detail}</dd>
              </div>
            ))}
          </dl>

          <dl className="chosen-figures">
            <div className="chosen-figure">
              <dt>From</dt>
              <dd>{commission.from}</dd>
            </div>
            <div className="chosen-figure">
              <dt>Availability</dt>
              <dd>{commission.slots}</dd>
            </div>
            <div className="chosen-figure">
              <dt>Delivery</dt>
              <dd>{commission.turnaround}</dd>
            </div>
          </dl>

          <a className="chosen-cta" href="#main">
            Write the prompt
          </a>
          <p className="chosen-note">{commission.note}</p>
        </section>

        <ConceptSwitch concept={concept} />
      </main>
    </div>
  );
}
