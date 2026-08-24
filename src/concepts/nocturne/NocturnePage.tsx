import { useEffect, useRef, useState } from "react";
import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Cursor } from "../../components/Cursor";
import { FilmScrub } from "../../components/FilmScrub";
import { Grain } from "../../components/Grain";
import { Commission } from "../../components/Commission";
import { Listen } from "../../components/Listen";
import { NowPlaying } from "../../components/NowPlaying";
import { Reel } from "../../components/Reel";
import { Showreel } from "../../components/Showreel";
import { Volume } from "../../components/Volume";
import { Words } from "../../components/Words";
import { BoxOffice, Cast, Enquiry, Figure, Instrument, Interval, Loader, Process, Programme } from "./parts";
import { commission, promise, rights, service, tiers } from "../../content/commission";
import {
  artist,
  awards,
  calling,
  commissionStory,
  credentials,
  firstNight,
  halls,
  milestones,
  teachers,
  territories,
  training,
  violins,
} from "../../content/dennis";
import { livePhrase, photos } from "../../content/media";
import { socials, words } from "../../content/work";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { useParallax } from "../../lib/useParallax";
import { useScrollReveal } from "../../lib/useScrollReveal";
import { conceptById } from "../registry";
import { createNocturneScene } from "./nocturneScene";
import { createSoundScene } from "./soundScene";
import "./nocturne.css";
import { House } from "./House";

const concept = conceptById("nocturne");

/**
 * A night at the house, in acts. The curtain parts in the hero, the lights come
 * up on the man, and the commission is the last door on the way out.
 */
const cuts = [
  { mark: "The house", line: "Dennis Lau", tail: "刘凯彦", sub: artist.showman },
  {
    mark: "The curtain",
    line: "Ten thousand performances",
    sub: "Five continents, three albums, and two sold-out halls of three thousand seats.",
  },
  {
    mark: "The instrument",
    line: "A violin nobody else has",
    sub: "Six strings, carbon fibre and 24K gold, drawn by him and built in Donegal.",
  },
  {
    mark: "The studio",
    line: "He writes it, plays it and produces it",
    sub: "Three albums of his own, and Best Producer at the VIMA awards for the first of them.",
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
      <span>Six strings · 24K</span>
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
      <Loader />
      <NowPlaying />
      <ConceptChrome concept={concept} />
      <Grain />
      <Commission />
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
        {/* ---------------- the night ----------------

            What stood here was a slogan over a summary. The eyebrow said "a
            house built on one player", which is a metaphor asking to be solved
            rather than a fact; the statement was half of his own tagline with
            the half that explains it cut off; and the paragraph under them told
            the reader the piano, the violin, the albums, the continents, the
            sold-out halls and the commission — every act on this page, before
            any of them had begun. Under it, his own billing line, set alone
            between two rules, which the hero had already shown two screens
            earlier.

            One night replaces all of it. The 22nd of October 2016 is the only
            date in his record that carries two firsts at once, both of them
            checkable, neither of them adjectives, and stating them plainly is
            worth more than any claim the site could make on his behalf. The
            acts then go on to earn them. */}
        <ScrollStage vh={320} cuts={1} className="sound">
          {({ progress }) => (
            <>
              <SceneCanvas
                factory={createSoundScene}
                progress={progress}
                className="sound-stage"
                label="Two ranks of golden organ pipes receding into darkness over a mirrored floor, their heights the loudness of Dennis Lau's playing at every moment of a forty-second phrase recorded live in 2016."
              />
              {/* The room goes dark towards its own wall, which is where the
                  type lives. A panel behind the words would be a panel; this is
                  just the far end of the hall. */}
              <span className="sound-scrim" aria-hidden />

              <div className="sound-plate">
                <p className="nocturne-eyebrow">
                  {firstNight.billing} <em>·</em> {firstNight.date}
                </p>
                <h2 className="nocturne-statement nocturne-statement--small">
                  FORTY SECONDS <em>of</em> THAT NIGHT
                </h2>
                <p className="sound-note">
                  You are walking down the sound of it. Every pipe is one moment of{" "}
                  <em>{livePhrase.title}</em>, measured off the recording made that night on
                  the Phoenix: where he leans on the bow the rank stands tall, and where he
                  lifts it, it drops away. Press play and the brass answers.
                </p>
                <div className="sound-listen">
                  <Listen label="Hear that night" />
                  <Volume />
                </div>
              </div>
            </>
          )}
        </ScrollStage>

        {/* And then, on a lit page, what the night was: the two claims stated
            plainly and nothing else on the sheet. The dark section is the
            experience of it and this is the record of it, which is also how the
            page keeps its pulse — the run from the hero down to Act I was
            otherwise three dark screens in a row. */}
        <section className="nocturne-act nocturne-act--ivory nocturne-act--night">
          <p className="nocturne-eyebrow" data-reveal>
            <em>the</em> STANDING
          </p>
          <h2 className="nocturne-statement" data-reveal>
            ONE NIGHT, <em>two</em> FIRSTS
          </h2>

          {/* `data-scroll` here rather than on each row: `--s` draws the brass
              rules, and the pair should draw together. */}
          <ol className="nocturne-firsts" data-scroll>
            {firstNight.firsts.map((first, index) => (
              <li key={first.claim} data-reveal>
                <span className="nocturne-firsts-numeral" aria-hidden>
                  {index === 0 ? "I" : "II"}
                </span>
                <span className="nocturne-firsts-rule" aria-hidden />
                <p className="nocturne-firsts-claim">{first.claim}</p>
                <p className="nocturne-firsts-note">{first.note}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- the man ---------------- */}
        <section className="nocturne-act">
          <p className="nocturne-eyebrow" data-reveal>
            ACT I <em>·</em> THE MAN
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
            ACT II <em>·</em> THE RECORD
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
            { mark: "ACT III · THE INSTRUMENT", line: "Dennis drew it and Alistair Hay built it." },
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

        {/* The object itself, turning. It belongs to ACT III and nowhere else:
            it had been sitting inside ACT VI, between the client wall and the
            compliments those same clients paid, which read as a slide that had
            wandered in from another deck. */}
        <Instrument />

        {/* ---------------- hear him ---------------- */}
        <section className="nocturne-act nocturne-act--ivory nocturne-act--reel">
          {/* The house's own lattice, drifting behind the bill: engraved rules and
              a warm pool of lamplight, so the page is a printed programme rather
              than a video on a blank sheet. */}
          <div className="nocturne-lattice" data-scroll aria-hidden>
            <span className="nocturne-lattice-glow" />
          </div>

          <div className="nocturne-centred">
            <p className="nocturne-eyebrow" data-reveal>
              ACT IV <em>·</em> HEAR HIM
            </p>
            <h2 className="nocturne-statement nocturne-statement--small" data-reveal>
              SIXTY SECONDS <em>of him</em> PLAYING
            </h2>
          </div>

          <div className="nocturne-bill" data-scroll>
            <p className="nocturne-bill-mark" aria-hidden>
              <span>Programme</span>
              <span>Film</span>
            </p>
            <Showreel caption="His own reel, cut by him." />
          </div>

          <h3 className="nocturne-sub-head" data-reveal>
            <em>the</em> PIECES HE WAS ASKED FOR
          </h3>
          <Reel caption="Press a title to hear it" index={(position) => `No. ${position + 1}`} />
        </section>

        <Interval />

        {/* ---------------- the rooms ---------------- */}
        <section className="nocturne-act">
          <p className="nocturne-eyebrow" data-reveal>
            ACT V <em>·</em> TONIGHT&rsquo;S PROGRAMME
          </p>
          <Programme />
        </section>

        {/* The hall itself, filling. Everything from the showreel down had been a
            list on a page, and this is the one fact in the record big enough to
            be drawn rather than written. */}
        <House />

        {/* ---------------- who books him ---------------- */}
        <section className="nocturne-act nocturne-act--ivory">
          <p className="nocturne-eyebrow" data-reveal>
            ACT VII <em>·</em> WHO BOOKS HIM
          </p>
          <Cast />
        </section>

        <section className="nocturne-act">

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
            ACT VIII <em>·</em> THE CALLING
          </p>
          <h2 className="nocturne-statement" data-reveal>
            <em>everyone</em> IS CHOSEN <em>to</em> SUCCEED.
          </h2>
          <p className="nocturne-lede nocturne-lede--centre" data-reveal>
            {calling.body}
          </p>
        </section>

        {/* Cinemascope, full bleed, no cropping device: the arch was cutting the
            sky off this frame and making the best photograph on the site look
            like a keyhole. */}
        <figure className="nocturne-strip" data-parallax data-scroll>
          <img
            src={photos.silhouette.src}
            width={photos.silhouette.width}
            height={photos.silhouette.height}
            alt={photos.silhouette.alt}
            loading="lazy"
          />
          <figcaption>
            <span>Plate III</span>
            <span className="nocturne-credit">{photos.silhouette.credit}</span>
          </figcaption>
        </figure>

        {/* ---------------- the last door ---------------- */}
        {/* The button in the corner lands here, not on the form: the price is above
            the questions and it is what they came to find out. */}
        <section className="nocturne-act nocturne-act--coda" id="commission">
          <p className="nocturne-eyebrow" data-reveal>
            CODA <em>·</em> THE LAST DOOR
          </p>
          <Words as="h2" className="nocturne-h2" text={promise.headline} />
          <p className="nocturne-lede" data-reveal>
            {service.lede}
          </p>
          <Process />

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
                  <Figure value={tier.price} />
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
          <Enquiry />
          <p className="nocturne-note">{commission.note}</p>

        </section>

        {/* The way out: the plate and the addresses, one block. A footer of
            handles and then a card floating under it was two endings, and
            neither of them closed anything. */}
        <footer className="nocturne-close" data-scroll>
          <div className="nocturne-plateout-face">
            <p className="nocturne-plateout-name">{artist.name}</p>
            <p className="nocturne-plateout-cn" lang="zh">
              {artist.chineseName}
            </p>
            <span className="nocturne-plateout-rule" aria-hidden />
            <p className="nocturne-plateout-where">{artist.city} · on stage since 2006</p>
          </div>

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
        </footer>

        <ConceptSwitch concept={concept} />
      </main>
    </div>
  );
}
