import { useEffect, useRef, useState } from "react";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Cursor } from "../../components/Cursor";
import { FilmScrub } from "../../components/FilmScrub";
import { Grain } from "../../components/Grain";
import { Listen } from "../../components/Listen";
import { Reel } from "../../components/Reel";
import { Showreel } from "../../components/Showreel";
import { Tally } from "../../components/Tally";
import { Volume } from "../../components/Volume";
import { Words } from "../../components/Words";
import { BoxOffice, Cast, Interval, Programme } from "./parts";
import { commission, promise, rights, service, steps, tiers } from "../../content/commission";
import {
  artist,
  awards,
  calling,
  commissionStory,
  credentials,
  halls,
  milestones,
  teachers,
  territories,
  training,
  violins,
} from "../../content/dennis";
import { photos } from "../../content/media";
import { score } from "../../content/score";
import { socials, words } from "../../content/work";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { useParallax } from "../../lib/useParallax";
import { useScrollReveal } from "../../lib/useScrollReveal";
import { conceptById } from "../registry";
import { createNocturneScene } from "./nocturneScene";
import "./nocturne.css";

const concept = conceptById("nocturne");

/**
 * A night at the house, in acts. The curtain parts in the hero, the lights come
 * up on the man, and the commission is the last door on the way out.
 */
const cuts = [
  { mark: "The house", line: "Dennis Lau", tail: "刘凯彦", sub: artist.showman },
  {
    mark: "The curtain",
    line: "Ten thousand nights",
    sub: "Five continents, three albums, and two sold-out halls of three thousand seats.",
  },
  {
    mark: "The instrument",
    line: "A violin nobody else has",
    sub: "Six strings, carbon fibre and 24K gold, drawn by him and built in Donegal.",
  },
  {
    mark: "And then, quietly",
    line: "One song, for one person",
    sub: "The last door in the house, and the only one with your name on it.",
  },
];

/** A small live readout, the way the studios do it: real, and never important. */
function Readout() {
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () => {
      setNow(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kuala_Lumpur",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    };
    tick();
    const timer = window.setInterval(tick, 20_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="nocturne-readout">
      <span>KUL {now}</span>
      <span className="nocturne-readout-sep" aria-hidden>
        /
      </span>
      <span>
        {score.key} · ♩ {score.bpm}
      </span>
      <span className="nocturne-readout-sep" aria-hidden>
        /
      </span>
      <span>Est. 2006</span>
    </p>
  );
}

/** Everything on this page is seen through the same arch. */
function Arch({
  photo,
  caption,
  tall = false,
}: {
  photo: (typeof photos)[keyof typeof photos];
  caption?: string;
  tall?: boolean;
}) {
  return (
    <figure className="arch" data-tall={tall} data-parallax data-scroll>
      <div className="arch-frame">
        <img
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="lazy"
        />
      </div>
      <figcaption className="arch-caption">
        {caption ? <span>{caption}</span> : null}
        <span className="nocturne-credit">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}

export function NocturnePage() {
  useFonts(concept.fonts);
  const main = useRef<HTMLElement>(null);
  useScrollReveal(main);
  useParallax(main);

  return (
    <div className="nocturne">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ConceptChrome concept={concept} />
      <Grain />
      <Cursor />

      <ScrollStage vh={460} cuts={cuts.length} className="nocturne-stage">
        {({ stage, progress }) => (
          <>
            <SceneCanvas
              factory={createNocturneScene}
              progress={progress}
              label="An oxblood velvet curtain under a brass lamp, parting as you scroll to reveal Dennis Lau playing behind it, with dust hanging in the beam."
            />

            <div className="nocturne-hero">
              <p className="nocturne-side nocturne-side--left" aria-hidden>
                {artist.city}
              </p>
              <p className="nocturne-side nocturne-side--right" aria-hidden>
                Nocturne · 03
              </p>

              <div className="nocturne-cuts">
                {cuts.map((cut, index) => (
                  <div className="nocturne-cut" key={cut.mark} data-active={stage === index}>
                    <span className="nocturne-mark">{cut.mark}</span>
                    {index === 0 ? (
                      <h1 className="nocturne-title">
                        <em>the</em> {cut.line}
                        <span className="nocturne-title-cn" lang="zh">
                          {cut.tail}
                        </span>
                      </h1>
                    ) : (
                      <p className="nocturne-line">{cut.line}</p>
                    )}
                    <p className="nocturne-sub">{cut.sub}</p>
                  </div>
                ))}
              </div>

              <div className="nocturne-hero-foot">
                <div className="nocturne-hero-play">
                  <Listen label="Hear him" />
                  <Volume label="Volume" />
                </div>
                <Readout />
              </div>
            </div>
          </>
        )}
      </ScrollStage>

      <main id="main" className="nocturne-body" ref={main}>
        {/* ---------------- the house lights ---------------- */}
        <section className="nocturne-act nocturne-act--ivory nocturne-act--creed">
          <p className="nocturne-eyebrow" data-reveal>
            <em>a</em> HOUSE BUILT <em>on</em> ONE PLAYER
          </p>
          <h2 className="nocturne-statement" data-reveal>
            <em>one</em> SONG, <em>written for</em> ONE PERSON, <em>and</em> NEVER PLAYED AGAIN.
          </h2>
          <p className="nocturne-lede nocturne-lede--centre" data-reveal>
            {artist.paragraph}
          </p>
        </section>

        {/* A line that travels as you pass it, the way a marquee outside a hall does. */}
        <div className="nocturne-travel" data-scroll aria-hidden>
          <p className="nocturne-travel-line">
            {artist.showman} — {artist.roles} — {artist.city} —
          </p>
        </div>

        {/* ---------------- the man ---------------- */}
        <section className="nocturne-act">
          <p className="nocturne-eyebrow" data-reveal>
            ACT I <em>—</em> THE MAN
          </p>

          <div className="nocturne-spread">
            <div>
              <Words
                as="h2"
                className="nocturne-h2"
                text="He was at the piano before he could read, and it was his mother's."
              />
              <p className="nocturne-lede" data-reveal>
                {artist.oneLine}
              </p>

              <dl className="nocturne-spec">
                {credentials.map((item) => (
                  <div className="nocturne-spec-row" key={item.label} data-reveal>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
                <div className="nocturne-spec-row" data-reveal>
                  <dt>Taught piano by</dt>
                  <dd>{teachers.piano}</dd>
                </div>
                <div className="nocturne-spec-row" data-reveal>
                  <dt>Taught violin by</dt>
                  <dd>{teachers.violin}</dd>
                </div>
              </dl>
            </div>

            <Arch photo={photos.seated} caption="Plate I" />
          </div>

          <ol className="nocturne-list">
            {training.map((line) => (
              <li key={line} data-reveal>
                {line}
              </li>
            ))}
          </ol>

          <ul className="nocturne-list nocturne-list--plain">
            {halls.map((hall) => (
              <li key={hall} data-reveal>
                {hall}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- the record ---------------- */}
        <section className="nocturne-act nocturne-act--ivory">
          <p className="nocturne-eyebrow" data-reveal>
            ACT II <em>—</em> THE RECORD
          </p>

          <BoxOffice />

          <ul className="nocturne-timeline">
            {milestones.map((item) => (
              <li key={item.year} data-reveal>
                <span className="nocturne-timeline-year">{item.year}</span>
                <span className="nocturne-timeline-title">{item.title}</span>
                <span className="nocturne-timeline-detail">{item.detail}</span>
              </li>
            ))}
          </ul>

          <p className="nocturne-territories" data-reveal>
            <em>played in</em> {territories.map((territory) => territory.name).join(" · ")}
          </p>

          <dl className="nocturne-spec nocturne-spec--awards">
            {awards.map((award) => (
              <div className="nocturne-spec-row" key={award.name} data-reveal>
                <dt>{award.name}</dt>
                <dd>{award.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------- the instrument, turning ---------------- */}
        <FilmScrub
          sequence="nocturne"
          frames={87}
          vh={360}
          className="nocturne-scrub"
          label="The Phoenix violin turning on its own reflection, its carved wing catching the light from silver into gold."
          beats={[
            { mark: "ACT III — THE INSTRUMENT", line: "Drawn by him. Built for him." },
            { mark: "Donegal, a year", line: "Six strings, carbon fibre, 24K gold." },
          ]}
        />

        <section className="nocturne-act">
          <div className="nocturne-spread nocturne-spread--wide">
            <div>
              <Words as="h2" className="nocturne-h2" text={commissionStory.lede} />
              <p className="nocturne-lede" data-reveal>
                {commissionStory.body}
              </p>
              <blockquote className="nocturne-quote" data-reveal>
                <p>{commissionStory.quote}</p>
                <cite>{commissionStory.quoteWho}</cite>
              </blockquote>
              <blockquote className="nocturne-quote nocturne-quote--maker" data-reveal>
                <p>{commissionStory.makerQuote}</p>
                <cite>{commissionStory.makerWho}</cite>
              </blockquote>
            </div>
            <figure className="nocturne-plate" data-reveal="wipe" data-parallax>
              <img
                src={photos.violin.src}
                width={photos.violin.width}
                height={photos.violin.height}
                alt={photos.violin.alt}
                loading="lazy"
              />
              <figcaption>
                <span>Plate II</span>
                <span className="nocturne-credit">{photos.violin.credit}</span>
              </figcaption>
            </figure>
          </div>

          <ul className="nocturne-instruments">
            {violins.map((violin) => (
              <li key={violin.id} data-reveal>
                <span className="nocturne-instrument-name">{violin.name}</span>
                <span className="nocturne-instrument-year">{violin.year}</span>
                <span className="nocturne-instrument-material">{violin.material}</span>
                <span className="nocturne-instrument-note">{violin.note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- hear him ---------------- */}
        <section className="nocturne-act nocturne-act--ivory nocturne-act--reel">
          <div className="nocturne-centred">
            <p className="nocturne-eyebrow" data-reveal>
              ACT IV <em>—</em> HEAR HIM
            </p>
            <h2 className="nocturne-statement nocturne-statement--small" data-reveal>
              <em>a</em> MINUTE <em>in a room with</em> HIM
            </h2>
          </div>

          <Showreel caption="His own reel, in his own cut." />

          <h3 className="nocturne-sub-head" data-reveal>
            <em>and</em> WHAT HE WRITES <em>when someone asks</em>
          </h3>
          <Reel caption="Press a title to hear it" index={(position) => `No. ${position + 1}`} />
        </section>

        <Interval />

        {/* ---------------- the rooms ---------------- */}
        <section className="nocturne-act">
          <p className="nocturne-eyebrow" data-reveal>
            ACT V <em>—</em> TONIGHT&rsquo;S PROGRAMME
          </p>
          <Programme />
        </section>

        {/* ---------------- who books him ---------------- */}
        <section className="nocturne-act nocturne-act--ivory">
          <p className="nocturne-eyebrow" data-reveal>
            ACT VI <em>—</em> WHO BOOKS HIM
          </p>
          <Cast />

          <ul className="nocturne-words">
            {words.map((word) => (
              <li key={word.text} data-reveal>
                <blockquote>{word.text}</blockquote>
                <p className="nocturne-word-who">
                  {word.who} · {word.when}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- the calling ---------------- */}
        <section className="nocturne-act nocturne-act--calling">
          <p className="nocturne-eyebrow" data-reveal>
            ACT VII <em>—</em> WHY HE KEEPS GOING
          </p>
          <h2 className="nocturne-statement" data-reveal>
            <em>everyone</em> IS CHOSEN <em>to</em> SUCCEED.
          </h2>
          <p className="nocturne-lede nocturne-lede--centre" data-reveal>
            {calling.body}
          </p>
          <Arch photo={photos.silhouette} caption="Plate III" tall />
        </section>

        {/* ---------------- the last door ---------------- */}
        <section className="nocturne-act nocturne-act--coda">
          <p className="nocturne-eyebrow" data-reveal>
            CODA <em>—</em> THE LAST DOOR
          </p>
          <Words as="h2" className="nocturne-h2" text={promise.headline} />
          <p className="nocturne-lede" data-reveal>
            {service.lede}
          </p>

          <ol className="nocturne-steps">
            {steps.map((step) => (
              <li key={step.index} data-reveal>
                <span className="nocturne-step-index">{step.index}</span>
                <span className="nocturne-step-title">{step.title}</span>
                <span className="nocturne-step-marking">{step.marking}</span>
                <p className="nocturne-step-body">{step.body}</p>
              </li>
            ))}
          </ol>

          <dl className="nocturne-spec nocturne-spec--rights">
            {rights.map((right) => (
              <div className="nocturne-spec-row" key={right.term} data-reveal>
                <dt>{right.term}</dt>
                <dd>{right.detail}</dd>
              </div>
            ))}
          </dl>

          <ul className="nocturne-tiers">
            {tiers.map((tier) => (
              <li key={tier.id} data-reveal>
                <p className="nocturne-tier-price">
                  <Tally value={tier.price} />
                </p>
                <h3 className="nocturne-tier-name">{tier.name}</h3>
                <p className="nocturne-tier-length">{tier.length}</p>
                <p className="nocturne-tier-summary">{tier.summary}</p>
                <ul className="nocturne-tier-list">
                  {tier.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <dl className="nocturne-spec">
            <div className="nocturne-spec-row" data-reveal>
              <dt>Delivery</dt>
              <dd>{commission.turnaround}</dd>
            </div>
            <div className="nocturne-spec-row" data-reveal>
              <dt>Revisions</dt>
              <dd>{commission.revisions}</dd>
            </div>
            <div className="nocturne-spec-row" data-reveal>
              <dt>Availability</dt>
              <dd>{commission.slots}</dd>
            </div>
          </dl>

          <a className="nocturne-cta" href="#main">
            Write the prompt
          </a>
          <p className="nocturne-note">{commission.note}</p>

          <ul className="nocturne-socials">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} rel="noreferrer noopener" target="_blank">
                  <span className="nocturne-social-label">{social.label}</span>
                  <span className="nocturne-social-handle">{social.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* The wordmark, set as large as the page allows, on the way out. */}
        <div className="nocturne-outmark" data-scroll aria-hidden>
          <span>{artist.name}</span>
        </div>

        <ConceptSwitch concept={concept} />
      </main>
    </div>
  );
}
