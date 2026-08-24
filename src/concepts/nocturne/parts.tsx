import { clients } from "../../content/clients";
import { films } from "../../content/work";
import { record } from "../../content/dennis";
import { useState } from "react";
import { useReady } from "../../lib/useReady";
import { useTypeset } from "../../lib/useTypeset";
import { photos } from "../../content/media";
import { Brief } from "../../components/Brief";
import { Works } from "../../components/Works";
import { commission, enquiry, steps } from "../../content/commission";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { createInstrumentScene } from "./instrumentScene";
import { ScrollStage } from "../../lib/ScrollStage";
import { TURNED } from "../../lib/loadModel";
import { conceptById, violin } from "../registry";

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

      <Works head="Also written and produced" />
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
 * Nothing is bought on this site: someone fills in Dennis's brief, his team
 * reads it and writes back, and the sample, the payment details and the finished
 * song all travel in that one thread. So it is an order card, brass-ruled, the
 * way a box office takes a booking.
 *
 * The card is Nocturne's; the twenty questions on it are machinery shared with
 * the other two concepts. Nothing is delivered here; see `lib/enquiry.ts`.
 */
export function Enquiry() {
  return (
    <div className="card" id="brief" data-reveal>
      <p className="card-eyebrow">{enquiry.eyebrow}</p>
      <h3 className="card-head"><em>the</em> CREATIVE BRIEF</h3>
      <p className="card-lede">{enquiry.lede}</p>
      <Brief />
    </div>
  );
}

/**
 * How a commission goes, set as tonight's programme.
 *
 * This was a lighting rig: a bar down the left margin, four fittings on it, and
 * a drawn lantern that slid between them throwing a beam across whichever step
 * you had reached. Every part of that was working as built and the whole was
 * still cheap, for a reason worth writing down. Spotlighting one row at a time
 * makes the reader wait for information they came to get — how a commission
 * actually goes is four short paragraphs, and four short paragraphs should be
 * readable in one look. And a hall does not point a lamp at its own programme.
 * It hands you one.
 *
 * So this is the programme: a card of cream stock lying on the velvet, ruled in
 * brass the way a printer rules a title page, with the four steps set as
 * movements — numeral in the margin, the marking out at the right, leaders
 * carrying the eye across. Nothing moves except the card arriving. Restraint is
 * the whole effect: the expensive thing in a concert hall is never the lighting,
 * it is the paper.
 */
export function Process() {
  return (
    <div className="bill" data-scroll>
      <div className="bill-frame">
        <div className="bill-head">
          <p className="bill-house">
            Blesspoke <span aria-hidden>·</span> Kuala Lumpur
          </p>
          <h3 className="bill-title">
            <em>the</em> ORDER <em>of the</em> EVENING
          </h3>
          <p className="bill-ornament" aria-hidden>
            <span className="bill-ornament-rule" />
            <span className="bill-lozenge" />
            <span className="bill-ornament-rule" />
          </p>
        </div>

        <ol className="bill-list">
          {steps.map((step) => (
            <li className="bill-movement" key={step.index} data-reveal>
              <span className="bill-numeral" aria-hidden>
                {step.index}
              </span>
              <h4 className="bill-name">{step.title}</h4>
              <span className="bill-leader" aria-hidden />
              <span className="bill-marking">{step.marking}</span>
              <p className="bill-body">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Spelled, not set as a digit: a lone numeral in a line of letterspaced
            small caps is the one thing on this card that would look typed. */}
        <p className="bill-foot">
          {["", "One", "Two", "Three", "Four", "Five", "Six"][steps.length] ?? steps.length}{" "}
          movements <span aria-hidden>·</span> {commission.turnaround}
        </p>
      </div>
    </div>
  );
}

/**
 * The instruments, each on its stand under the lamp.
 *
 * Set as a plate on the evening's programme: the object in the arch, one brass
 * lamp on it, and its particulars listed beneath with the leaders this concept
 * rules everything with. All three come through, in the order they were built —
 * the lamp goes out between them, which is how a stand is changed in a house
 * that has not opened yet. Lighting in `instrumentScene.ts`.
 *
 * `cuts` is the length of the sequence, so the cut index `ScrollStage` publishes
 * is the one the scene is drawing, and the card names whichever instrument is
 * under the lamp.
 */
export function Instrument() {
  return (
    <ScrollStage vh={480} cuts={TURNED.length} className="stand">
      {({ stage, progress }) => {
        const shown = violin(TURNED[stage]);
        return (
          <>
            <SceneCanvas
              factory={createInstrumentScene}
              progress={progress}
              className="stand-stage"
              label={`${shown.name}, one of Dennis Lau's three violins, turning under a brass lamp. ${shown.material}.`}
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
        );
      }}
    </ScrollStage>
  );
}
