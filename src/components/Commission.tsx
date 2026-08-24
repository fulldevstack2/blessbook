import { useEffect, useState } from "react";
import { sounding_, watch } from "../lib/listening";

/**
 * A way back to the brief, from anywhere.
 *
 * The commission is the last thing on a long page, which is right — the record
 * has to be read before the offer means anything — but it also means someone
 * convinced at the halfway mark has to scroll past everything to act on it.
 *
 * The whole design problem is not being in the way, so it is answered by
 * knowing when to be absent. It stays out of the hero entirely: someone who has
 * just arrived has not been given a reason yet, and the hero has its own player
 * to press. It retires the moment the brief is on screen, because a button
 * pointing at what you are already looking at is noise. And it sits bottom
 * *right*, because the player this site can raise sits bottom left — on a narrow
 * screen the player is nearly the full width, so this lifts above it rather than
 * fighting it for the corner.
 *
 * A real anchor to a real id, so it works before any of this runs.
 */

export function Commission({ label = "Commission a song" }: { label?: string }) {
  const [shown, setShown] = useState(false);
  const [sounding, setSounding] = useState(false);

  useEffect(() => watch(() => setSounding(Boolean(sounding_()))), []);

  useEffect(() => {
    const brief = document.getElementById("brief");
    if (!brief) return;
    /* The hero is the first pinned track on the page and it is four or five
       screens tall, so "past the hero" is simply "that track has left". */
    const hero = document.querySelector(".stage-track");

    let atBrief = false;
    let atHero = Boolean(hero);
    const settle = () => setShown(!atBrief && !atHero);

    const watchers = [
      new IntersectionObserver(
        ([entry]) => {
          atBrief = entry?.isIntersecting ?? false;
          settle();
        },
        // A shade before it arrives, so it is gone by the time you read it.
        { rootMargin: "0px 0px -18% 0px" },
      ),
    ];
    watchers[0]?.observe(brief);

    if (hero) {
      const second = new IntersectionObserver(([entry]) => {
        atHero = entry?.isIntersecting ?? false;
        settle();
      });
      second.observe(hero);
      watchers.push(second);
    }

    settle();
    return () => watchers.forEach((watcher) => watcher.disconnect());
  }, []);

  return (
    <a
      className="tocommission"
      href="#brief"
      data-shown={shown}
      data-lifted={sounding}
      tabIndex={shown ? undefined : -1}
      onClick={(event) => {
        const brief = document.getElementById("brief");
        if (!brief) return; // let the anchor do it
        event.preventDefault();
        brief.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      <span className="tocommission-word">{label}</span>
      <span className="tocommission-mark" aria-hidden />
    </a>
  );
}
