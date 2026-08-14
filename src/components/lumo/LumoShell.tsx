import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { currentUser, loginAs } from "@/lib/store";

const NAV = [
  { to: "/lumo", label: "Dashboard", icon: "◆", end: true },
  { to: "/lumo/users", label: "Users", icon: "◉" },
  { to: "/lumo/transactions", label: "Transactions", icon: "⇄" },
  { to: "/lumo/network", label: "Network", icon: "⌘" },
];

export function LumoShell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = currentUser();

  useEffect(() => {
    if (!user) {
      // demo convenience: auto-enter as admin
      loginAs("admin");
      return;
    }
    if (user.role !== "admin") navigate("/login");
  }, [user, navigate]);

  return (
    <div className="lumo">
      <aside className={`lumo-side${open ? " open" : ""}`}>
        <div className="lumo-brand">
          <div className="name">
            Lu<b>mo</b>
          </div>
          <div className="tag">Blesspoke Admin Portal</div>
        </div>
        <span className="lumo-nav-label">Operations</span>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end as boolean | undefined}
            className={({ isActive }) => `lumo-link${isActive ? " active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <span className="ico">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
        <span className="lumo-nav-label">Blesspoke</span>
        <NavLink to="/" className="lumo-link">
          <span className="ico">←</span>
          Back to site
        </NavLink>
      </aside>

      <div className="lumo-main">
        <button
          className="btn btn-ghost btn-sm lumo-toggle"
          style={{ marginBottom: 16 }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close menu" : "Lumo menu"}
        </button>
        <Outlet />
      </div>
    </div>
  );
}
