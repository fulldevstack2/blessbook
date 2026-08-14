import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ChooserPage } from "./pages/ChooserPage";
import { PhoenixPage } from "./concepts/phoenix/PhoenixPage";
import { DragonPage } from "./concepts/dragon/DragonPage";
import { ChosenPage } from "./concepts/chosen/ChosenPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ChooserPage />} />
        <Route path="/phoenix" element={<PhoenixPage />} />
        <Route path="/dragon" element={<DragonPage />} />
        <Route path="/chosen" element={<ChosenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
