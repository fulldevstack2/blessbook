import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { BriefPage } from "./pages/BriefPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectRoomPage } from "./pages/ProjectRoomPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { StudioPage } from "./pages/StudioPage";
import { AccountPage } from "./pages/AccountPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LumoShell } from "./components/lumo/LumoShell";
import { LumoDashboard } from "./pages/lumo/LumoDashboard";
import { LumoUsers } from "./pages/lumo/LumoUsers";
import { LumoTransactions } from "./pages/lumo/LumoTransactions";
import { LumoNetwork } from "./pages/lumo/LumoNetwork";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/brief" element={<BriefPage />} />
          <Route path="/checkout/:projectId" element={<CheckoutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/project/:id" element={<ProjectRoomPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/lumo" element={<LumoShell />}>
          <Route index element={<LumoDashboard />} />
          <Route path="users" element={<LumoUsers />} />
          <Route path="transactions" element={<LumoTransactions />} />
          <Route path="network" element={<LumoNetwork />} />
        </Route>
      </Routes>
    </>
  );
}
