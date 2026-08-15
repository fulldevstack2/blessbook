import { useRef } from "react";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Grain } from "../../components/Grain";
import { FilmScrub } from "../../components/FilmScrub";
import { Listen } from "../../components/Listen";
import { NowPlaying } from "../../components/NowPlaying";
import { Reel } from "../../components/Reel";
import { Showreel } from "../../components/Showreel";
import { StringRow } from "../../components/StringRow";
import { Volume } from "../../components/Volume";
import { Words } from "../../components/Words";
import { Territories } from "./Territories";
import { BrushStroke, ClientScroll, Enquiry, Figure, FilmScrolls, Instrument, Loader, Marks, Process, Unroll } from "./parts";
import {
  commission,
  promise,
  rights,
  service,
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
 * Latin beneath it, and the claim itself in Faustina.
 *
 * Three cuts and all three are Dennis — who he is, where he came from, what he
 * has done. The middle one used to be the Phoenix: six strings, carved as a
 * wing, plated in gold. It was the best sentence on the page and it was in the
 * wrong place, because a hero that opens on a man and then cuts to his equipment
 * has changed the subject by its second breath. The instrument is an object he
 * owns, and the page has a whole section for it further down. What was missing
 * here was the thing that makes the record mean anything: he did not arrive
 * fully formed, he was taught from three.
 */
const cuts = [
  {
    brush: artist.chineseName,
    latin: "Kuala Lumpur",
    line: artist.name,
    sub: artist.showman,
  },
  {
    brush: "三岁学琴",
    latin: "The training",
    line: "Piano at three, violin at eight, a diploma at fifteen",
    sub: "His mother, a pianist, taught him the first of them. The rest followed from there.",
  },
  {
    brush: "一万场演出",
    latin: "The record",
    line: "Ten thousand performances, five continents",
    sub: "Three albums, and two sold-out concerts of three thousand seats.",
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
      <Loader />
      <NowPlaying />
      <ConceptChrome concept={concept} />
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
                    <span className="dragon-mark" lang="zh" data-name={index === 0}>
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
                <Volume />
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
                <StringRow caption="Pluck one of the four strings he writes on" />
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
            <Words as="h2" className="dragon-h2" text={"Eighteen years of training, then eighteen years on stage"} />
            <ul className="dragon-list">
              {training.map((line, index) => (
                <li key={line} data-reveal>
                  <span className="dragon-list-mark">{index + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <Words as="h3" className="dragon-sub-head" text={"Where he played before"} />
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
                    <Figure value={item.value} />
                  </dd>
                </div>
              ))}
            </dl>


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

          </div>
        </section>

        {/* Full bleed, outside the measured column: a chart of everywhere he has
            played needs the width of the page, not the width of the text. */}
        <Territories />

        {/* The record, unrolled: pinned, and pulled sideways as you scroll. */}
        <Unroll className="dragon-record-scroll" vh={340}>
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
        </Unroll>

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

        {/* The object itself, kept with the story of how it was made rather than
            stranded eight sections later next to the client list. */}
        <Instrument />

        <FilmScrub
          sequence="dragon"
          focus={0.2}
          frames={80}
          vh={340}
          className="dragon-scrub"
          label="Dennis Lau in silhouette against a bright, clouded sky, drawing the bow across the violin."
          beats={[
            { mark: "一弓", line: "One bow stroke, and the whole phrase follows." },
            { mark: "凤凰纪事", line: "From Eugene Low's film, shot away from any stage." },
          ]}
        />

        <section className="dragon-section dragon-section--reel">
          <Margin index={4} label="Hear him" />
          <div>
            <Words as="h2" className="dragon-h2" text={"Sixty seconds of him playing"} />
            <Showreel caption="His own reel, cut by him." />

            <Words as="h3" className="dragon-sub-head" text={"The opening stroke"} />
            <BrushStroke caption="The bow stroke he opens The Journey with" />

            <Words as="h2" className="dragon-h2" text={"Written to order"} style={{ marginTop: "var(--space-5xl)" }} />
            <p className="dragon-lede" data-reveal>
              A game trailer, a car launch, a boy's third birthday and a Mandopop
              single all came from the same hand.
            </p>
            <Reel caption="Press a title to hear it" />
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={5} label="In the room" />
          <div>
            <FilmScrolls caption="Three films he scored" />
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={6} label="Who books him" />
          <div>
            <ClientScroll />

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

        <Marks />

        <section className="dragon-section dragon-section--invert">
          <Margin index={7} label="The calling" />
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
            <Process />

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
                    <Figure value={tier.price} />
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
            <Enquiry />
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
