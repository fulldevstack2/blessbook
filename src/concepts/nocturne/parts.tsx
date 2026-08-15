import { clients } from "../../content/clients";
import { films } from "../../content/work";
import { record } from "../../content/dennis";
import { useState } from "react";
import { useReady } from "../../lib/useReady";
import { useTypeset } from "../../lib/useTypeset";
import { photos } from "../../content/media";
import { enquiry, steps, tiers } from "../../content/commission";
import { useEnquiry } from "../../lib/enquiry";
import { violins } from "../../content/dennis";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { createInstrumentScene } from "./instrumentScene";
import { ScrollStage } from "../../lib/ScrollStage";
import { conceptById } from "../registry";

/**
 * Nocturne's own furniture.
 *
 * The three concepts had drifted into being one template in three palettes:
 * the same masked logo wall, the same unit field, the same engraved stave,
 * recoloured. Presentation belongs to the concept, so these live here and are
 * used nowhere else. What stays shared is machinery the reader never sees — the
 * audio bus, the scroll hooks, the frame scrubber.
 *
 * Everything here is drawn from one idea: a printed programme for tonight.
 */

/** The client list as a cast page: names set, not logos pasted. */
export function Cast() {
  return (
    <div className="cast">
      <p className="cast-head">
        <em>with</em> THE COMPLIMENTS <em>of</em>
      </p>
      <ul className="cast-list">
        {clients.map((client) => (
          <li className="cast-item" key={client.slug}>
            <span className="cast-name">{client.name}</span>
            <span className="cast-leader" aria-hidden />
            <span className="cast-field">{client.field}</span>
          </li>
        ))}
      </ul>
      <p className="cast-foot">
        Each of the fourteen booked him for a room of their own. They appear here as credit for work done, nothing more.
      </p>
    </div>
  );
}

/** The record as a house board: figures with dotted leaders, as a box office posts them. */
export function BoxOffice() {
  return (
    <div className="board">
      <p className="board-head">
        THE HOUSE <em>to</em> DATE
      </p>
      <dl className="board-list">
        {record.map((item) => (
          <div className="board-row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              <span className="board-leader" aria-hidden />
              <span className="board-figure">
                <Figure value={item.value} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The films as tonight's programme: one on the bill, the rest listed beneath it
 * with their running times. Nothing loads from YouTube until a title is pressed.
 */
export function Programme() {
  const [opened, setOpened] = useState<string | null>(null);
  const [featured, setFeatured] = useState(0);
  const film = films[featured];
  if (!film) throw new Error("the programme needs at least one film");

  return (
    <div className="programme">
      <div className="programme-bill">
        {opened === film.id ? (
          <iframe
            className="programme-frame"
            src={`https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0`}
            title={film.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="programme-open"
            onClick={() => setOpened(film.id)}
            aria-label={`Play ${film.title}`}
          >
            <img src={film.poster} alt="" width={1280} height={720} loading="lazy" />
            <span className="programme-open-word">
              <em>play</em> TONIGHT&rsquo;S FILM
            </span>
          </button>
        )}
      </div>

      <ol className="programme-list">
        {films.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className="programme-item"
              data-current={index === featured}
              onClick={() => {
                setFeatured(index);
                setOpened(null);
              }}
            >
              <span className="programme-index">{["I", "II", "III", "IV"][index]}</span>
              <span className="programme-title">{item.title}</span>
              <span className="programme-note">{item.note}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A printed rule between the halves of the evening. */
export function Interval({ label = "Interval" }: { label?: string }) {
  return (
    <div className="interval" aria-hidden>
      <span className="interval-rule" />
      <span className="interval-word">{label}</span>
      <span className="interval-rule" />
    </div>
  );
}


/**
 * The arrival: his name, set, and nothing else.
 *
 * A curtain was wrong because the hero already opens one. A lit stage was wrong
 * because it was a second piece of scenery arguing with the first. What is left
 * is the thing the whole page is about — the name, on black, with a rule drawn
 * under it — which is also what the best title pages have always done.
 */
export function Loader() {
  const ready = useReady(photos.press.src);
  const typeset = useTypeset(["300 88px Fraunces"]);

  return (
    <div className="house" data-ready={ready} data-typeset={typeset} aria-hidden={ready}>
      <p className="house-name">
        <em>the</em>
        <span>Dennis Lau</span>
      </p>
      <span className="house-rule" aria-hidden />
      <p className="house-mark">
        {conceptById("nocturne").ordinal} · Nocturne · Velvet and lamplight
      </p>
    </div>
  );
}

/**
 * A figure, slotted.
 *
 * A box office board is set, not counted: the number rises into its slot from
 * behind the rule above it. Counting up from zero is what a plugin does, and it
 * would be the third concept in a row doing the same thing besides.
 */
export function Figure({ value }: { value: string }) {
  return (
    <span className="slotfig" data-reveal="slot">
      <span className="slotfig-rule" aria-hidden />
      <span className="slotfig-value">{value}</span>
    </span>
  );
}

/**
 * The commission request, as a card left at the desk.
 *
 * Nothing is bought on this site: a client writes a paragraph, Dennis's team
 * writes back, and the sample, the payment details and the finished song all
 * travel in that one thread. So the form is an order card, brass-ruled, the way
 * a box office takes a booking. Nothing is delivered here; see `lib/enquiry.ts`.
 */
export function Enquiry() {
  const { enquiry: form, stage, problems, set, submit, again } = useEnquiry();
  const sent = stage === "sent";

  return (
    <div className="card" data-sent={sent} data-reveal>
      <p className="card-eyebrow">{enquiry.eyebrow}</p>
      <h3 className="card-head">
        <em>write</em> THE PROMPT
      </h3>
      <p className="card-lede">{enquiry.lede}</p>

      {sent ? (
        <div className="card-sent" role="status">
          <p className="card-stamp" aria-hidden>
            Received
          </p>
          <p className="card-sent-head">{enquiry.sentHead}</p>
          <p className="card-sent-body">{enquiry.sentBody}</p>
          <button type="button" className="card-again" onClick={again}>
            {enquiry.again}
          </button>
        </div>
      ) : (
        <form
          className="card-body"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          noValidate
        >
          <label className="card-field">
            <span className="card-label">{enquiry.fields.name}</span>
            <input
              type="text"
              value={form.name}
              autoComplete="name"
              onChange={(event) => set("name", event.target.value)}
            />
            {problems.name ? <span className="card-problem">{problems.name}</span> : null}
          </label>

          <label className="card-field">
            <span className="card-label">{enquiry.fields.email}</span>
            <input
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(event) => set("email", event.target.value)}
            />
            {problems.email ? <span className="card-problem">{problems.email}</span> : null}
          </label>

          <fieldset className="card-choice">
            <legend className="card-label">{enquiry.fields.tier}</legend>
            {[...tiers, { id: "unsure", name: enquiry.undecided, price: "" }].map((tier) => (
              <label className="card-option" key={tier.id} data-chosen={form.tier === tier.id}>
                <input
                  type="radio"
                  name="tier"
                  value={tier.id}
                  checked={form.tier === tier.id}
                  onChange={() => set("tier", tier.id)}
                />
                <span className="card-option-name">{tier.name}</span>
                <span className="card-option-leader" aria-hidden />
                {tier.price ? <span className="card-option-price">{tier.price}</span> : null}
              </label>
            ))}
          </fieldset>

          <label className="card-field card-field--wide">
            <span className="card-label">{enquiry.fields.prompt}</span>
            <textarea
              rows={5}
              value={form.prompt}
              placeholder={enquiry.placeholder}
              onChange={(event) => set("prompt", event.target.value)}
            />
            {problems.prompt ? <span className="card-problem">{problems.prompt}</span> : null}
          </label>

          <button type="submit" className="card-send" disabled={stage === "sending"}>
            {stage === "sending" ? enquiry.sending : enquiry.send}
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * How a commission goes, set as tonight's running order.
 *
 * It was a numbered list. A house does not number its evening, it posts it: the
 * four lines stand together on a board and the lamp moves down them, so you can
 * see what has happened and what is still to come at the same time.
 */
export function Process() {
  return (
    <ScrollStage vh={100 * (steps.length + 1)} cuts={steps.length} className="running">
      {({ stage }) => (
        <>
          <p className="running-head">
            <em>the</em> ORDER <em>of the</em> EVENING
          </p>

          <ol className="running-list">
            {steps.map((step, index) => (
              <li className="running-step" key={step.index} data-active={index === stage} data-past={index < stage}>
                <span className="running-index">{step.index}</span>
                <span className="running-title">{step.title}</span>
                <span className="running-leader" aria-hidden />
                <span className="running-marking">{step.marking}</span>
                <p className="running-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </ScrollStage>
  );
}

/* The model on the page is the Phoenix, whatever this concept is named
   after, so its particulars are the Phoenix's. */
const shown = violins.find((v) => v.id === "phoenix")!;

/**
 * The instrument, on its stand under the lamp.
 *
 * Set as a plate on the evening's programme: the object in the arch, one brass
 * lamp on it, and its particulars listed beneath with the leaders this concept
 * rules everything with. Lighting in `instrumentScene.ts`.
 */
export function Instrument() {
  return (
    <ScrollStage vh={320} cuts={1} className="stand">
      {({ progress }) => (
        <>
          <SceneCanvas
            factory={createInstrumentScene}
            progress={progress}
            className="stand-stage"
            label={`The ${shown.name} violin turning under a brass lamp: a six-string electric violin carved as a bird's wing and plated in 24K gold.`}
          />

          <div className="stand-card">
            <p className="stand-eyebrow">
              <em>the</em> INSTRUMENT
            </p>
            <h2 className="stand-name">{shown.name}</h2>
            <dl className="stand-spec">
              <div>
                <dt>Built</dt>
                <span className="stand-leader" aria-hidden />
                <dd>{shown.year}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <span className="stand-leader" aria-hidden />
                <dd>{shown.material}</dd>
              </div>
              <div>
                <dt>Maker</dt>
                <span className="stand-leader" aria-hidden />
                <dd>Alistair Hay, Emerald Guitars</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </ScrollStage>
  );
}
