import { useRef } from "react";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Films } from "../../components/Films";
import { Reel } from "../../components/Reel";
import { Stave } from "../../components/Stave";
import { StringRow } from "../../components/StringRow";
import { Tally } from "../../components/Tally";
import {
  commission,
  promise,
  proof,
  rights,
  service,
  steps,
  tiers,
} from "../../content/commission";
import {
  artist,
  credentials,
  milestones,
  tallies,
  training,
  violins,
} from "../../content/dennis";
import { photos } from "../../content/media";
import { socials, words } from "../../content/work";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { useScrollReveal } from "../../lib/useScrollReveal";
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
    <div className="chosen-head" data-reveal>
      <span className="chosen-head-ref">{reference}</span>
      <span>{title}</span>
    </div>
  );
}

/** Catalogue rows are numbered against their section, like a real parts list. */
function catalogueRef(position: number): string {
  return `04.${String(position + 1).padStart(2, "0")}`;
}

export function ChosenPage() {
  useFonts(concept.fonts);
  const main = useRef<HTMLElement>(null);
  useScrollReveal(main);

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

      <main id="main" className="chosen-body" ref={main}>
        <section className="chosen-section">
          <Head reference="§01" title="Subject" />
          <h2 className="chosen-h2" data-reveal>
            {artist.name}
          </h2>
          <p className="chosen-lede" data-reveal>
            {artist.paragraph}
          </p>
          <p className="chosen-service" data-reveal>
            {service.lede}
          </p>

          <div className="chosen-cols">
            <div>
              <dl className="chosen-spec">
                {credentials.map((item) => (
                  <div className="chosen-spec-row" key={item.label} data-reveal>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
                {training.map((line, index) => (
                  <div className="chosen-spec-row" key={line} data-reveal>
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

            <figure className="chosen-photo chosen-photo--tall" data-reveal="wipe">
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
              <div className="chosen-spec-row" key={item.year} data-reveal>
                <dt>{item.year}</dt>
                <dd>
                  {item.title} — {item.detail}
                </dd>
              </div>
            ))}
          </dl>
          <dl className="chosen-figures">
            {tallies.map((item) => (
              <div className="chosen-figure" key={item.label} data-reveal>
                <dt>{item.label}</dt>
                <dd>
                  <Tally value={item.value} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="chosen-section">
          <Head reference="§03" title="Instruments" />
          <h2 className="chosen-h2" data-reveal>
            Three built to his drawings
          </h2>
          <p className="chosen-lede" data-reveal>
            Alistair Hay of Emerald Guitars cut all three from Dennis's own sketches.
            This design is named for the last of them — the carbon teardrop, light
            enough to travel in a whisky case.
          </p>

          <div className="chosen-cols">
            <dl className="chosen-spec">
              {violins.map((instrument) => (
                <div className="chosen-spec-row" key={instrument.id} data-reveal>
                  <dt>
                    {instrument.name} · {instrument.year}
                  </dt>
                  <dd>
                    {instrument.material}. {instrument.note}
                  </dd>
                </div>
              ))}
            </dl>

            <figure className="chosen-photo chosen-photo--wide" data-reveal="wipe">
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

        <section className="chosen-section chosen-section--reel">
          <Head reference="§04" title="Catalogue" />
          <h2 className="chosen-h2" data-reveal>
            Ten commissions, on file
          </h2>
          <p className="chosen-lede" data-reveal>
            A game trailer, a car launch, a boy's third birthday, a Mandopop
            single. Ten briefs with nothing in common but the person who answered
            them.
          </p>
          <Reel caption="Select a row to audition it" index={catalogueRef} />
        </section>

        <section className="chosen-section">
          <Head reference="§05" title="Process" />
          <h2 className="chosen-h2" data-reveal>
            {promise.request}
          </h2>
          <Stave tempo="Adagio · quarter note = 58" />
          <ol className="chosen-steps">
            {steps.map((step, index) => (
              <li className="chosen-step" key={step.index} data-reveal>
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

          <dl className="chosen-figures">
            {proof.map((item) => (
              <div className="chosen-figure" key={item.label} data-reveal>
                <dt>{item.label}</dt>
                <dd>
                  <Tally value={item.value} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="chosen-section">
          <Head reference="§06" title="Documentation" />
          <Films caption="Three deliveries, filmed in the room" />
        </section>

        <section className="chosen-section">
          <Head reference="§07" title="Transfer" />
          <h2 className="chosen-h2" data-reveal>
            {promise.ownership}
          </h2>
          <p className="chosen-lede" data-reveal>
            {service.against}
          </p>
          <dl className="chosen-spec" style={{ marginTop: "var(--space-xl)" }}>
            {rights.map((right) => (
              <div className="chosen-spec-row" key={right.term} data-reveal>
                <dt>{right.term}</dt>
                <dd>{right.detail}</dd>
              </div>
            ))}
          </dl>

          <ul className="chosen-words">
            {words.map((word) => (
              <li key={word.text} data-reveal>
                <blockquote className="chosen-word">{word.text}</blockquote>
                <p className="chosen-word-who">
                  {word.who} · {word.what} · {word.when}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="chosen-section">
          <Head reference="§08" title="Order" />
          <h2 className="chosen-h2" data-reveal>
            {promise.headline}
          </h2>

          <ul className="chosen-tiers">
            {tiers.map((tier) => (
              <li className="chosen-tier" key={tier.id} data-reveal>
                <p className="chosen-tier-price">
                  <Tally value={tier.price} />
                </p>
                <h3 className="chosen-tier-name">{tier.name}</h3>
                <p className="chosen-tier-length">{tier.length}</p>
                <p className="chosen-tier-summary">{tier.summary}</p>
                <ul className="chosen-tier-list">
                  {tier.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <dl className="chosen-figures">
            <div className="chosen-figure" data-reveal>
              <dt>Delivery</dt>
              <dd>{commission.turnaround}</dd>
            </div>
            <div className="chosen-figure" data-reveal>
              <dt>Revisions</dt>
              <dd>{commission.revisions}</dd>
            </div>
            <div className="chosen-figure" data-reveal>
              <dt>Availability</dt>
              <dd>{commission.slots}</dd>
            </div>
          </dl>

          <a className="chosen-cta" href="#main">
            Write the prompt
          </a>
          <p className="chosen-note">{commission.note}</p>

          <ul className="chosen-socials">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} rel="noreferrer noopener" target="_blank">
                  <span className="chosen-social-label">{social.label}</span>
                  <span className="chosen-social-handle">{social.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <ConceptSwitch concept={concept} />
      </main>
    </div>
  );
}
