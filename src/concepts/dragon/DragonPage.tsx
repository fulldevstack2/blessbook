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
import { useScrollReveal } from "../../lib/useScrollReveal";
import { conceptById } from "../registry";
import { createDragonScene } from "./dragonScene";
import "./dragon.css";

const concept = conceptById("dragon");

const numerals = ["一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;

/**
 * The hero, in the register of a hand scroll: a brush phrase in the margin, the
 * Latin beneath it, and the claim itself in Faustina. Every cut is about Dennis
 * — the commission is the last of the four, not the first.
 */
const cuts = [
  {
    brush: artist.chineseName,
    latin: "Kuala Lumpur",
    line: artist.name,
    sub: artist.showman,
  },
  {
    brush: "一把琴",
    latin: "The instrument",
    line: "A six-string violin, carved as a wing, plated in gold",
    sub: "Drawn by him, built for him in Donegal, and waited a year for.",
  },
  {
    brush: "一万场演出",
    latin: "The record",
    line: "Ten thousand nights, five continents",
    sub: "Three albums, and two sold-out concerts of three thousand seats each.",
  },
  {
    brush: "为你写一首歌",
    latin: "And then this",
    line: "One song, written for one person",
    sub: "The quietest thing he does. No audience but you.",
  },
];

function Margin({ index, label }: { index: number; label: string }) {
  return (
    <div className="dragon-margin">
      <span className="dragon-numeral" aria-hidden>
        {numerals[index]}
      </span>
      <span className="dragon-label">{label}</span>
    </div>
  );
}

export function DragonPage() {
  useFonts(concept.fonts);
  const main = useRef<HTMLElement>(null);
  useScrollReveal(main);

  return (
    <div className="dragon">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ConceptChrome concept={concept} />

      <ScrollStage vh={420} cuts={cuts.length} className="dragon-stage">
        {({ stage, progress }) => (
          <>
            {/* Him, as ink. The photograph is monochrome and multiplied into the
                paper, so the white sky disappears and only the figure is left —
                which is what this concept does to everything it touches. */}
            <img
              className="dragon-hero-plate"
              src={photos.silhouette.src}
              width={photos.silhouette.width}
              height={photos.silhouette.height}
              alt={photos.silhouette.alt}
            />
            <SceneCanvas
              factory={createDragonScene}
              progress={progress}
              label="Ink dropped into water, blooming outward and then drawing back together into the two f-holes of a violin."
            />

            <div className="dragon-hero">
              <div className="dragon-cuts">
                {cuts.map((cut, index) => (
                  <div key={cut.latin} className="dragon-cut" data-active={stage === index}>
                    <span className="dragon-mark" lang="zh">
                      {cut.brush}
                    </span>
                    <span className="dragon-mark-latin">{cut.latin}</span>
                    {index === 0 ? (
                      <h1>{cut.line}</h1>
                    ) : (
                      <p className="dragon-line">{cut.line}</p>
                    )}
                    <p className="dragon-sub">{cut.sub}</p>
                    {index === 0 ? (
                      <p className="dragon-roles dragon-hero-roles">{artist.roles}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="dragon-hero-listen">
                <Listen />
              </div>

              <div className="dragon-hero-foot">
                <span>{photos.silhouette.credit}</span>
                <span className="dragon-progress" aria-hidden />
                <span>Scroll</span>
              </div>
            </div>
          </>
        )}
      </ScrollStage>

      <main id="main" className="dragon-body" ref={main}>
        <section className="dragon-section">
          <Margin index={0} label="Who he is" />
          <div>
            <p className="dragon-name" data-reveal>
              {artist.name}
            </p>
            <div className="dragon-seal-row">
              <span className="dragon-seal" lang="zh" aria-label={artist.chineseName}>
                {artist.chineseName}
              </span>
              <span className="dragon-roles">
                {artist.roles} · {artist.city} · {artist.born}
              </span>
            </div>

            <div className="dragon-two dragon-two--wide">
              <div>
                <p className="dragon-lede" data-reveal>
                  {artist.paragraph}
                </p>
                <dl className="dragon-figures">
                  {credentials.map((item) => (
                    <div className="dragon-figure" key={item.label} data-reveal>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <dl className="dragon-taught">
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

              <figure className="dragon-photo" data-reveal="wipe">
                <img
                  src={photos.cutout.src}
                  width={photos.cutout.width}
                  height={photos.cutout.height}
                  alt={photos.cutout.alt}
                  loading="lazy"
                />
                <figcaption className="dragon-credit">{photos.cutout.credit}</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={1} label="Training" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              Twenty years of paper before the first commission
            </h2>
            <ul className="dragon-list">
              {training.map((line, index) => (
                <li key={line} data-reveal>
                  <span className="dragon-list-mark">{index + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <h3 className="dragon-sub-head" data-reveal>
              And where he played before any of this
            </h3>
            <ul className="dragon-list">
              {halls.map((hall, index) => (
                <li key={hall} data-reveal>
                  <span className="dragon-list-mark">{index + 1}</span>
                  <span>{hall}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={2} label="The record" />
          <div>
            <dl className="dragon-terms">
              {record.map((item) => (
                <div className="dragon-term" key={item.label} data-reveal>
                  <dt>{item.label}</dt>
                  <dd>
                    <Tally value={item.value} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="dragon-two">
              <div>
                <ul className="dragon-list" style={{ marginTop: 0 }}>
                  {milestones.map((item) => (
                    <li key={item.year} data-reveal>
                      <span className="dragon-list-mark">{item.year}</span>
                      <span>
                        <strong style={{ fontWeight: 600 }}>{item.title}</strong> — {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <figure className="dragon-photo dragon-photo--tall" data-reveal="wipe">
                <img
                  src={photos.seated.src}
                  width={photos.seated.width}
                  height={photos.seated.height}
                  alt={photos.seated.alt}
                  loading="lazy"
                />
                <figcaption className="dragon-credit">{photos.seated.credit}</figcaption>
              </figure>
            </div>

            <ul className="dragon-awards">
              {awards.map((award) => (
                <li key={award.name} data-reveal>
                  <span className="dragon-award-name">{award.name}</span>
                  <span className="dragon-award-detail">{award.detail}</span>
                </li>
              ))}
            </ul>

            <p className="dragon-territories" data-reveal>
              {territories.join(" · ")}
            </p>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={3} label="The instrument" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              {commissionStory.lede}
            </h2>
            <p className="dragon-lede" data-reveal>
              {commissionStory.body}
            </p>

            <figure className="dragon-photo dragon-photo--plate" data-reveal="wipe">
              <img
                src={photos.violin.src}
                width={photos.violin.width}
                height={photos.violin.height}
                alt={photos.violin.alt}
                loading="lazy"
              />
              <figcaption className="dragon-credit">
                {concept.instrument.name} · {concept.instrument.year} ·{" "}
                {photos.violin.credit}
              </figcaption>
            </figure>

            <blockquote className="dragon-quote" data-reveal>
              <p>{commissionStory.quote}</p>
              <cite>{commissionStory.quoteWho}</cite>
            </blockquote>

            <blockquote className="dragon-quote dragon-quote--maker" data-reveal>
              <p>{commissionStory.makerQuote}</p>
              <cite>{commissionStory.makerWho}</cite>
            </blockquote>
          </div>
        </section>

        <section className="dragon-section dragon-section--reel">
          <Margin index={4} label="Hear him" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              A minute in a room with him
            </h2>
            <Showreel caption="His own reel, in his own cut." />

            <h2 className="dragon-h2" data-reveal style={{ marginTop: "var(--space-5xl)" }}>
              And this is what he writes when someone asks
            </h2>
            <p className="dragon-lede" data-reveal>
              A game trailer, a car launch, a boy's third birthday, a Mandopop
              single. The same hand behind every one of them.
            </p>
            <Reel caption="Press a title to hear it" />
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={5} label="In the room" />
          <div>
            <Films caption="Three nights the music was written for" />
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={6} label="Titans of industry" />
          <div>
            <ClientWall />

            <ul className="dragon-words">
              {words.map((word) => (
                <li key={word.text} data-reveal>
                  <blockquote className="dragon-word">{word.text}</blockquote>
                  <p className="dragon-word-who">
                    {word.who} · {word.when}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={7} label="Why he keeps going" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              {calling.lede}
            </h2>
            <p className="dragon-lede" data-reveal>
              {calling.body}
            </p>
            <figure className="dragon-photo dragon-photo--plate" data-reveal="wipe">
              <img
                src={photos.portraitMono.src}
                width={photos.portraitMono.width}
                height={photos.portraitMono.height}
                alt={photos.portraitMono.alt}
                loading="lazy"
              />
              <figcaption className="dragon-credit">{photos.portraitMono.credit}</figcaption>
            </figure>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={8} label="Commission" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              {promise.headline}
            </h2>
            <p className="dragon-lede" data-reveal>
              {service.lede}
            </p>

            <Stave tempo="Adagio · quarter note = 58" />
            <ol className="dragon-steps" style={{ marginTop: "var(--space-2xl)" }}>
              {steps.map((step, index) => (
                <li className="dragon-step" key={step.index} data-reveal>
                  <div className="dragon-step-head">
                    <span className="dragon-step-index" aria-hidden>
                      {numerals[index]}
                    </span>
                    <h3 className="dragon-step-title">{step.title}</h3>
                    <span className="dragon-step-marking">{step.marking}</span>
                  </div>
                  <p className="dragon-step-body">{step.body}</p>
                </li>
              ))}
            </ol>

            <h3 className="dragon-sub-head" data-reveal>
              {promise.ownership}
            </h3>
            <p className="dragon-lede" data-reveal>
              {service.against}
            </p>
            <dl className="dragon-rights">
              {rights.map((right) => (
                <div className="dragon-right" key={right.term} data-reveal>
                  <dt>{right.term}</dt>
                  <dd>{right.detail}</dd>
                </div>
              ))}
            </dl>

            <ul className="dragon-tiers">
              {tiers.map((tier) => (
                <li className="dragon-tier" key={tier.id} data-reveal>
                  <p className="dragon-tier-price">
                    <Tally value={tier.price} />
                  </p>
                  <h3 className="dragon-tier-name">{tier.name}</h3>
                  <p className="dragon-tier-length">{tier.length}</p>
                  <p className="dragon-tier-summary">{tier.summary}</p>
                  <ul className="dragon-tier-list">
                    {tier.includes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <dl className="dragon-terms">
              <div className="dragon-term" data-reveal>
                <dt>Delivery</dt>
                <dd>{commission.turnaround}</dd>
              </div>
              <div className="dragon-term" data-reveal>
                <dt>Revisions</dt>
                <dd>{commission.revisions}</dd>
              </div>
              <div className="dragon-term" data-reveal>
                <dt>Availability</dt>
                <dd>{commission.slots}</dd>
              </div>
            </dl>

            <a className="dragon-cta" href="#main">
              Write the prompt
            </a>
            <p className="dragon-note">{commission.note}</p>

            <ul className="dragon-socials">
              {socials.map((social) => (
                <li key={social.label}>
                  <a href={social.href} rel="noreferrer noopener" target="_blank">
                    <span className="dragon-social-label">{social.label}</span>
                    <span className="dragon-social-handle">{social.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ConceptSwitch concept={concept} />
      </main>
    </div>
  );
}
