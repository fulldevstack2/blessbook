import { useEffect, useRef, type CSSProperties } from "react";
import { ScrollStage } from "../../lib/ScrollStage";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { createBandScene } from "./bandScene";
import { createInstrumentScene } from "./instrumentScene";
import { clients, clientWall } from "../../content/clients";
import { useReady } from "../../lib/useReady";
import { useTypeset } from "../../lib/useTypeset";
import { photos } from "../../content/media";
import { artist, record, territories, violins } from "../../content/dennis";
import { enquiry, steps, tiers } from "../../content/commission";
import { useEnquiry } from "../../lib/enquiry";
import type { Photo } from "../../content/media";
import { conceptById } from "../registry";

/**
 * Phoenix's own furniture.
 *
 * Every presentational piece on this concept now lives here and is used by no
 * other. What the three concepts still share is machinery the reader never sees:
 * the audio bus, the scroll hooks, the frame scrubber, the grain. Anything with a
 * shape of its own belongs to one concept.
 *
 * The shape here is gilding: a hairline of gold, struck numerals, engraved
 * plaques. Nothing is drawn as a dot or a chart, because this concept does not
 * measure — it strikes.
 */

/**
 * The record as gilded gauges: a hairline that fills with gold, and the figure
 * struck at the end of it. Replaces the dot field, which belonged to nobody.
 */
export function Gauges() {
  return (
    <div className="gauges">
      {record.map((item, index) => (
        <div
          className="gauge"
          key={item.label}
          data-scroll
          style={{ "--i": index } as CSSProperties}
        >
          <span className="gauge-label">{item.label}</span>
          <span className="gauge-rule" aria-hidden>
            <span className="gauge-fill" />
          </span>
          <span className="gauge-figure">
            <Figure value={item.value} />
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Where he has played, struck as a gilded index rather than plotted. A map is a
 * diagram; this concept sets its facts the way a plaque sets them.
 */
export function Index() {
  return (
    <div className="index">
      <p className="index-head">Five continents</p>
      <ol className="index-list">
        {territories.map((territory, index) => (
          <li key={territory.name} data-reveal style={{ "--reveal-i": index % 6 } as CSSProperties}>
            <span className="index-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="index-name">{territory.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Who books him, engraved into a bar of gold.
 *
 * A logo grid and then a wall of display type were both tried here, and both
 * were the same mistake in different clothes: a list, laid out. This is an
 * object. The bar is pinned while you scroll and the names roll over its crown
 * one at a time, cut into the metal with a bevel that takes the light. The
 * shading is in `bandScene.ts`; what lives here is the copy around it.
 */
export function Band() {
  return (
    <ScrollStage vh={360} cuts={1} className="ingot">
      {({ progress }) => (
        <>
          <div className="ingot-head">
            <p className="ingot-eyebrow">{clientWall.eyebrow}</p>
            <h2 className="ingot-lede">{clientWall.lede}</h2>
          </div>

          <SceneCanvas
            factory={createBandScene}
            progress={progress}
            className="ingot-bar"
            label={`A bar of gold with fourteen names engraved into it: ${clients
              .map((client) => client.name)
              .join(", ")}.`}
          />

          <p className="ingot-foot">
            Each of the fourteen booked him for a room of their own. They appear here as credit for work done, nothing more.
          </p>
        </>
      )}
    </ScrollStage>
  );
}

/**
 * A tempo marking, which is real musical typography, over a struck rule.
 *
 * What stood here was a drawn staff with invented noteheads on it. Nobody who
 * reads music would have believed it, and everybody else could tell it was
 * ornament. A marking is what an engraver actually writes in words.
 */
export function Marking({ text }: { text: string }) {
  return (
    <div className="marking" data-reveal aria-hidden>
      <span className="marking-rule" />
      <span className="marking-word">{text}</span>
      <span className="marking-rule" />
    </div>
  );
}

/**
 * A plumb line down the margin with a gilded bead riding it, so you always know
 * how far through the piece you are. The margin used to hold a five-line staff,
 * which was the same pretence as the score: this is a hairline and a bead.
 */
export function Plumb() {
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = line.current;
    if (!element) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      const progress = travel > 0 ? window.scrollY / travel : 0;
      element.style.setProperty("--page", Math.min(1, Math.max(0, progress)).toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="plumb" ref={line} aria-hidden>
      <span className="plumb-line" />
      <span className="plumb-fill" />
      {/* An open notehead threaded on the line.

          A filled head with a drawn stem read as clip art: at fourteen pixels a
          solid shape is a blob, and a stem sticking off a vertical rail is a
          flagpole. This is the engraver's answer instead. The head is an open
          ellipse cut on the slant a nib makes, hairline like everything else
          gold on this concept, and the rail passes behind it as its stem, which
          is exactly how a note sits on a staff. */}
      <svg className="plumb-note" viewBox="0 0 20 20" focusable="false">
        <ellipse cx="10" cy="10" rx="6.7" ry="4.4" transform="rotate(-20 10 10)" />
      </svg>
    </div>
  );
}

/** His name struck across the page in gold, once, at the size of a hall sign. */
export function Struck() {
  return (
    <div className="struck" data-scroll aria-hidden>
      <span className="struck-name">{artist.name}</span>
      <span className="struck-cn" lang="zh">
        {artist.chineseName}
      </span>
    </div>
  );
}

/** A gilded photographic plate, full bleed, between movements. */
export function Plate({ photo, line, tall = false }: { photo: Photo; line?: string; tall?: boolean }) {
  return (
    <figure className="gplate" data-tall={tall}>
      <div className="gplate-frame" data-parallax data-reveal="wipe">
        <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" />
      </div>
      <figcaption className="gplate-caption">
        {line ? <span className="gplate-line">{line}</span> : null}
        <span className="phoenix-credit">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}


/**
 * The curtain this concept raises: a black room, his name, and nothing else.
 *
 * It holds while the fonts and the hero photograph load, then opens sideways and
 * the page is behind it. Nothing spins, nothing is drawn on top.
 */
export function Loader() {
  const ready = useReady(photos.press.src);
  const typeset = useTypeset(["400 64px Italiana"]);

  return (
    <div className="veil" data-ready={ready} data-typeset={typeset} aria-hidden={ready}>
      <div className="veil-half veil-half--left" />
      <div className="veil-half veil-half--right" />
      <p className="veil-name">
        Dennis Lau
        <span className="veil-cn" lang="zh">
          刘凯彦
        </span>
      </p>
      <p className="veil-mark">{conceptById("phoenix").ordinal} · Phoenix · Gilded</p>
    </div>
  );
}

/**
 * A figure, struck.
 *
 * The site used to count these up from zero. Counting is the single most
 * over-used number animation on the web and it belongs to a plugin, not to a
 * concept: it says "look, a statistic" rather than saying anything about the
 * object the page is made of. This one is stamped instead. The numeral arrives
 * high, hits, squashes for a frame, flares gold at the moment of contact and
 * settles. It is a die on a plate, which is what everything else here is.
 */
export function Figure({ value }: { value: string }) {
  return (
    <span className="struckfig" data-reveal="strike">
      {value}
    </span>
  );
}

/**
 * The commission request, as a plate to be engraved.
 *
 * Nothing on this site is bought. A client writes a paragraph, and Dennis's team
 * writes back; the sample, the payment details and the finished song all travel
 * in that one email thread. So the form is not a checkout, it is a request laid
 * out the way a commission plate would be: rules rather than boxes, small caps
 * for the labels, and one struck line when it is sent.
 *
 * Nothing is delivered here. See `lib/enquiry.ts`.
 */
export function Enquiry() {
  const { enquiry: form, stage, problems, set, submit, again } = useEnquiry();
  const sent = stage === "sent";

  return (
    <div className="plate" data-sent={sent} data-reveal>
      <p className="plate-eyebrow">{enquiry.eyebrow}</p>
      <h3 className="plate-head">{enquiry.headline}</h3>
      <p className="plate-lede">{enquiry.lede}</p>

      {sent ? (
        <div className="plate-sent" role="status">
          <p className="plate-sent-head">{enquiry.sentHead}</p>
          <p className="plate-sent-body">{enquiry.sentBody}</p>
          <button type="button" className="plate-again" onClick={again}>
            {enquiry.again}
          </button>
        </div>
      ) : (
        <form
          className="plate-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          noValidate
        >
          <label className="plate-field">
            <span className="plate-label">{enquiry.fields.name}</span>
            <input
              type="text"
              value={form.name}
              autoComplete="name"
              onChange={(event) => set("name", event.target.value)}
            />
            {problems.name ? <span className="plate-problem">{problems.name}</span> : null}
          </label>

          <label className="plate-field">
            <span className="plate-label">{enquiry.fields.email}</span>
            <input
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(event) => set("email", event.target.value)}
            />
            {problems.email ? <span className="plate-problem">{problems.email}</span> : null}
          </label>

          <fieldset className="plate-tiers">
            <legend className="plate-label">{enquiry.fields.tier}</legend>
            {[...tiers, { id: "unsure", name: enquiry.undecided, price: "" }].map((tier) => (
              <label className="plate-tier" key={tier.id} data-chosen={form.tier === tier.id}>
                <input
                  type="radio"
                  name="tier"
                  value={tier.id}
                  checked={form.tier === tier.id}
                  onChange={() => set("tier", tier.id)}
                />
                <span className="plate-tier-name">{tier.name}</span>
                {tier.price ? <span className="plate-tier-price">{tier.price}</span> : null}
              </label>
            ))}
          </fieldset>

          <label className="plate-field plate-field--wide">
            <span className="plate-label">{enquiry.fields.prompt}</span>
            <textarea
              rows={5}
              value={form.prompt}
              placeholder={enquiry.placeholder}
              onChange={(event) => set("prompt", event.target.value)}
            />
            {problems.prompt ? <span className="plate-problem">{problems.prompt}</span> : null}
          </label>

          <button type="submit" className="plate-send" disabled={stage === "sending"}>
            {stage === "sending" ? enquiry.sending : enquiry.send}
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * How a commission goes, struck one plate at a time.
 *
 * This was a numbered list, and a numbered list is what every service page on
 * the internet uses to describe itself. The four steps are a sequence in time,
 * so they are given time: the frame pins, the numeral behind each step is the
 * size of a hall sign, and a seam of gold sweeps the frame as one hands over to
 * the next. Same four sentences, read at the pace they describe.
 */
export function Process() {
  return (
    <ScrollStage vh={100 * (steps.length + 1)} cuts={steps.length} className="works">
      {({ stage }) => (
        <>
          <div className="works-numeral" aria-hidden>
            {steps.map((step, index) => (
              <span key={step.index} data-active={index === stage}>
                {step.index}
              </span>
            ))}
          </div>

          <ol className="works-list">
            {steps.map((step, index) => (
              <li className="works-step" key={step.index} data-active={index === stage}>
                <h3 className="works-title">
                  {step.title}
                  <span className="works-marking">{step.marking}</span>
                </h3>
                <p className="works-body">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="works-ticks" aria-hidden>
            {steps.map((step, index) => (
              <span key={step.index} data-done={index <= stage} />
            ))}
          </div>
        </>
      )}
    </ScrollStage>
  );
}

/**
 * The instrument, turned.
 *
 * Six movements describe this object before you ever see it as one, and a
 * photograph of a thing is not the thing. It is pinned here and the scroll turns
 * it: in at an angle, most of the way round while the facts beside it are read,
 * and settled. The gold is in `instrumentScene.ts`.
 */
/* The model on the page is the Phoenix. Sourced from the violins list so all
   three concepts read the same particulars off the same record. */
const shown = violins.find((v) => v.id === "phoenix")!;

export function Instrument() {
  return (
    <ScrollStage vh={320} cuts={1} className="turned">
      {({ progress }) => (
        <>
          <SceneCanvas
            factory={createInstrumentScene}
            progress={progress}
            className="turned-stage"
            label={`The ${shown.name} violin turning slowly: a six-string electric violin carved as a bird's wing and plated in 24K gold.`}
          />

          <div className="turned-plate">
            <p className="turned-eyebrow">The object itself</p>
            <h2 className="turned-name">{shown.name}</h2>
            <dl className="turned-spec">
              <div>
                <dt>Built</dt>
                <dd>{shown.year}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{shown.material}</dd>
              </div>
              <div>
                <dt>Maker</dt>
                <dd>Alistair Hay, Emerald Guitars</dd>
              </div>
            </dl>
            <p className="turned-note">{shown.note}</p>
          </div>
        </>
      )}
    </ScrollStage>
  );
}
