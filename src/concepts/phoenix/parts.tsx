import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { ScrollStage } from "../../lib/ScrollStage";
import { SceneCanvas } from "../../lib/SceneCanvas";
import { createBandScene } from "./bandScene";
import { createInstrumentScene } from "./instrumentScene";
import { clients, clientWall } from "../../content/clients";
import { useReady } from "../../lib/useReady";
import { useTypeset } from "../../lib/useTypeset";
import { prefersReducedMotion } from "../../lib/prefersReducedMotion";
import { photos } from "../../content/media";
import { Brief } from "../../components/Brief";
import { artist, record, territories } from "../../content/dennis";
import { enquiry, steps } from "../../content/commission";
import type { Photo } from "../../content/media";
import { conceptById, violin } from "../registry";
import { TURNED } from "../../lib/loadModel";
import { siteName, workNav } from "../../content/site";
import { pressWord, words } from "../../content/work";

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
 *
 * Phoenix is treated as the live site now: no way back to the design chooser,
 * no links to the other two directions. The bar is Blessbook's own masthead.
 */

const site = conceptById("phoenix");

/**
 * The site bar. Brand on the left; the other room on the right (work or man).
 *
 * Not a button with an arrow. A short gold seam and the destination in display
 * type. Same door on phone and desktop. On the work page the passage waits
 * until the hero has left; on the man page the brand (and "The work") bring
 * you back.
 *
 * Over the ivory turn the marks ink themselves dark — no lacquer bloom, which
 * reads as a smudge on cream. Over lacquer they stay light.
 */
/* The page's own numbering — every section is announced as a movement. */
const NUMERALS = ["I", "II", "III", "IV", "V", "VI"] as const;

export function SiteChrome() {
  const onStory = useLocation().pathname === site.story;
  const [passageShown, setPassageShown] = useState(onStory);
  const [ground, setGround] = useState<"lacquer" | "ivory">("lacquer");
  const [menuOpen, setMenuOpen] = useState(false);

  /* The menu is a veil over the page: the page must not scroll beneath it,
     and Escape must put it away. */
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const prior = root.style.overflow;
    root.style.overflow = "hidden";
    const away = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", away);
    return () => {
      root.style.overflow = prior;
      window.removeEventListener("keydown", away);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (onStory) {
      setPassageShown(true);
      return;
    }

    const hero = document.querySelector(".phoenix-stage");
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
    const lights = Array.from(
      document.querySelectorAll<HTMLElement>(".phoenix-section--invert"),
    );
    if (lights.length === 0) {
      setGround("lacquer");
      return;
    }

    /* The marks flip to dark ink only when an ivory section actually stands
       under the masthead — measured, not intersection-observed, because a
       section whose last few pixels graze the viewport top used to latch the
       ivory ink (and its ivory light-fall) over the lacquer room below it:
       arrive at the commission and the masthead wore white. */
    let frame = 0;
    const judge = () => {
      frame = 0;
      const bar = 64;
      const lit = lights.some((light) => {
        const rect = light.getBoundingClientRect();
        return rect.top < bar * 0.5 && rect.bottom > bar;
      });
      setGround(lit ? "ivory" : "lacquer");
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(judge);
    };
    judge();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onStory]);

  return (
    <header className="chrome" data-ground={ground} data-menu-open={menuOpen}>
      <Link className="chrome-brand" to={site.path} onClick={() => setMenuOpen(false)}>
        {siteName}
      </Link>

      <nav className="chrome-nav" aria-label="Primary">
        {workNav.map((item) => (
          <Link
            key={item.id}
            className="chrome-nav-link"
            to={{ pathname: site.path, hash: item.hash }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* The phone has no room for the link row, so it gets the word instead
          of a hamburger, and the links get what this concept gives every
          arrival: a veil. */}
      <button
        type="button"
        className="chrome-menu-button"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? "Close" : "Menu"}
      </button>

      <div className="chrome-menu" data-open={menuOpen} aria-hidden={!menuOpen}>
        <nav className="chrome-menu-rooms" aria-label="Site">
          {workNav.map((item, index) => (
            <Link
              key={item.id}
              className="chrome-menu-link"
              to={{ pathname: site.path, hash: item.hash }}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? undefined : -1}
              style={{ "--i": index } as CSSProperties}
            >
              <span className="chrome-menu-count" aria-hidden>
                {NUMERALS[index]}
              </span>
              <span className="chrome-menu-word">{item.label}</span>
            </Link>
          ))}
          <Link
            className="chrome-menu-link chrome-menu-link--man"
            to={onStory ? site.path : site.story}
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? undefined : -1}
            style={{ "--i": workNav.length } as CSSProperties}
          >
            <span className="chrome-menu-count" aria-hidden>
              ·
            </span>
            <span className="chrome-menu-word">
              {onStory ? "The work" : "The man behind the music"}
            </span>
          </Link>
        </nav>
      </div>

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
 * The testimonials as strings.
 *
 * Not the process's numeral stage and not a grid: this room is strung like
 * the instrument the whole site is about. Five vertical gold strings stand
 * on the ivory — one per voice. The one that is sounding glows and visibly
 * vibrates; the ones already played stay warm; the ones waiting stay faint.
 * And the voice itself is not faded in: it is engraved, letter by letter,
 * by the scroll — the pin's own `--cut` progress fills the ghost letters
 * with ink as the reader draws the bow.
 */
export function Chorus() {
  const voices = [
    { mark: "The press", text: pressWord.text, who: pressWord.who, when: pressWord.when, press: true },
    ...words.map((word) => ({
      mark: word.what,
      text: word.text,
      who: word.who,
      when: word.when,
      press: false,
    })),
  ];

  return (
    <div id="testimonials" className="phoenix-section--invert chorus-hall">
      <ScrollStage vh={(voices.length + 1) * 100} cuts={voices.length} className="chorus">
        {({ stage }) => (
          <>
            <p className="phoenix-eyebrow chorus-eyebrow">Testimonials</p>

            <div className="chorus-strings" aria-hidden>
              {voices.map((voice, index) => (
                <span
                  key={voice.who + String(index)}
                  className="chorus-string"
                  data-state={index === stage ? "sounding" : index < stage ? "played" : "waiting"}
                />
              ))}
            </div>

            <ul className="chorus-voices">
              {voices.map((voice, index) => (
                <li
                  className="chorus-voice"
                  key={voice.who + String(index)}
                  data-active={index === stage}
                  data-press={voice.press || undefined}
                >
                  <p className="chorus-mark">{voice.mark}</p>
                  <blockquote className="chorus-text">{voice.text}</blockquote>
                  <p className="chorus-who">
                    {voice.who} · {voice.when}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </ScrollStage>
    </div>
  );
}

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
 * A plumb line down the margin with a gilded bead riding it — and you can take
 * hold of it.
 *
 * It began as a readout: it said how far through the piece you were and did
 * nothing. Anything that looks exactly like a scrollbar and cannot be dragged is
 * a small lie, and on a page this long the affordance is worth having anyway. So
 * press it and the page goes there, drag the bead and the page follows, and it
 * takes the keyboard too: arrows by a screen-tenth, page keys by a screen,
 * Home and End for the ends.
 *
 * `role="slider"` rather than `scrollbar`, deliberately: the scrollbar role
 * expects to own a named region and announces itself as furniture, where this is
 * one control with one value. It is no longer `aria-hidden`, because a thing you
 * can operate has to be reachable.
 *
 * Dragging sets `scrollTop` directly and never smoothly — a smooth scroll under
 * a drag lags the pointer and feels broken. The bead's own transition is
 * suppressed while dragging for the same reason.
 */
export function Plumb() {
  const line = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const element = line.current;
    if (!element) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      const progress = travel > 0 ? window.scrollY / travel : 0;
      const bounded = Math.min(1, Math.max(0, progress));
      element.style.setProperty("--page", bounded.toFixed(4));
      setAt(Math.round(bounded * 100));
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

  /** Where along the rail a pointer is, as 0 → 1. */
  const fraction = (clientY: number) => {
    const element = line.current;
    if (!element) return 0;
    const box = element.getBoundingClientRect();
    if (box.height === 0) return 0;
    return Math.min(1, Math.max(0, (clientY - box.top) / box.height));
  };

  const jump = (portion: number) => {
    const travel = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: portion * travel, behavior: "auto" });
  };

  const nudge = (by: number) => {
    const travel = document.documentElement.scrollHeight - window.innerHeight;
    if (travel <= 0) return;
    jump(Math.min(1, Math.max(0, window.scrollY / travel + by)));
  };

  return (
    <div
      className="plumb"
      ref={line}
      data-held={held}
      role="slider"
      tabIndex={0}
      aria-label="Scroll the page"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={at}
      aria-valuetext={`${at}% through the page`}
      onPointerDown={(event) => {
        // Ignore the secondary buttons: a right-click is a menu, not a scroll.
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setHeld(true);
        jump(fraction(event.clientY));
      }}
      onPointerMove={(event) => {
        if (!held) return;
        jump(fraction(event.clientY));
      }}
      onPointerUp={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      onKeyDown={(event) => {
        const step = 0.1;
        const keys: Record<string, () => void> = {
          ArrowDown: () => nudge(step),
          ArrowUp: () => nudge(-step),
          PageDown: () => nudge(1 / 3),
          PageUp: () => nudge(-1 / 3),
          Home: () => jump(0),
          End: () => jump(1),
        };
        const act = keys[event.key];
        if (!act) return;
        event.preventDefault();
        act();
      }}
    >
      <span className="plumb-line" aria-hidden />
      <span className="plumb-fill" aria-hidden />
      {/* An open notehead threaded on the line.

          A filled head with a drawn stem read as clip art: at fourteen pixels a
          solid shape is a blob, and a stem sticking off a vertical rail is a
          flagpole. This is the engraver's answer instead. The head is an open
          ellipse cut on the slant a nib makes, hairline like everything else
          gold on this concept, and the rail passes behind it as its stem, which
          is exactly how a note sits on a staff. */}
      <svg className="plumb-note" viewBox="0 0 20 20" focusable="false" aria-hidden>
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
 * the page is behind it. Nothing spins, nothing is drawn on top. On the man page
 * the critical plate is the opening portrait, not the work-page press shot.
 */
export function Loader() {
  const onStory = useLocation().pathname === site.story;
  const ready = useReady(onStory ? photos.live.src : photos.press.src);
  const typeset = useTypeset(['600 64px "Playfair Display"']);

  return (
    <div className="veil" data-ready={ready} data-typeset={typeset} aria-hidden={ready}>
      <div className="veil-half veil-half--left" />
      <div className="veil-half veil-half--right" />
      <p className="veil-name">
        <span className="veil-name-en">Dennis Lau</span>
        <span className="veil-cn" lang="zh">
          刘凯彦
        </span>
      </p>
      <p className="veil-mark">{siteName}</p>
    </div>
  );
}

/**
 * The first plate on the man page: held dark until the veil has begun to part,
 * then wiped open and settled. A plain scroll-reveal would finish behind the
 * curtain, so the gesture never lands. This one is timed to the arrival.
 */
export function OpenPlate({ photo }: { photo: Photo }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOpen(true);
      return;
    }

    const veil = document.querySelector(".veil");
    let delayId = 0;

    const begin = () => {
      delayId = window.setTimeout(() => setOpen(true), 380);
    };

    if (!veil) {
      begin();
      return () => window.clearTimeout(delayId);
    }

    if (veil.getAttribute("data-ready") === "true") {
      begin();
      return () => window.clearTimeout(delayId);
    }

    const watcher = new MutationObserver(() => {
      if (veil.getAttribute("data-ready") !== "true") return;
      watcher.disconnect();
      begin();
    });
    watcher.observe(veil, { attributes: true, attributeFilter: ["data-ready"] });

    return () => {
      watcher.disconnect();
      window.clearTimeout(delayId);
    };
  }, []);

  return (
    <div className="phoenix-open" data-open={open || undefined}>
      <span className="phoenix-open-rule" aria-hidden />
      <div className="phoenix-photo phoenix-open-photo" data-parallax>
        <img
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading="eager"
          decoding="async"
        />
      </div>
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
 * Nothing on this site is bought. Someone fills in Dennis's brief, his team
 * reads it and writes back, and the sample, the payment details and the finished
 * song all travel in that one thread. So this is not a checkout, it is a request
 * laid out the way a commission plate would be: rules rather than boxes, small
 * caps for the labels, and one struck line when it goes.
 *
 * The frame is Phoenix's; the twenty questions inside it are machinery shared
 * with the other two concepts. Nothing is delivered here — see `lib/enquiry.ts`.
 */
export function Enquiry() {
  return (
    <div className="plate" id="brief" data-reveal>
      <p className="plate-eyebrow">{enquiry.eyebrow}</p>
      <h3 className="plate-head">{enquiry.headline}</h3>
      <p className="plate-lede">{enquiry.lede}</p>
      <Brief />
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
 * The instruments, turned.
 *
 * Six movements describe these objects before you ever see one, and a photograph
 * of a thing is not the thing. All three are pinned here and the scroll turns
 * them in the order they were built: each comes in at an angle, goes most of the
 * way round while the facts beside it are read, and hands over. The gold is in
 * `instrumentScene.ts`.
 *
 * `cuts` is the length of the sequence, so the cut index `ScrollStage` publishes
 * through React state is the index the scene is drawing — the plate names the
 * instrument on screen rather than a fixed one, and there is no second opinion
 * about which that is. The particulars come off the same record the rest of the
 * site reads.
 */
export function Instrument() {
  return (
    <ScrollStage vh={480} cuts={TURNED.length} className="turned">
      {({ stage, progress }) => {
        const shown = violin(TURNED[stage]);
        return (
          <>
            <SceneCanvas
              factory={createInstrumentScene}
              progress={progress}
              className="turned-stage"
              label={`${shown.name}, one of Dennis Lau's three violins, turning slowly in gold. ${shown.material}.`}
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
        );
      }}
    </ScrollStage>
  );
}
