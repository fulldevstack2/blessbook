import { ConceptChrome, ConceptSwitch } from "../../components/ConceptChrome";
import { Stave } from "../../components/Stave";
import { StringRow } from "../../components/StringRow";
import { commission, promise, rights, steps } from "../../content/commission";
import { artist, credentials, milestones, tallies, training } from "../../content/dennis";
import { photos } from "../../content/media";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { ScrollStage } from "../../lib/ScrollStage";
import { useFonts } from "../../lib/useFonts";
import { conceptById } from "../registry";
import { createDragonScene } from "./dragonScene";
import "./dragon.css";

const concept = conceptById("dragon");

const numerals = ["一", "二", "三", "四", "五"] as const;

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
                  <div
                    key={cut.latin}
                    className="dragon-cut"
                    data-active={stage === index}
                  >
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

      <main id="main" className="dragon-body">
        <section className="dragon-section">
          <Margin index={0} label="The only artist" />
          <div>
            <p className="dragon-name">{artist.name}</p>
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
                <p className="dragon-lede">{artist.paragraph}</p>
                <dl className="dragon-figures">
                  {credentials.map((item) => (
                    <div className="dragon-figure" key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <StringRow caption="The four strings everything is written on — pluck one" />
              </div>

              <figure className="dragon-photo">
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
            <h2 className="dragon-h2">Twenty years of paper before the first commission</h2>
            <ul className="dragon-list">
              {training.map((line, index) => (
                <li key={line}>
                  <span className="dragon-list-mark">{index + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <dl className="dragon-terms">
              {tallies.map((item) => (
                <div className="dragon-term" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
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
                    <li key={item.year}>
                      <span className="dragon-list-mark">{item.year}</span>
                      <span>
                        <strong style={{ fontWeight: 600 }}>{item.title}</strong> — {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <figure className="dragon-photo dragon-photo--tall">
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

        <section className="dragon-section">
          <Margin index={3} label="How it runs" />
          <div>
            <h2 className="dragon-h2">{promise.request}</h2>
            <Stave tempo="Adagio · quarter note = 58" />
            <ol className="dragon-steps" style={{ marginTop: "var(--space-2xl)" }}>
              {steps.map((step, index) => (
                <li className="dragon-step" key={step.index}>
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
          </div>
        </section>

        <section className="dragon-section">
          <Margin index={4} label="The deed" />
          <div>
            <h2 className="dragon-h2">{promise.ownership}</h2>
            <p className="dragon-lede">
              Everything below transfers on signature. Nothing is retained, licensed
              back, or quietly kept.
            </p>
            <dl className="dragon-rights">
              {rights.map((right) => (
                <div className="dragon-right" key={right.term}>
                  <dt>{right.term}</dt>
                  <dd>{right.detail}</dd>
                </div>
              ))}
            </dl>

            <dl className="dragon-terms">
              <div className="dragon-term">
                <dt>From</dt>
                <dd>{commission.from}</dd>
              </div>
              <div className="dragon-term">
                <dt>Availability</dt>
                <dd>{commission.slots}</dd>
              </div>
              <div className="dragon-term">
                <dt>Delivery</dt>
                <dd>{commission.turnaround}</dd>
              </div>
            </dl>

            <a className="dragon-cta" href="#main">
              Write the prompt
            </a>
            <p className="dragon-note">{commission.note}</p>
          </div>
        </section>

        <ConceptSwitch concept={concept} />
      </main>
    </div>
  );
}
