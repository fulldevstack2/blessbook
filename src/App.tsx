import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSmoothScroll } from "./lib/useSmoothScroll";
import { ChooserPage } from "./pages/ChooserPage";
import { PhoenixPage } from "./concepts/phoenix/PhoenixPage";
import { DragonPage } from "./concepts/dragon/DragonPage";
import { NocturnePage } from "./concepts/nocturne/NocturnePage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  // Weighted scrolling for the whole site, not one concept: it is a property of
  // the surface, like the grain.
  useSmoothScroll();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ChooserPage />} />
        <Route path="/phoenix" element={<PhoenixPage />} />
        <Route path="/dragon" element={<DragonPage />} />
        <Route path="/nocturne" element={<NocturnePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
