import { useRef } from "react";
import { Band } from "../../components/Band";
import { ClientWall } from "../../components/ClientWall";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Films } from "../../components/Films";
import { Listen } from "../../components/Listen";
import { Marquee } from "../../components/Marquee";
import { Reel } from "../../components/Reel";
import { Score } from "../../components/Score";
import { ScoreRail } from "../../components/ScoreRail";
import { Showreel } from "../../components/Showreel";
import { StringRow } from "../../components/StringRow";
import { Tally } from "../../components/Tally";
import { Words } from "../../components/Words";
import {
  commission,
  promise,
  rights,
  service,
  steps,
  tiers,
} from "../../content/commission";
import {
  artist,
  awards,
  calling,
  commissionStory,
  credentials,
  halls,
  milestones,
  record,
  teachers,
  territories,
  training,
  violins,
} from "../../content/dennis";
import { photos } from "../../content/media";
import { socials, words } from "../../content/work";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { useParallax } from "../../lib/useParallax";
import { useScrollReveal } from "../../lib/useScrollReveal";
import { conceptById } from "../registry";
import { createChosenScene } from "./chosenScene";
import "./chosen.css";

const concept = conceptById("chosen");

/**
 * Couture numbers its looks, so this concept numbers its plates. The four cuts
 * are the same argument the other two make — the man, the instrument, the
 * record, and only then the commission — in the register of a lookbook.
 */
const cuts = [
  {
    plate: "Plate I",
    label: "The man",
    line: artist.name,
    sub: artist.showman,
  },
  {
    plate: "Plate II",
    label: "The instrument",
    line: "Drawn by him. Built for him. Nobody else has one.",
    sub: "A six-string violin in carbon fibre and 24K gold, made in Donegal over a year.",
  },
  {
    plate: "Plate III",
    label: "The record",
    line: "Ten thousand nights. A hundred and sixty-eight thousand people.",
    sub: "Five continents, three albums, two sold-out halls of three thousand seats.",
  },
  {
    plate: "Plate IV",
    label: "The commission",
    line: "One song. One person. Chosen.",
    sub: "Couture is selection. So is this.",
  },
];

/** A garment-label tag: the section's number and what it holds. */
function Tag({ number, label }: { number: string; label: string }) {
  return (
    <p className="chosen-tag" data-reveal>
      <span className="chosen-tag-number">{number}</span>
      <span className="chosen-tag-rule" aria-hidden />
      <span className="chosen-tag-label">{label}</span>
    </p>
  );
}

export function ChosenPage() {
  useFonts(concept.fonts);
  const main = useRef<HTMLElement>(null);
  useScrollReveal(main);
  useParallax(main);

  return (
    <div className="chosen">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ConceptChrome concept={concept} />
      <ScoreRail />

      <ScrollStage vh={420} cuts={cuts.length} className="chosen-stage">
        {({ stage, progress }) => (
          <>
            <SceneCanvas
              factory={createChosenScene}
              progress={progress}
              label="Cream silk with a broad sheen travelling across the weave, gathering as you scroll into a single pearl with an iridescent rim."
            />

            <div className="chosen-hero">
              <div className="chosen-cuts">
                {cuts.map((cut, index) => (
                  <div key={cut.plate} className="chosen-cut" data-active={stage === index}>
                    <p className="chosen-plate-mark">
                      <span>{cut.plate}</span>
                      <span className="chosen-plate-rule" aria-hidden />
                      <span>{cut.label}</span>
                    </p>
                    {index === 0 ? (
                      <h1>
                        {cut.line}
                        <span className="chosen-hero-cn" lang="zh">
                          {artist.chineseName}
                        </span>
                      </h1>
                    ) : (
                      <p className="chosen-line">{cut.line}</p>
                    )}
                    <p className="chosen-sub">{cut.sub}</p>
                    {index === 0 ? (
                      <p className="chosen-hero-roles">{artist.roles}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* He is drawn inside the shader, where the sheen crossing the silk
                  also crosses him. This <img> is the no-WebGL fallback. */}
              <img
                className="chosen-hero-figure"
                src={photos.cutout.src}
                width={photos.cutout.width}
                height={photos.cutout.height}
                alt={photos.cutout.alt}
              />

              <div className="chosen-hero-listen">
                <Listen />
              </div>

              <div className="chosen-hero-foot">
                <span>{artist.city}</span>
                <span className="chosen-progress" aria-hidden />
                <span>Scroll</span>
              </div>
            </div>
          </>
        )}
      </ScrollStage>

      <main id="main" className="chosen-body" ref={main}>
        {/* ---------------- his own line, as the manifesto ---------------- */}
        <section className="chosen-section chosen-section--creed">
          <p className="chosen-creed" data-reveal>
            {artist.chosen}
          </p>
          <p className="chosen-creed-note" data-reveal>
            His words, not ours. This concept is named after them — and after the
            third instrument he had built, which carries the same name.
          </p>
        </section>

        {/* ---------------- who he is ---------------- */}
        <section className="chosen-section">
          <Tag number="I" label="The man" />

          <div className="chosen-spread">
            <div className="chosen-column">
              <h2 className="chosen-h2" data-reveal>
                {artist.name}
                <span className="chosen-h2-cn" lang="zh">
                  {artist.chineseName}
                </span>
              </h2>
              <p className="chosen-meta" data-reveal>
                {artist.roles}
              </p>
              <p className="chosen-meta" data-reveal>
                {artist.city} · born {artist.born}
              </p>
              <p className="chosen-lede" data-reveal>
                {artist.paragraph}
              </p>

              <dl className="chosen-spec">
                {credentials.map((item) => (
                  <div className="chosen-spec-row" key={item.label} data-reveal>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
                <div className="chosen-spec-row" data-reveal>
                  <dt>Taught piano by</dt>
                  <dd>{teachers.piano}</dd>
                </div>
                <div className="chosen-spec-row" data-reveal>
                  <dt>Taught violin by</dt>
                  <dd>{teachers.violin}</dd>
                </div>
              </dl>

              <StringRow caption="Four strings. Pluck one." />
            </div>

            <figure className="chosen-figure" data-reveal="wipe" data-parallax>
              <img
                src={photos.seated.src}
                width={photos.seated.width}
                height={photos.seated.height}
                alt={photos.seated.alt}
                loading="lazy"
              />
              <figcaption>
                <span className="chosen-caption-label">Plate I</span>
                <span>{photos.seated.credit}</span>
              </figcaption>
            </figure>
          </div>

          <ol className="chosen-list">
            {training.map((line) => (
              <li key={line} data-reveal>
                {line}
              </li>
            ))}
          </ol>

          <ul className="chosen-list chosen-list--plain">
            {halls.map((hall) => (
              <li key={hall} data-reveal>
                {hall}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- the record ---------------- */}
        <section className="chosen-section">
          <Tag number="II" label="The record" />

          <dl className="chosen-figures">
            {record.map((item) => (
              <div className="chosen-figures-item" key={item.label} data-reveal>
                <dd>
                  <Tally value={item.value} />
                </dd>
                <dt>{item.label}</dt>
              </div>
            ))}
          </dl>

          <ul className="chosen-timeline">
            {milestones.map((item) => (
              <li key={item.year} data-reveal>
                <span className="chosen-timeline-year">{item.year}</span>
                <span className="chosen-timeline-title">{item.title}</span>
                <span className="chosen-timeline-detail">{item.detail}</span>
              </li>
            ))}
          </ul>

          <dl className="chosen-spec chosen-spec--awards">
            {awards.map((award) => (
              <div className="chosen-spec-row" key={award.name} data-reveal>
                <dt>{award.name}</dt>
                <dd>{award.detail}</dd>
              </div>
            ))}
          </dl>

          <p className="chosen-territories" data-reveal>
            {territories.join(" · ")}
          </p>
        </section>

        {/* ---------------- the instruments ---------------- */}
        <section className="chosen-section">
          <Tag number="III" label="Three instruments" />

          <Words as="h2" className="chosen-h2" text={commissionStory.lede} />
          <p className="chosen-lede" data-reveal>
            {commissionStory.body}
          </p>

          <figure className="chosen-plate-figure" data-reveal="wipe">
            <img
              src={photos.violin.src}
              width={photos.violin.width}
              height={photos.violin.height}
              alt={photos.violin.alt}
              loading="lazy"
            />
            <figcaption>
              <span className="chosen-caption-label">Plate II</span>
              <span>{photos.violin.credit}</span>
            </figcaption>
          </figure>

          <ul className="chosen-instruments">
            {violins.map((violin) => (
              <li key={violin.id} data-reveal>
                <span className="chosen-instrument-name">{violin.name}</span>
                <span className="chosen-instrument-year">{violin.year}</span>
                <span className="chosen-instrument-material">{violin.material}</span>
                <span className="chosen-instrument-note">{violin.note}</span>
              </li>
            ))}
          </ul>

          <blockquote className="chosen-quote" data-reveal>
            <p>{commissionStory.quote}</p>
            <cite>{commissionStory.quoteWho}</cite>
          </blockquote>

          <blockquote className="chosen-quote chosen-quote--maker" data-reveal>
            <p>{commissionStory.makerQuote}</p>
            <cite>{commissionStory.makerWho}</cite>
          </blockquote>
        </section>

        <Band photo={photos.liveBlue} line="Plate IV — under the beam, mid-phrase." />

        {/* ---------------- hear him ---------------- */}
        <section className="chosen-section chosen-section--reel">
          <Tag number="IV" label="Hear him" />

          <Words as="h2" className="chosen-h2" text={"A minute in a room with him"} />
          <Showreel caption="His own reel, in his own cut." />

          <Words as="h3" className="chosen-sub-head" text={"And what he played, written down"} />
          <Score />

          <Words as="h2" className="chosen-h2" text={"And this is what he writes when someone asks"} style={{ marginTop: "var(--space-5xl)" }} />
          <Reel caption="Press a title to hear it" index={(position) => `No. ${position + 1}`} />
        </section>

        {/* ---------------- in the room ---------------- */}
        <section className="chosen-section">
          <Tag number="V" label="In the room" />
          <Films caption="Three nights the music was written for" />
        </section>

        {/* ---------------- who books him ---------------- */}
        <section className="chosen-section">
          <Tag number="VI" label="Titans of industry" />
          <ClientWall />
          <Marquee />

          <ul className="chosen-words">
            {words.map((word) => (
              <li key={word.text} data-reveal>
                <blockquote>{word.text}</blockquote>
                <p className="chosen-word-who">
                  {word.who} · {word.when}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <Band photo={photos.crowd} line="Three thousand seats, and one song at a time." tall />

        {/* ---------------- the calling: the reason for the name ---------------- */}
        <section className="chosen-section chosen-section--calling">
          <Tag number="VII" label="Why he keeps going" />

          <Words as="h2" className="chosen-h2 chosen-h2--large" text={calling.lede} />
          <p className="chosen-lede" data-reveal>
            {calling.body}
          </p>

          <figure className="chosen-plate-figure chosen-plate-figure--mono" data-reveal="wipe">
            <img
              src={photos.silhouette.src}
              width={photos.silhouette.width}
              height={photos.silhouette.height}
              alt={photos.silhouette.alt}
              loading="lazy"
            />
            <figcaption>
              <span className="chosen-caption-label">Plate III</span>
              <span>{photos.silhouette.credit}</span>
            </figcaption>
          </figure>
        </section>

        {/* ---------------- and only now, the commission ---------------- */}
        <section className="chosen-section">
          <Tag number="VIII" label="Commission" />

          <Words as="h2" className="chosen-h2" text={promise.headline} />
          <p className="chosen-lede" data-reveal>
            {service.lede}
          </p>

          <ol className="chosen-steps">
            {steps.map((step) => (
              <li key={step.index} data-reveal>
                <span className="chosen-step-index">{step.index}</span>
                <span className="chosen-step-title">{step.title}</span>
                <span className="chosen-step-marking">{step.marking}</span>
                <p className="chosen-step-body">{step.body}</p>
              </li>
            ))}
          </ol>

          <dl className="chosen-spec chosen-spec--rights">
            {rights.map((right) => (
              <div className="chosen-spec-row" key={right.term} data-reveal>
                <dt>{right.term}</dt>
                <dd>{right.detail}</dd>
              </div>
            ))}
          </dl>

          <ul className="chosen-tiers">
            {tiers.map((tier) => (
              <li key={tier.id} data-reveal>
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

          <dl className="chosen-spec">
            <div className="chosen-spec-row" data-reveal>
              <dt>Delivery</dt>
              <dd>{commission.turnaround}</dd>
            </div>
            <div className="chosen-spec-row" data-reveal>
              <dt>Revisions</dt>
              <dd>{commission.revisions}</dd>
            </div>
            <div className="chosen-spec-row" data-reveal>
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
