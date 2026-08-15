import { useRef } from "react";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Grain } from "../../components/Grain";
import { Films } from "./Films";
import { FilmScrub } from "../../components/FilmScrub";
import { Listen } from "../../components/Listen";
import { NowPlaying } from "../../components/NowPlaying";
import { Reel } from "../../components/Reel";
import { Groove } from "./Groove";
import { Showreel } from "../../components/Showreel";
import { StringRow } from "../../components/StringRow";
import { Volume } from "../../components/Volume";
import { Words } from "../../components/Words";
import { Band, Enquiry, Figure, Gauges, Index, Instrument, Loader, Marking, Plate, Plumb, Process, Struck } from "./parts";
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
    line: "The first six-string 24K gold violin played on any stage",
    sub: "Carved as a bird's wing in Donegal, and a year in the making.",
  },
  {
    mark: "The record",
    line: "Ten thousand performances",
    sub: "In front of a hundred and sixty-eight thousand people, across five continents.",
  },
];

/**
 * The instrument's own three beats. It is pinned while these are read, so the
 * object gets the same treatment as the man: held still and turned, rather than
 * scrolled past as a picture with a caption.
 */
const instrumentBeats = [
  {
    mark: concept.instrument.name,
    line: `${concept.instrument.year} · ${concept.instrument.material}`,
    note: photos.violin.credit,
  },
  {
    mark: "Drawn by him",
    line: "Nobody had built one before, so Dennis asked, and then waited a year.",
    note: commissionStory.eyebrow,
  },
  {
    mark: "Unveiled",
    line: "Unveiled on 22 October 2016 in front of three thousand people",
    note: "The Phoenix Rising",
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
      <Loader />
      <NowPlaying />
      <ConceptChrome concept={concept} />
      <Plumb />
      <Grain />

      <ScrollStage vh={420} cuts={cuts.length} className="phoenix-stage">
        {({ stage, progress }) => (
          <>
            {/* The scene *is* the photograph: it is uploaded as a texture,
                gilded, sliced by his own signal and finally dissolved into gold
                dust. The <img> below it is the no-WebGL fallback, and is
                invisible whenever the canvas is doing its job. */}
            <SceneCanvas
              factory={createPhoenixScene}
              progress={progress}
              label="Dennis Lau playing the gold Phoenix violin, gilded into lacquer and gold, sliced into bands by the sound of his own playing, with five staff lines ruled across the frame and gold dust rising off his edges."
            />
            <img
              className="phoenix-hero-plate"
              src={photos.press.src}
              width={photos.press.width}
              height={photos.press.height}
              alt={photos.press.alt}
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
                <Volume />
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
        {/* ---------------- the instrument, pinned and turning ---------------- */}
        <ScrollStage vh={300} cuts={instrumentBeats.length} className="phoenix-instrument">
          {({ stage }) => (
            <>
              <img
                className="phoenix-instrument-photo"
                src={photos.violin.src}
                width={photos.violin.width}
                height={photos.violin.height}
                alt={photos.violin.alt}
              />
              <div className="phoenix-instrument-beats">
                {instrumentBeats.map((beat, index) => (
                  <div
                    className="phoenix-instrument-beat"
                    key={beat.mark}
                    data-active={stage === index}
                  >
                    <span className="phoenix-mark">{beat.mark}</span>
                    <p className="phoenix-instrument-line">{beat.line}</p>
                    {beat.note ? <p className="phoenix-credit">{beat.note}</p> : null}
                  </div>
                ))}
              </div>
            </>
          )}
        </ScrollStage>

        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            {commissionStory.eyebrow}
          </p>
          <Words as="h2" className="phoenix-h2" text={commissionStory.lede} />
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
            Movement I · Who he is
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

              <StringRow caption="Pluck one of the four strings he writes on" />
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

        <Instrument />

        {/* ---------------- the record ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement II · The record
          </p>

          <dl className="phoenix-terms phoenix-record-figures">
            {record.map((item) => (
              <div className="phoenix-term" key={item.label} data-reveal>
                <dt>{item.label}</dt>
                <dd>
                  <Figure value={item.value} />
                </dd>
              </div>
            ))}
          </dl>

          <Gauges />

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
                  src={photos.liveBlue.src}
                  width={photos.liveBlue.width}
                  height={photos.liveBlue.height}
                  alt={photos.liveBlue.alt}
                  loading="lazy"
                />
              </div>
              <figcaption className="phoenix-credit">{photos.liveBlue.credit}</figcaption>
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

          <Index />
        </section>

        <FilmScrub
          sequence="phoenix"
          focus={0.63}
          frames={77}
          vh={360}
          className="phoenix-scrub"
          label="Dennis Lau alone on stage under a fan of white beams, playing to a three-thousand-seat hall."
          beats={[
            { mark: "The Phoenix Rising, 2016", line: "Three thousand seats, sold out, on his own name." },
            { mark: "And again in 2019", line: "The first Malaysian instrumentalist to do it twice." },
            { mark: "Music director, Aubrey Suwito", line: "A full band behind him, and the violin out in front of it." },
          ]}
        />

        {/* ---------------- hear him ---------------- */}
        <section className="phoenix-section phoenix-section--reel">
          <p className="phoenix-eyebrow" data-reveal>
            Movement III · Hear him
          </p>
          <Words as="h2" className="phoenix-h2" text={"Sixty seconds of him playing"} />
          <Showreel caption="His own reel, cut by him." />

          <p className="phoenix-eyebrow" data-reveal style={{ marginTop: "var(--space-5xl)" }}>
            The Journey, as he played it
          </p>
          <Groove />

          <Words as="h2" className="phoenix-h2" text={"Written to order"} style={{ marginTop: "var(--space-5xl)" }} />
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "48ch" }}>
            A game trailer, a car launch, a boy's third birthday and a Mandopop
            single all came from the same hand.
          </p>
          <Reel caption="Press a title to hear it" />
        </section>

        {/* ---------------- in the room ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Movement IV · In the room
          </p>
          <Films caption="Three films he scored" />
        </section>

        <Struck />

        {/* ---------------- who books him ---------------- */}
        <Band />

        <section className="phoenix-section phoenix-section--invert">

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

        <Plate photo={photos.stagePhoenix} line="The Phoenix's first night, October 2016" tall />

        {/* ---------------- the calling ---------------- */}
        <section className="phoenix-section phoenix-section--calling">
          <p className="phoenix-eyebrow" data-reveal>
            Movement V · The calling
          </p>
          <Words as="h2" className="phoenix-h2 phoenix-calling-lede" text={calling.lede} />
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "52ch" }}>
            {calling.body}
          </p>
          <Plate photo={photos.silhouette} line="Away from the stage" tall />
        </section>

        {/* ---------------- and only now, the commission ---------------- */}
        <section className="phoenix-section">
          <p className="phoenix-eyebrow" data-reveal>
            Coda · Commission one
          </p>
          <Words as="h2" className="phoenix-h2" text={promise.headline} />
          <p className="phoenix-lede" data-reveal style={{ maxWidth: "52ch" }}>
            {service.lede}
          </p>

          <Marking text="Adagio" />
        </section>

        <Process />

        <section className="phoenix-section">

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
                  <Figure value={tier.price} />
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
          <Enquiry />
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
