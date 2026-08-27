import { useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSmoothScroll } from "./lib/useSmoothScroll";
import { ChooserPage } from "./pages/ChooserPage";
import { PhoenixPage, PhoenixStory } from "./concepts/phoenix/PhoenixPage";
import { DragonPage, DragonStory } from "./concepts/dragon/DragonPage";
import { NocturnePage, NocturneStory } from "./concepts/nocturne/NocturnePage";

/**
 * Where the curtain should open.
 *
 * A hash (or link state) means "open onto this section" — not "land on the hero
 * and scroll". That intent is written onto the document before the loader pins
 * scroll, so the veil parts on the commission rather than racing a jump after.
 */
function Arrival() {
  const { pathname, hash, state } = useLocation();
  const fromState =
    state &&
    typeof state === "object" &&
    "arrive" in state &&
    typeof (state as { arrive?: unknown }).arrive === "string"
      ? (state as { arrive: string }).arrive
      : "";
  const arrive = fromState || hash.replace(/^#/, "");

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (arrive) root.dataset.arrive = arrive;
    else delete root.dataset.arrive;

    if (!arrive) window.scrollTo(0, 0);

    return () => {
      delete root.dataset.arrive;
    };
  }, [pathname, arrive]);

  return null;
}

export function App() {
  // Weighted scrolling for the whole site, not one concept: it is a property of
  // the surface, like the grain.
  useSmoothScroll();

  return (
    <>
      <Arrival />
      <Routes>
        <Route path="/" element={<ChooserPage />} />
        <Route path="/phoenix" element={<PhoenixPage />} />
        <Route path="/phoenix/the-man" element={<PhoenixStory />} />
        <Route path="/dragon" element={<DragonPage />} />
        <Route path="/dragon/the-man" element={<DragonStory />} />
        <Route path="/nocturne" element={<NocturnePage />} />
        <Route path="/nocturne/the-man" element={<NocturneStory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
