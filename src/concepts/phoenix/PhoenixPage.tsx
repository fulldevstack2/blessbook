import { useRef } from "react";
import { ClientWall } from "../../components/ClientWall";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Films } from "../../components/Films";
import { Listen } from "../../components/Listen";
import { Reel } from "../../components/Reel";
import { Showreel } from "../../components/Showreel";
import { Stave } from "../../components/Stave";
import { StringRow } from "../../components/StringRow";
import { Tally } from "../../components/Tally";
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
} from "../../content/dennis";
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

/**
 * The hero's four cuts. They are about Dennis, in his own order of importance:
 * who he is, the instrument nobody else has, the record behind it, and only then
 * the quietest thing he does — which is the commission this site sells.
 */
const cuts = [
  {
    mark: "Kuala Lumpur",
    line: artist.name,
    sub: artist.showman,
  },
  {
    mark: "The instrument",
    line: "The first performer anywhere to play a six-string 24K gold violin",
    sub: "Carved as a bird's wing in Donegal, and waited a year for.",
  },
  {
    mark: "The record",
    line: "Ten thousand performances. A hundred and sixty-eight thousand people.",
    sub: "Five continents, three albums, two sold-out nights of three thousand seats each.",
  },
  {
    mark: "And then this",
    line: "One song, written for one person",
    sub: "The quietest thing he does. No audience but you.",
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
            {/* The photograph is the hero. The scene is the gold on top of it,
                and once the music plays it is his bow that moves the gold. */}
            <img
              className="phoenix-hero-plate"
              src={photos.goldViolin.src}
              width={photos.goldViolin.width}
              height={photos.goldViolin.height}
              alt={photos.goldViolin.alt}
            />
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
                      <h1>
                        {cut.line}
                        <span className="phoenix-hero-cn" lang="zh">
                          {artist.chineseName}
                        </span>
                      </h1>
                    ) : (
                      <p className="phoenix-line">{cut.line}</p>
                    )}
                    <p className="phoenix-sub">{cut.sub}</p>
                    {index === 0 ? (
                      <p className="phoenix-hero-roles">{artist.roles}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="phoenix-hero-listen">
                <Listen />
              </div>

              <div className="phoenix-hero-foot">
                <span>Photograph · 2016</span>
                <span className="phoenix-progress" aria-hidden />
                <span>Scroll</span>
              </div>
            </div>
          </>
        )}
      </ScrollStage>

      <main id="main" className="phoenix-body" ref={main}>
        {/* ---------------- the instrument, and how it came to exist ---------------- */}
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
            {commissionStory.eyebrow}
          </p>
          <h2 className="phoenix-h2" data-reveal>
            {commissionStory.lede}
          </h2>
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "54ch" }}>
            {commissionStory.body}
          </p>

          <blockquote className="phoenix-quote" data-reveal>
            <p>{commissionStory.quote}</p>
            <cite>{commissionStory.quoteWho}</cite>
          </blockquote>

          <blockquote className="phoenix-quote phoenix-quote--maker" data-reveal>
            <p>{commissionStory.makerQuote}</p>
            <cite>{commissionStory.makerWho}</cite>
          </blockquote>
        </section>

        {/* ---------------- who he is ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement I — Who he is
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
                <span className="phoenix-artist-cn" lang="zh">
                  {artist.chineseName}
                </span>
              </p>
              <p className="phoenix-roles" data-reveal>
                {artist.roles} · {artist.city}
              </p>
              <p className="phoenix-lede" data-reveal style={{ marginTop: "var(--space-lg)" }}>
                {artist.paragraph}
              </p>

              <dl className="phoenix-figures">
                {credentials.map((item) => (
                  <div className="phoenix-figure" key={item.label} data-reveal>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>

              <dl className="phoenix-taught">
                <div data-reveal>
                  <dt>Taught piano by</dt>
                  <dd>{teachers.piano}</dd>
                </div>
                <div data-reveal>
                  <dt>Taught violin by</dt>
                  <dd>{teachers.violin}</dd>
                </div>
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

          <ul className="phoenix-halls">
            {halls.map((hall) => (
              <li key={hall} data-reveal>
                {hall}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- the record ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement II — The record
          </p>

          <dl className="phoenix-terms phoenix-record-figures">
            {record.map((item) => (
              <div className="phoenix-term" key={item.label} data-reveal>
                <dt>{item.label}</dt>
                <dd>
                  <Tally value={item.value} />
                </dd>
              </div>
            ))}
          </dl>

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
            </div>

            <figure style={{ margin: 0 }}>
              <div className="phoenix-photo" data-reveal="wipe" data-parallax>
                <img
                  src={photos.crowd.src}
                  width={photos.crowd.width}
                  height={photos.crowd.height}
                  alt={photos.crowd.alt}
                  loading="lazy"
                />
              </div>
              <figcaption className="phoenix-credit">{photos.crowd.credit}</figcaption>
            </figure>
          </div>

          <ul className="phoenix-awards">
            {awards.map((award) => (
              <li key={award.name} data-reveal>
                <span className="phoenix-award-name">{award.name}</span>
                <span className="phoenix-award-detail">{award.detail}</span>
              </li>
            ))}
          </ul>

          <p className="phoenix-territories" data-reveal>
            {territories.join(" · ")}
          </p>
        </section>

        {/* ---------------- hear him ---------------- */}
        <section className="phoenix-section phoenix-section--reel">
          <p className="phoenix-eyebrow" data-reveal>
            Movement III — Hear him
          </p>
          <h2 className="phoenix-h2" data-reveal>
            A minute in a room with him
          </h2>
          <Showreel caption="His own reel, in his own cut." />

          <h2 className="phoenix-h2" data-reveal style={{ marginTop: "var(--space-5xl)" }}>
            And this is what he writes when someone asks
          </h2>
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "48ch" }}>
            A game trailer, a car launch, a boy's third birthday, a Mandopop
            single. The same hand behind every one of them.
          </p>
          <Reel caption="Press a title to hear it" />
        </section>

        {/* ---------------- in the room ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement IV — In the room
          </p>
          <Films caption="Three nights the music was written for" />
        </section>

        {/* ---------------- who books him ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement V — Titans of industry
          </p>
          <ClientWall />

          <ul className="phoenix-words">
            {words.map((word) => (
              <li key={word.text} data-reveal>
                <blockquote className="phoenix-word">{word.text}</blockquote>
                <p className="phoenix-word-who">
                  {word.who} · {word.when}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- the calling ---------------- */}
        <section className="phoenix-section phoenix-section--calling">
          <p className="phoenix-eyebrow" data-reveal>
            Movement VI — Why he keeps going
          </p>
          <h2 className="phoenix-h2 phoenix-calling-lede" data-reveal>
            {calling.lede}
          </h2>
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "52ch" }}>
            {calling.body}
          </p>
          <figure className="phoenix-silhouette" data-reveal="wipe">
            <img
              src={photos.silhouette.src}
              width={photos.silhouette.width}
              height={photos.silhouette.height}
              alt={photos.silhouette.alt}
              loading="lazy"
            />
            <figcaption className="phoenix-credit">{photos.silhouette.credit}</figcaption>
          </figure>
        </section>

        {/* ---------------- and only now, the commission ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Coda — Commission one
          </p>
          <h2 className="phoenix-h2" data-reveal>
            {promise.headline}
          </h2>
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "52ch" }}>
            {service.lede}
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
