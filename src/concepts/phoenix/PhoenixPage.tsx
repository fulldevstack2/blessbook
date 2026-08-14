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
import { artist, credentials, milestones, tallies, training } from "../../content/dennis";
import { photos } from "../../content/media";
import { socials, words } from "../../content/work";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { useParallax } from "../../lib/useParallax";
import { useScrollReveal } from "../../lib/useScrollReveal";
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
  const main = useRef<HTMLElement>(null);
  useScrollReveal(main);
  useParallax(main);

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
                  <div key={cut.mark} className="phoenix-cut" data-active={stage === index}>
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

      <main id="main" className="phoenix-body" ref={main}>
        <section className="phoenix-plate">
          <img
            src={photos.violin.src}
            width={photos.violin.width}
            height={photos.violin.height}
            alt={photos.violin.alt}
            data-reveal="wipe"
          />
          <div className="phoenix-plate-caption">
            <p className="phoenix-plate-name" data-reveal>
              {concept.instrument.name}
            </p>
            <p className="phoenix-plate-meta" data-reveal>
              {concept.instrument.year} · {concept.instrument.material}
            </p>
            <p className="phoenix-credit" data-reveal>
              {photos.violin.credit}
            </p>
          </div>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement I — The only artist
          </p>
          <div className="phoenix-portrait">
            <figure style={{ margin: 0 }}>
              <div className="phoenix-photo" data-reveal="wipe" data-parallax>
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
              <p className="phoenix-artist-name" data-reveal>
                {artist.name}
                <span className="phoenix-artist-cn">{artist.chineseName}</span>
              </p>
              <p className="phoenix-roles" data-reveal>
                {artist.roles} · {artist.city}
              </p>
              <p className="phoenix-lede" data-reveal style={{ marginTop: "var(--space-lg)" }}>
                {artist.paragraph}
              </p>
              <p className="phoenix-service" data-reveal>
                {service.lede}
              </p>
              <dl className="phoenix-figures">
                {credentials.map((item) => (
                  <div className="phoenix-figure" key={item.label} data-reveal>
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
              <li key={line} data-reveal>
                {line}
              </li>
            ))}
          </ol>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement II — The record
          </p>
          <div className="phoenix-portrait">
            <div>
              <ul className="phoenix-record" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
                {milestones.map((item) => (
                  <li className="phoenix-record-item" key={item.year} data-reveal>
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
                  <div className="phoenix-term" key={item.label} data-reveal>
                    <dt>{item.label}</dt>
                    <dd>
                      <Tally value={item.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure style={{ margin: 0 }}>
              <div className="phoenix-photo" data-reveal="wipe" data-parallax>
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

        <section className="phoenix-section phoenix-section--reel">
          <p className="phoenix-eyebrow" data-reveal>
            Movement III — Ten commissions, played
          </p>
          <h2 className="phoenix-h2" data-reveal>
            Written for someone, once
          </h2>
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "48ch" }}>
            A game trailer, a car launch, a boy's third birthday, a Mandopop
            single. The same hand behind every one of them.
          </p>
          <Reel caption="Press a title to hear it" />
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement IV — How a commission runs
          </p>
          <Stave tempo="Adagio · quarter note = 58" />
          <ol className="phoenix-steps" style={{ marginTop: "var(--space-4xl)" }}>
            {steps.map((step) => (
              <li className="phoenix-step" key={step.index} data-reveal>
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

          <dl className="phoenix-terms phoenix-proof">
            {proof.map((item) => (
              <div className="phoenix-term" key={item.label} data-reveal>
                <dt>{item.label}</dt>
                <dd>
                  <Tally value={item.value} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement V — In the room
          </p>
          <Films caption="Three nights the music was written for" />
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement VI — What you actually own
          </p>
          <h2 className="phoenix-h2" data-reveal>
            {promise.ownership}
          </h2>
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "52ch" }}>
            {service.against}
          </p>
          <div className="phoenix-deed" data-reveal>
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

          <ul className="phoenix-words">
            {words.map((word) => (
              <li key={word.text} data-reveal>
                <blockquote className="phoenix-word">{word.text}</blockquote>
                <p className="phoenix-word-who">
                  {word.who} · {word.what} · {word.when}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Coda — Commission
          </p>
          <h2 className="phoenix-h2" data-reveal>
            {promise.headline}
          </h2>

          <ul className="phoenix-tiers">
            {tiers.map((tier) => (
              <li className="phoenix-tier" key={tier.id} data-reveal>
                <p className="phoenix-tier-price">
                  <Tally value={tier.price} />
                </p>
                <h3 className="phoenix-tier-name">{tier.name}</h3>
                <p className="phoenix-tier-length">{tier.length}</p>
                <p className="phoenix-tier-summary">{tier.summary}</p>
                <ul className="phoenix-tier-list">
                  {tier.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <dl className="phoenix-terms">
            <div className="phoenix-term" data-reveal>
              <dt>Delivery</dt>
              <dd>{commission.turnaround}</dd>
            </div>
            <div className="phoenix-term" data-reveal>
              <dt>Revisions</dt>
              <dd>{commission.revisions}</dd>
            </div>
            <div className="phoenix-term" data-reveal>
              <dt>Availability</dt>
              <dd>{commission.slots}</dd>
            </div>
          </dl>

          <a className="phoenix-cta" href="#main">
            Write the prompt
          </a>
          <p className="phoenix-note">{commission.note}</p>

          <ul className="phoenix-socials">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} rel="noreferrer noopener" target="_blank">
                  <span className="phoenix-social-label">{social.label}</span>
                  <span className="phoenix-social-handle">{social.handle}</span>
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
