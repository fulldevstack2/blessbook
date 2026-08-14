import { useRef } from "react";
import { Band } from "../../components/Band";
import { ClientWall } from "../../components/ClientWall";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Grain } from "../../components/Grain";
import { Kinetic } from "../../components/Kinetic";
import { Field } from "../../components/Field";
import { Films } from "../../components/Films";
import { FilmScrub } from "../../components/FilmScrub";
import { Handscroll } from "../../components/Handscroll";
import { Listen } from "../../components/Listen";
import { Marquee } from "../../components/Marquee";
import { Reel } from "../../components/Reel";
import { Score } from "../../components/Score";
import { ScoreRail } from "../../components/ScoreRail";
import { Showreel } from "../../components/Showreel";
import { Stave } from "../../components/Stave";
import { StringRow } from "../../components/StringRow";
import { Tally } from "../../components/Tally";
import { Territories } from "../../components/Territories";
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
import { useScrollReveal } from "../../lib/useScrollReveal";
import { conceptById } from "../registry";
import { createDragonScene } from "./dragonScene";
import "./dragon.css";

const concept = conceptById("dragon");

/** The plate in the instrument section is the Phoenix, whatever this concept is
 *  called — it is the instrument the story beside it is about. */
const phoenix = violins.find((violin) => violin.id === "phoenix");

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
      <ScoreRail />
      <Grain />

      <ScrollStage vh={420} cuts={cuts.length} className="dragon-stage">
        {({ stage, progress }) => (
          <>
            {/* He is inside the shader: his silhouette is sampled from the
                photograph and bled into the same ink field as the wash, so the
                figure and the water are one material. The <img> below is the
                no-WebGL fallback. */}
            <SceneCanvas
              factory={createDragonScene}
              progress={progress}
              label="Dennis Lau in silhouette, drawn as ink bleeding into water, the wash opening around him and settling into the two f-holes of a violin."
            />
            <img
              className="dragon-hero-plate"
              src={photos.silhouette.src}
              width={photos.silhouette.width}
              height={photos.silhouette.height}
              alt={photos.silhouette.alt}
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
                {artist.roles}
                <span className="dragon-born">
                  {artist.city} · born {artist.born}
                </span>
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
            <Words as="h2" className="dragon-h2" text={"Twenty years of paper before the first commission"} />
            <ul className="dragon-list">
              {training.map((line, index) => (
                <li key={line} data-reveal>
                  <span className="dragon-list-mark">{index + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <Words as="h3" className="dragon-sub-head" text={"And where he played before any of this"} />
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

            <Field />

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

            <ul className="dragon-awards">
              {awards.map((award) => (
                <li key={award.name} data-reveal>
                  <span className="dragon-award-name">{award.name}</span>
                  <span className="dragon-award-detail">{award.detail}</span>
                </li>
              ))}
            </ul>

            <Territories />
            <p className="dragon-territories" data-reveal>
              {territories.map((territory) => territory.name).join(" · ")}
            </p>
          </div>
        </section>

        {/* The record, unrolled: pinned, and pulled sideways as you scroll. */}
        <Handscroll className="dragon-record-scroll" vh={340}>
          <div className="dragon-unroll-head">
            <span className="dragon-unroll-mark" lang="zh">
              卷
            </span>
            <span className="dragon-unroll-label">Unroll the record</span>
          </div>
          {milestones.map((item) => (
            <article className="dragon-unroll-item" key={item.year}>
              <span className="dragon-unroll-year">{item.year}</span>
              <h3 className="dragon-unroll-title">{item.title}</h3>
              <p className="dragon-unroll-detail">{item.detail}</p>
            </article>
          ))}
        </Handscroll>

        <section className="dragon-section">
          <Margin index={3} label="The instrument" />
          <div>
            <Words as="h2" className="dragon-h2" text={commissionStory.lede} />
            <p className="dragon-lede" data-reveal>
              {commissionStory.body}
            </p>

            <figure
              className="dragon-photo dragon-photo--plate dragon-photo--object"
              data-reveal="wipe"
            >
              <img
                src={photos.violin.src}
                width={photos.violin.width}
                height={photos.violin.height}
                alt={photos.violin.alt}
                loading="lazy"
              />
              <figcaption className="dragon-credit">
                {phoenix?.name} · {phoenix?.year} · {photos.violin.credit}
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

        <FilmScrub
          sequence="dragon"
          frames={80}
          vh={340}
          className="dragon-scrub"
          label="Dennis Lau in silhouette against a bright, clouded sky, drawing the bow across the violin."
          beats={[
            { mark: "一弓", line: "One bow stroke, and the whole phrase follows." },
            { mark: "Scroll", line: "You are drawing it." },
          ]}
        />

        <section className="dragon-section dragon-section--reel">
          <Margin index={4} label="Hear him" />
          <div>
            <Words as="h2" className="dragon-h2" text={"A minute in a room with him"} />
            <Showreel caption="His own reel, in his own cut." />

            <Words as="h3" className="dragon-sub-head" text={"And what he played, written down"} />
            <Score />

            <Words as="h2" className="dragon-h2" text={"And this is what he writes when someone asks"} style={{ marginTop: "var(--space-5xl)" }} />
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

        <Kinetic />

        <section className="dragon-section">
          <Margin index={6} label="Who books him" />
          <div>
            <ClientWall />
            <Marquee />

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

        <Band photo={photos.crowd} line="A hundred and sixty-eight thousand people, so far." tall />

        <section className="dragon-section dragon-section--invert">
          <Margin index={7} label="Why he keeps going" />
          <div>
            <Words as="h2" className="dragon-h2" text={calling.lede} />
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
            <Words as="h2" className="dragon-h2" text={promise.headline} />
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

            <Words as="h3" className="dragon-sub-head" text={promise.ownership} />
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
