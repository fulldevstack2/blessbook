import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { clients } from "../../content/clients";
import { films } from "../../content/work";
import { pauseAll } from "../../lib/listening";
import { useReady } from "../../lib/useReady";
import { useTypeset } from "../../lib/useTypeset";
import { useSectionProgress } from "../../lib/useSectionProgress";
import { photos } from "../../content/media";
import { enquiry, steps, tiers } from "../../content/commission";
import { useEnquiry } from "../../lib/enquiry";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { createInstrumentScene } from "./instrumentScene";
import { ScrollStage } from "../../lib/ScrollStage";
import { TURNED } from "../../lib/loadModel";
import { conceptById, violin } from "../registry";

/**
 * Dragon's own furniture.
 *
 * Nothing here is used by another concept, and nothing another concept uses is
 * used here. Dragon had been borrowing Phoenix's masked logo wall, its unit
 * field, its dot map and its engraved stave, which made two different design
 * directions read as one template painted twice.
 *
 * Everything below comes from the same object the concept is built on: a hand
 * scroll. It unrolls, it is stamped with seals, and it is written with a brush.
 */

/** The pinned frame that pulls its contents sideways as the page goes down. */
export function Unroll({
  vh = 320,
  className,
  children,
}: {
  vh?: number;
  className?: string;
  children: ReactNode;
}) {
  const frame = useRef<HTMLDivElement>(null);

  /* How far the scroll has to carry the track is the frame's width minus the
     track's, and the frame is not the viewport: on a wide screen it sits in a
     column with margins either side. The travel was written against `100vw`,
     so on desktop it stopped some four hundred pixels short and the last names
     on the scroll could never be reached at all. The frame measures itself. */
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () => {
      element.style.setProperty("--unroll-frame", `${Math.round(element.clientWidth)}px`);
    };
    measure();
    const watcher = new ResizeObserver(measure);
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);

  return (
    <ScrollStage vh={vh} cuts={1} className={`unroll ${className ?? ""}`}>
      {() => (
        <div className="unroll-frame" ref={frame}>
          <div className="unroll-track">{children}</div>
        </div>
      )}
    </ScrollStage>
  );
}

/**
 * Who books him, unrolled: the names written out along the scroll, each closed
 * with a cinnabar seal. No logos — a hand scroll does not carry trademarks, it
 * carries a hand.
 */
export function ClientScroll() {
  return (
    <Unroll className="dragon-clients" vh={300}>
      <div className="dragon-clients-head">
        <span className="dragon-clients-mark" lang="zh">
          请
        </span>
        <span className="dragon-clients-label">Clients</span>
      </div>
      {clients.map((client, index) => (
        <div
          className="dragon-client"
          key={client.slug}
          style={{ "--drop": index % 3 } as CSSProperties}
        >
          <span className="dragon-client-seal" lang="zh" aria-hidden>
            印
          </span>
          <span className="dragon-client-written">
            <span className="dragon-client-name">{client.name}</span>
            <span className="dragon-client-field">{client.field}</span>
          </span>
        </div>
      ))}
    </Unroll>
  );
}

/**
 * One bow stroke, drawn as you arrive.
 *
 * A stroked path with round caps gave a sausage of even width, which is a marker
 * pen and not a brush. A brush has a width profile: it touches down thin, takes
 * the pressure through the middle, and lifts to a dry point. So the mark is a
 * *filled outline* rather than a stroke, with bristle streaks laid over it and a
 * pool of ink where the hair first met the paper.
 *
 * It is revealed by clipping left to right, which is how the hand moved. A dash
 * offset would not work here: there is no stroke left to dash.
 */

/* Top edge out, bottom edge back. The gap between them is the pressure: four
   units at the touch-down, eighteen through the press, nothing at the tip. */
const BOW_MARK =
  "M46 156 C 150 128, 260 108, 470 94 C 640 84, 762 100, 872 82 " +
  "C 764 116, 642 106, 470 118 C 258 132, 150 150, 46 160 Z";

/* Hairs that outran the rest, which is what makes a dry brush dry. The last two
   carry on past the tip, because a lift never ends on a clean edge. */
const BOW_HAIRS = [
  "M64 152 C 168 126, 272 108, 470 98 C 638 90, 758 104, 862 86",
  "M60 157 C 166 132, 270 114, 470 108 C 636 102, 756 112, 850 92",
  "M70 148 C 174 122, 278 104, 472 95 C 640 87, 760 100, 868 84",
  "M836 90 C 856 85, 872 82, 894 78",
  "M840 99 C 860 95, 876 91, 896 87",
];

export function BrushStroke({ caption }: { caption: string }) {
  const root = useRef<HTMLElement>(null);
  // Dragon does not run the parallax pass, so `data-scroll` published nothing
  // here and the stroke sat at zero draw: a black dot and nothing else.
  useSectionProgress(root, { ease: 0.14 });

  return (
    <figure className="brush" ref={root}>
      <svg
        className="brush-mark"
        viewBox="0 0 900 220"
        role="img"
        aria-label="A single brush stroke, laid down left to right."
      >
        <g className="brush-draw">
          {/* The ink that soaked outward before it dried. */}
          <path className="brush-bleed" d={BOW_MARK} />
          <path className="brush-body" d={BOW_MARK} />
          {BOW_HAIRS.map((hair, index) => (
            <path
              className="brush-hair"
              key={hair}
              d={hair}
              style={{ "--i": index } as CSSProperties}
            />
          ))}
        </g>
      </svg>
      <figcaption className="brush-caption">{caption}</figcaption>
    </figure>
  );
}

export function FilmScrolls({ caption }: { caption: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const numerals = ["一", "二", "三", "四"];

  return (
    <div className="scrolls">
      <p className="scrolls-caption">{caption}</p>
      <div className="scrolls-row">
        {films.map((film, index) => (
          <figure className="scroll" key={film.id} data-open={open === film.id} data-reveal="wipe">
            <span className="scroll-rod" aria-hidden />
            <div className="scroll-frame">
              {open === film.id ? (
                <iframe
                  className="scroll-media"
                  src={`https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0`}
                  title={film.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="scroll-open"
                  onClick={() => {
                    pauseAll();
                    setOpen(film.id);
                  }}
                  aria-label={`Play ${film.title}`}
                >
                  <img src={film.poster} alt="" width={1280} height={720} loading="lazy" />
                  <span className="scroll-numeral" lang="zh" aria-hidden>
                    {numerals[index]}
                  </span>
                </button>
              )}
            </div>
            <figcaption className="scroll-caption">
              <span className="scroll-title">{film.title}</span>
              <span className="scroll-note">{film.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}


/**
 * A drop of ink, spreading while the page loads, and a brush stroke that wipes
 * it away when the page is ready. Paper first, then the hand, then the work —
 * which is the order this concept does everything in.
 */
export function Loader() {
  const ready = useReady(photos.silhouette.src);
  const typeset = useTypeset(["400 96px \"Ma Shan Zheng\"", "400 40px Faustina"]);

  return (
    <div className="sheet" data-ready={ready} data-typeset={typeset} aria-hidden={ready}>
      {/* Paper, and his name written on it. The ink and the silhouette are what
          the hero is; putting them here spent the page's first surprise before
          the reader had scrolled a pixel. */}
      <div className="sheet-block">
        <p className="sheet-name" lang="zh">
          {["刘", "凯", "彦"].map((glyph, index) => (
            <span key={glyph} style={{ "--i": index } as CSSProperties}>
              {glyph}
            </span>
          ))}
        </p>
        <span className="sheet-seal" lang="zh" aria-hidden>
          樂
        </span>
      </div>
      <p className="sheet-mark">
        {["一", "二", "三"][Number(conceptById("dragon").ordinal) - 1]} · Dragon · Ink and jade
      </p>
    </div>
  );
}

/**
 * A hundred and sixty-eight thousand people, counted the way they are counted.
 *
 * This was a photograph of the hall — a dark, soft frame in which you could not
 * actually see a single person, captioned with a number you had to take on
 * trust. So the number is drawn instead, in the mark every Chinese-speaking
 * child learns to count with: 正, five strokes, one per person tallied. Here one
 * mark is a thousand, and there are a hundred and sixty-eight of them.
 *
 * They are brushed on in sequence as the section passes, so the count happens in
 * front of you rather than arriving finished.
 */
export function Marks() {
  const root = useRef<HTMLElement>(null);
  const marks = Array.from({ length: 168 }, (_, index) => index);
  // Dragon does not run the parallax pass — it has no framed photography to
  // drift — so this section measures its own passage.
  useSectionProgress(root, { ease: 0.14 });

  return (
    <section className="marks" ref={root}>
      <p className="marks-head" data-reveal>
        <span className="marks-figure">168,000</span>
        <span className="marks-unit">people, so far</span>
      </p>

      <div className="marks-field" aria-hidden>
        {marks.map((index) => (
          <span
            className="marks-mark"
            key={index}
            lang="zh"
            style={{ "--i": index, "--of": marks.length } as CSSProperties}
          >
            正
          </span>
        ))}
      </div>

      <p className="marks-key" data-reveal>
        <span lang="zh">每字千人</span>
        <span>Each mark stands for a thousand people, counted from ticketed attendance since 2006.</span>
      </p>
    </section>
  );
}

/**
 * A figure, brushed.
 *
 * Same argument as Phoenix's struck numerals: counting up from zero is a plugin
 * default, not a design. Here each glyph is laid down top to bottom in sequence,
 * the way a hand writes one, which is the same gesture as the name on the
 * arrival sheet and the 正 marks in the count.
 */
export function Figure({ value }: { value: string }) {
  return (
    <span className="brushfig" data-reveal aria-label={value}>
      {[...value].map((glyph, index) => (
        <span key={`${glyph}-${index}`} style={{ "--i": index } as CSSProperties} aria-hidden>
          {glyph}
        </span>
      ))}
    </span>
  );
}

/**
 * The commission request, written on a sheet.
 *
 * Nothing is bought on this site. A client writes a paragraph and Dennis's team
 * writes back, and the sample, the payment details and the finished song all
 * travel in that one thread. So the form is a sheet of paper with ruled lines
 * rather than a checkout: you write on the rules, and a seal is pressed when it
 * goes. Nothing is delivered here; see `lib/enquiry.ts`.
 */
export function Enquiry() {
  const { enquiry: form, stage, problems, set, submit, again } = useEnquiry();
  const sent = stage === "sent";

  return (
    <div className="sheetform" data-sent={sent} data-reveal>
      <p className="sheetform-eyebrow">{enquiry.eyebrow}</p>
      <h3 className="sheetform-head">{enquiry.headline}</h3>
      <p className="sheetform-lede">{enquiry.lede}</p>

      {sent ? (
        <div className="sheetform-sent" role="status">
          <span className="sheetform-seal" lang="zh" aria-hidden>
            收
          </span>
          <div>
            <p className="sheetform-sent-head">{enquiry.sentHead}</p>
            <p className="sheetform-sent-body">{enquiry.sentBody}</p>
            <button type="button" className="sheetform-again" onClick={again}>
              {enquiry.again}
            </button>
          </div>
        </div>
      ) : (
        <form
          className="sheetform-body"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          noValidate
        >
          <label className="sheetform-line">
            <span className="sheetform-label">{enquiry.fields.name}</span>
            <input
              type="text"
              value={form.name}
              autoComplete="name"
              onChange={(event) => set("name", event.target.value)}
            />
            {problems.name ? <span className="sheetform-problem">{problems.name}</span> : null}
          </label>

          <label className="sheetform-line">
            <span className="sheetform-label">{enquiry.fields.email}</span>
            <input
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(event) => set("email", event.target.value)}
            />
            {problems.email ? <span className="sheetform-problem">{problems.email}</span> : null}
          </label>

          <fieldset className="sheetform-choice">
            <legend className="sheetform-label">{enquiry.fields.tier}</legend>
            {[...tiers, { id: "unsure", name: enquiry.undecided, price: "" }].map((tier) => (
              <label className="sheetform-chip" key={tier.id} data-chosen={form.tier === tier.id}>
                <input
                  type="radio"
                  name="tier"
                  value={tier.id}
                  checked={form.tier === tier.id}
                  onChange={() => set("tier", tier.id)}
                />
                <span>{tier.name}</span>
                {tier.price ? <span className="sheetform-chip-price">{tier.price}</span> : null}
              </label>
            ))}
          </fieldset>

          <label className="sheetform-line sheetform-line--wide">
            <span className="sheetform-label">{enquiry.fields.prompt}</span>
            <textarea
              rows={5}
              value={form.prompt}
              placeholder={enquiry.placeholder}
              onChange={(event) => set("prompt", event.target.value)}
            />
            {problems.prompt ? <span className="sheetform-problem">{problems.prompt}</span> : null}
          </label>

          <button type="submit" className="sheetform-send" disabled={stage === "sending"}>
            {stage === "sending" ? enquiry.sending : enquiry.send}
          </button>
        </form>
      )}
    </div>
  );
}

/** 工序: the order of the work, one character at a time. */
const PROCESS_MARKS = ["一", "二", "三", "四"];

/**
 * How a commission goes, brushed one character at a time.
 *
 * It was a numbered list, which is what every service page uses. These four are
 * a sequence in time, so the frame pins and each numeral is laid down at the
 * size of a signboard while its sentence is read beside it, the same stroke the
 * arrival sheet and the count use.
 */
export function Process() {
  return (
    <ScrollStage vh={100 * (steps.length + 1)} cuts={steps.length} className="order">
      {({ stage }) => (
        <>
          <div className="order-mark" aria-hidden>
            {steps.map((step, index) => (
              <span key={step.index} lang="zh" data-active={index === stage}>
                {PROCESS_MARKS[index]}
              </span>
            ))}
          </div>

          <ol className="order-list">
            {steps.map((step, index) => (
              <li className="order-step" key={step.index} data-active={index === stage}>
                <h3 className="order-title">{step.title}</h3>
                <span className="order-marking">{step.marking}</span>
                <p className="order-body">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="order-rule" aria-hidden>
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
 * The instruments, drawn.
 *
 * Phoenix turns them in gold. This concept has no metal in it, so the same
 * geometry arrives as ink: contour where the form turns away, a stepped wash
 * across the faces, bare paper where the light lands. All three come through in
 * the order they were built, each wiped back to bare paper before the next is
 * drawn in its place. Shading in `instrumentScene.ts`; the sheet they are
 * mounted on is here.
 *
 * `cuts` is the length of the sequence, so the cut index `ScrollStage` publishes
 * is the one the scene is drawing, and the plate names what is on the sheet.
 */
export function Instrument() {
  return (
    <ScrollStage vh={480} cuts={TURNED.length} className="drawn">
      {({ stage, progress }) => {
        const shown = violin(TURNED[stage]);
        return (
          <>
            <SceneCanvas
              factory={createInstrumentScene}
              progress={progress}
              className="drawn-stage"
              label={`${shown.name}, one of Dennis Lau's three violins, turning slowly and drawn in ink. ${shown.material}.`}
            />

            <div className="drawn-margin">
              <span className="drawn-mark" lang="zh" aria-hidden>
                器
              </span>
              <span className="drawn-label">The object itself</span>
            </div>

            <div className="drawn-plate">
              <h2 className="drawn-name">{shown.name}</h2>
              <dl className="drawn-spec">
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
            </div>
          </>
        );
      }}
    </ScrollStage>
  );
}
