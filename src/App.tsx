import { useLayoutEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSmoothScroll } from "./lib/useSmoothScroll";
import { prefersReducedMotion } from "./lib/prefersReducedMotion";
import { PhoenixPage, PhoenixStory } from "./concepts/phoenix/PhoenixPage";

/**
 * Where the curtain should open.
 *
 * A hash (or link state) means "open onto this section" — not "land on the hero
 * and scroll". That intent is written onto the document before the loader pins
 * scroll, so the veil parts on the commission rather than racing a jump after.
 */
function Arrival() {
  const { pathname, hash, state, key } = useLocation();
  const fromState =
    state &&
    typeof state === "object" &&
    "arrive" in state &&
    typeof (state as { arrive?: unknown }).arrive === "string"
      ? (state as { arrive: string }).arrive
      : "";
  const arrive = fromState || hash.replace(/^#/, "");

  /* The first arrival belongs to the veil, which pins its section before the
     curtain opens. Every arrival after that is a click on the chrome, and a
     pushState carries no scroll of its own — the page must walk there. */
  const arrived = useRef(false);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (arrive) root.dataset.arrive = arrive;
    else delete root.dataset.arrive;

    if (!arrive) {
      window.scrollTo(0, 0);
    } else if (arrived.current) {
      document.getElementById(arrive)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }
    arrived.current = true;

    return () => {
      delete root.dataset.arrive;
    };
  }, [pathname, arrive, key]);

  return null;
}

export function App() {
  useSmoothScroll();

  return (
    <>
      <Arrival />
      <Routes>
        <Route path="/" element={<PhoenixPage />} />
        <Route path="/phoenix" element={<Navigate to="/" replace />} />
        <Route path="/phoenix/the-man" element={<PhoenixStory />} />
        <Route path="/dragon/*" element={<Navigate to="/" replace />} />
        <Route path="/nocturne/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
