import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tiers } from "../content/commission";
import { sounding_, watch } from "../lib/listening";

/**
 * A way in to the commission, from anywhere.
 *
 * It points at the top of the commission — the offer, what you own, the two
 * prices — and not at the form. Someone dropped straight into twenty questions
 * has not been told what a song costs, and the price is the thing they came to
 * find out; the questions are two screens further on and reached in the ordinary
 * way. It also carries the entry price itself, so the answer arrives before the
 * click rather than after it.
 *
 * The whole design problem is not being in the way, and it is solved by knowing
 * when to be absent. Never in the hero: nobody has been given a reason yet, and
 * the hero has its own player to press. Gone from the moment the commission
 * arrives on screen, and gone for good below it — a button pointing at what you
 * are reading is noise, and everything after it is still the commission's own
 * room. Bottom right,
 * because the player sits bottom left — and on a narrow screen that player is
 * nearly the full width, so this lifts above it rather than fighting for the
 * corner.
 *
 * On the second page there is no commission to point at, so it points at the
 * first page's — same button, same price, one navigation further. The absence of
 * a local target is the signal: nothing has to be configured per page.
 *
 * It is a real anchor to a real id, so it works before any of this runs. The
 * *shape* of it belongs to each concept: see `.tocommission` in the three
 * stylesheets. A single boxed pill in three colours was the one piece of
 * furniture on this site that did not know which page it was on.
 */

/** The cheaper of the two, phrased as an entry price rather than a quote. */
const from = tiers.reduce(
  (cheapest, tier) =>
    Number(tier.price.replace(/[^\d]/g, "")) < Number(cheapest.price.replace(/[^\d]/g, ""))
      ? tier
      : cheapest,
  tiers[0] as (typeof tiers)[number],
);

export function Commission({
  label = "Commission a song",
  /** Where the commission lives, when it is not on this page. */
  to,
}: {
  label?: string;
  to?: string;
}) {
  const [shown, setShown] = useState(false);
  const [sounding, setSounding] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => watch(() => setSounding(Boolean(sounding_()))), []);

  /* Out of the way of anything modal. A floating button on top of a film — or
     over that film's own "open on YouTube" link — is the exact opposite of
     staying out of the way, which is the whole brief for this thing. */
  useEffect(() => {
    const watch = () => setBlocked(Boolean(document.querySelector(".lightbox")));
    watch();
    const seen = new MutationObserver(watch);
    seen.observe(document.body, { childList: true, subtree: true });
    return () => seen.disconnect();
  }, []);

  useEffect(() => {
    const target = document.getElementById("commission");
    /* The hero is the first pinned track on the page and it is four or five
       screens tall, so "past the hero" is simply "that track has left". */
    const hero = document.querySelector(".stage-track");

    /* No commission on this page: it cannot be in the way of what you are
       reading, so it is shown from the moment there is any page behind you. */
    if (!target) {
      const enough = () => setShown(window.scrollY > window.innerHeight * 0.6);
      enough();
      window.addEventListener("scroll", enough, { passive: true });
      return () => window.removeEventListener("scroll", enough);
    }

    let pastTarget = false;
    let atHero = Boolean(hero);
    const settle = () => setShown(!pastTarget && !atHero);

    /* Once the reader has reached the commission the button's work is done —
       and it stays done: the deed, the brief and the terms below it are all
       the commission's own rooms, so the button does not come back down
       there. "Reached" a shade early, so it is gone by the time you are
       reading it. */
    const reached = () => {
      pastTarget = target.getBoundingClientRect().top < window.innerHeight * 0.82;
      settle();
    };
    window.addEventListener("scroll", reached, { passive: true });
    window.addEventListener("resize", reached);

    let onHero: IntersectionObserver | undefined;
    if (hero) {
      onHero = new IntersectionObserver(([entry]) => {
        atHero = entry?.isIntersecting ?? false;
        settle();
      });
      onHero.observe(hero);
    }

    reached();
    return () => {
      window.removeEventListener("scroll", reached);
      window.removeEventListener("resize", reached);
      onHero?.disconnect();
    };
  }, []);

  const props = {
    className: "tocommission",
    "data-shown": shown && !blocked,
    "data-lifted": sounding,
    tabIndex: shown && !blocked ? undefined : -1,
  } as const;

  const body = (
    <>
      <span className="tocommission-rule" aria-hidden />
      <span className="tocommission-words">
        <span className="tocommission-word">{label}</span>
        <span className="tocommission-price">From {from.price}</span>
      </span>
    </>
  );

  /* Another page: open onto the commission under the veil — same curtain, no
     hero, no fast-forward through the work. Hash is the arrival intent. */
  if (to) {
    const pathname = to.replace(/#.*$/, "");
    return (
      <Link
        {...props}
        to={{ pathname, hash: "#commission" }}
        state={{ arrive: "commission" }}
      >
        {body}
      </Link>
    );
  }

  return (
    <a
      {...props}
      href="#commission"
      onClick={(event) => {
        const target = document.getElementById("commission");
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {body}
    </a>
  );
}
