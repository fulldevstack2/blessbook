import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { clients } from "../../content/clients";
import { audience } from "../../content/dennis";
import { films } from "../../content/work";
import { useReady } from "../../lib/useReady";
import { useTypeset } from "../../lib/useTypeset";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";
import { useSectionProgress } from "../../lib/useSectionProgress";
import { photos, type Photo } from "../../content/media";
import { Brief } from "../../components/Brief";
import { Lightbox, useLightbox } from "../../components/Lightbox";
import { Works } from "../../components/Works";
import { enquiry, steps } from "../../content/commission";
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
 *
 * Dragon is treated as its own site once you are inside it: no way back to the
 * design chooser, no links to the other two directions.
 */

const site = conceptById("dragon");

/**
 * The site bar. Brand on the left; the other room on the right.
 *
 * A cinnabar seam and the destination in display type — ink on paper, not a
 * chip of UI. On the work page the passage waits until the hero wash has left.
 * Over ink-dark ground the marks flip to paper so they stay readable.
 */
export function SiteChrome() {
  const onStory = useLocation().pathname === site.story;
  const [passageShown, setPassageShown] = useState(onStory);
  const [ground, setGround] = useState<"paper" | "ink">("paper");

  useEffect(() => {
    if (onStory) {
      setPassageShown(true);
      return;
    }

    const hero = document.querySelector(".dragon-stage");
    if (!hero) {
      setPassageShown(true);
      return;
    }

    setPassageShown(false);
    const watcher = new IntersectionObserver(([entry]) => {
      setPassageShown(!(entry?.isIntersecting ?? true));
    });
    watcher.observe(hero);
    return () => watcher.disconnect();
  }, [onStory]);

  useEffect(() => {
    const darks = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".dragon-stage, .dragon-section--invert, .marks",
      ),
    );
    if (darks.length === 0) {
      setGround("paper");
      return;
    }

    const seen = new Set<Element>();
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        }
        setGround(seen.size > 0 ? "ink" : "paper");
      },
      { rootMargin: "0px 0px -88% 0px", threshold: 0 },
    );
    for (const dark of darks) watcher.observe(dark);
    return () => watcher.disconnect();
  }, [onStory]);

  return (
    <header className="chrome" data-ground={ground}>
      <Link className="chrome-brand" to={site.path}>
        Blesspoke
      </Link>
      <Link
        className="chrome-passage"
        to={onStory ? site.path : site.story}
        data-room={onStory ? "work" : "man"}
        data-shown={passageShown}
        tabIndex={passageShown ? undefined : -1}
        aria-hidden={passageShown ? undefined : true}
      >
        <span className="chrome-passage-seam" aria-hidden />
        <span className="chrome-passage-label">
          {onStory ? "The work" : "The man behind the music"}
        </span>
      </Link>
    </header>
  );
}

/**
 * The first plate on the man page: held until the sheet has begun to lift,
 * then wiped open the way a brush stroke fills. Timed to the arrival so the
 * gesture is seen, not finished behind the paper.
 */
export function OpenPlate({ photo }: { photo: Photo }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOpen(true);
      return;
    }

    const sheet = document.querySelector(".sheet");
    let delayId = 0;

    const begin = () => {
      delayId = window.setTimeout(() => setOpen(true), 380);
    };

    if (!sheet) {
      begin();
      return () => window.clearTimeout(delayId);
    }

    if (sheet.getAttribute("data-ready") === "true") {
      begin();
      return () => window.clearTimeout(delayId);
    }

    const watcher = new MutationObserver(() => {
      if (sheet.getAttribute("data-ready") !== "true") return;
      watcher.disconnect();
      begin();
    });
    watcher.observe(sheet, { attributes: true, attributeFilter: ["data-ready"] });

    return () => {
      watcher.disconnect();
      window.clearTimeout(delayId);
    };
  }, []);

  return (
    <div className="dragon-open" data-open={open || undefined}>
      <span className="dragon-open-seal" lang="zh" aria-hidden>
        樂
      </span>
      <figure className="dragon-photo dragon-open-photo">
        <img
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="eager"
          decoding="async"
        />
        <figcaption className="dragon-credit">{photo.credit}</figcaption>
      </figure>
    </div>
  );
}

/** The pinned frame that pulls its contents sideways as the page goes down. */
export function Unroll({
  vh = 320,
  className,
  head,
  children,
}: {
  vh?: number;
  className?: string;
  /** Stays on the mount while the scroll runs past it. See the note below. */
  head?: ReactNode;
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
        /* The head does not travel. A hand scroll is unrolled *past* its
           mount, and the mount is what the title is written on — but the
           practical reason is that this frame is pinned for three screens, and
           anything on the track has left the room by the second one. On a phone
           that meant the section announced itself for half a second and then
           spent the rest of the scroll as an unlabelled list of names. */
        <div className="unroll-frame" ref={frame}>
          {head ? <div className="unroll-head">{head}</div> : null}
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
    <Unroll
      className="dragon-clients"
      vh={300}
      head={
        <div className="dragon-clients-head">
          <span className="dragon-clients-mark" lang="zh">
            请
          </span>
          <span className="dragon-clients-label">Who books him</span>
        </div>
      }
    >
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

/**
 * The three films as mounted scrolls. Pressing one hangs it on the stage rather
 * than playing it inside its own mount — the same stage the catalogue uses.
 */
export function FilmScrolls({ caption }: { caption: string }) {
  const { work, from, show, hide } = useLightbox();
  const numerals = ["一", "二", "三", "四"];

  return (
    <div className="scrolls">
      <p className="scrolls-caption">{caption}</p>
      <div className="scrolls-row">
        {films.map((film, index) => (
          <figure className="scroll" key={film.id} data-reveal="wipe">
            <span className="scroll-rod" aria-hidden />
            <div className="scroll-frame">
              <img src={film.poster} alt="" width={1280} height={720} loading="lazy" />
              <button
                type="button"
                className="scroll-open"
                onClick={(event) => show(film, event)}
                aria-label={`Watch ${film.title} — ${film.note}`}
              >
                <span className="scroll-numeral" lang="zh" aria-hidden>
                  {numerals[index]}
                </span>
              </button>
            </div>
            <figcaption className="scroll-caption">
              <span className="scroll-title">{film.title}</span>
              <span className="scroll-note">{film.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <Lightbox work={work} from={from} onClose={hide} />

      <Works head="Also written and produced" />
    </div>
  );
}


/**
 * A drop of ink, spreading while the page loads, and a brush stroke that wipes
 * it away when the page is ready. Paper first, then the hand, then the work —
 * which is the order this concept does everything in. On the man page the
 * critical plate is the opening portrait, not the hero silhouette.
 */
export function Loader() {
  const onStory = useLocation().pathname === site.story;
  const ready = useReady(onStory ? photos.cutout.src : photos.silhouette.src);
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
      <p className="sheet-mark">Blesspoke</p>
    </div>
  );
}

/**
 * A million people, counted the way they are counted.
 *
 * This was a photograph of the hall — a dark, soft frame in which you could not
 * actually see a single person, captioned with a number you had to take on
 * trust. So the number is drawn instead, in the mark every Chinese-speaking
 * child learns to count with: 正, five strokes, one per person tallied. Here one
 * *stroke* is a thousand people — so each 正 stands for five thousand, and a
 * million of them is two hundred marks.
 *
 * The count is derived from the figure in `content/dennis.ts` rather than typed.
 * It used to be a literal beside a literal number, which is exactly how the two
 * came apart when the figure changed.
 *
 * They are brushed on in sequence as the section passes, so the count happens in
 * front of you rather than arriving finished.
 */
export function Marks() {
  const root = useRef<HTMLElement>(null);
  const marks = Array.from(
    { length: audience.people / (audience.perStroke * audience.strokes) },
    (_, index) => index,
  );
  // Dragon does not run the parallax pass — it has no framed photography to
  // drift — so this section measures its own passage.
  useSectionProgress(root, { ease: 0.14 });

  return (
    <section className="marks" ref={root}>
      <p className="marks-head" data-reveal>
        <span className="marks-figure">{audience.shown}</span>
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
 * Nothing is bought on this site. Someone fills in Dennis's brief and his team
 * writes back, and the sample, the payment details and the finished song all
 * travel in that one thread. So it is a sheet of paper with ruled lines rather
 * than a checkout: you write on the rules, and a seal is pressed when it goes.
 *
 * The sheet is Dragon's; the twenty questions on it are machinery shared with
 * the other two concepts. Nothing is delivered here; see `lib/enquiry.ts`.
 */
export function Enquiry() {
  return (
    <div className="sheetform" id="brief" data-reveal>
      <p className="sheetform-eyebrow">{enquiry.eyebrow}</p>
      <h3 className="sheetform-head">{enquiry.headline}</h3>
      <p className="sheetform-lede">{enquiry.lede}</p>
      <Brief />
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
