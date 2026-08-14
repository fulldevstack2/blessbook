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
import { useScrollReveal } from "../../lib/useScrollReveal";
import { conceptById } from "../registry";
import { createDragonScene } from "./dragonScene";
import "./dragon.css";

const concept = conceptById("dragon");

const numerals = ["一", "二", "三", "四", "五", "六", "七", "八"] as const;

const cuts = [
  {
    brush: "为你写一首歌",
    latin: "Blesspoke",
    line: promise.headline,
    sub: "A song that exists because you asked for it, and for no other reason.",
  },
  {
    brush: "一句话，一首歌",
    latin: "The ask",
    line: promise.request,
    sub: "One paragraph from you. No brief templates, no rounds of stakeholder notes.",
  },
  {
    brush: "版权归你",
    latin: "The deed",
    line: promise.ownership,
    sub: "Master and composition transfer to your name. The artist keeps nothing.",
  },
  {
    brush: artist.chineseName,
    latin: "One artist, no roster",
    line: artist.name,
    sub: artist.oneLine,
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
                  </div>
                ))}
              </div>

              <div className="dragon-hero-foot">
                <span>Kuala Lumpur</span>
                <span className="dragon-progress" aria-hidden />
                <span>Scroll</span>
              </div>
            </div>
          </>
        )}
      </ScrollStage>

      <main id="main" className="dragon-body" ref={main}>
        <section className="dragon-section">
          <Margin index={0} label="The only artist" />
          <div>
            <p className="dragon-name" data-reveal>
              {artist.name}
            </p>
            <div className="dragon-seal-row">
              <span className="dragon-seal" lang="zh" aria-label={artist.chineseName}>
                {artist.chineseName}
              </span>
              <span className="dragon-roles">
                {artist.roles} · {artist.city}
              </span>
            </div>

            <div className="dragon-two dragon-two--wide">
              <div>
                <p className="dragon-lede" data-reveal>
                  {artist.paragraph}
                </p>
                <p className="dragon-service" data-reveal>
                  {service.lede}
                </p>
                <dl className="dragon-figures">
                  {credentials.map((item) => (
                    <div className="dragon-figure" key={item.label} data-reveal>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
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
            <dl className="dragon-terms">
              {tallies.map((item) => (
                <div className="dragon-term" key={item.label} data-reveal>
                  <dt>{item.label}</dt>
                  <dd>
                    <Tally value={item.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={2} label="The record" />
          <div>
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
          </div>
        </section>

        <section className="dragon-section dragon-section--reel">
          <Margin index={3} label="The commissions" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              Written for someone, once
            </h2>
            <p className="dragon-lede" data-reveal>
              A game trailer, a car launch, a boy's third birthday, a Mandopop
              single. The same hand behind every one of them.
            </p>
            <Reel caption="Press a title to hear it" />
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={4} label="How it runs" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              {promise.request}
            </h2>
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

            <dl className="dragon-terms">
              {proof.map((item) => (
                <div className="dragon-term" key={item.label} data-reveal>
                  <dt>{item.label}</dt>
                  <dd>
                    <Tally value={item.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={5} label="In the room" />
          <div>
            <Films caption="Three nights the music was written for" />
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={6} label="The deed" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              {promise.ownership}
            </h2>
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

            <ul className="dragon-words">
              {words.map((word) => (
                <li key={word.text} data-reveal>
                  <blockquote className="dragon-word">{word.text}</blockquote>
                  <p className="dragon-word-who">
                    {word.who} · {word.what} · {word.when}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={7} label="Commission" />
          <div>
            <h2 className="dragon-h2" data-reveal>
              {promise.headline}
            </h2>

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
