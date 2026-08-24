import { useEffect, useState } from "react";
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
 * the hero has its own player to press. Gone once the commission is on screen,
 * because a button pointing at what you are reading is noise. Bottom right,
 * because the player sits bottom left — and on a narrow screen that player is
 * nearly the full width, so this lifts above it rather than fighting for the
 * corner.
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

export function Commission({ label = "Commission a song" }: { label?: string }) {
  const [shown, setShown] = useState(false);
  const [sounding, setSounding] = useState(false);

  useEffect(() => watch(() => setSounding(Boolean(sounding_()))), []);

  useEffect(() => {
    const target = document.getElementById("commission");
    if (!target) return;
    /* The hero is the first pinned track on the page and it is four or five
       screens tall, so "past the hero" is simply "that track has left". */
    const hero = document.querySelector(".stage-track");

    let atTarget = false;
    let atHero = Boolean(hero);
    const settle = () => setShown(!atTarget && !atHero);

    const watchers: IntersectionObserver[] = [];

    const onTarget = new IntersectionObserver(
      ([entry]) => {
        atTarget = entry?.isIntersecting ?? false;
        settle();
      },
      // A shade before it arrives, so it is gone by the time you are reading it.
      { rootMargin: "0px 0px -18% 0px" },
    );
    onTarget.observe(target);
    watchers.push(onTarget);

    if (hero) {
      const onHero = new IntersectionObserver(([entry]) => {
        atHero = entry?.isIntersecting ?? false;
        settle();
      });
      onHero.observe(hero);
      watchers.push(onHero);
    }

    settle();
    return () => watchers.forEach((watcher) => watcher.disconnect());
  }, []);

  return (
    <a
      className="tocommission"
      href="#commission"
      data-shown={shown}
      data-lifted={sounding}
      tabIndex={shown ? undefined : -1}
      onClick={(event) => {
        const target = document.getElementById("commission");
        if (!target) return; // let the anchor do it
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      <span className="tocommission-rule" aria-hidden />
      <span className="tocommission-words">
        <span className="tocommission-word">{label}</span>
        <span className="tocommission-price">From {from.price}</span>
      </span>
    </a>
  );
}
