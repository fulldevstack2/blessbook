import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { currentUser, getProjects, money, notificationsFor, packageById, statusLabel } from "@/lib/store";

export function StudioPage() {
  const navigate = useNavigate();
  const user = currentUser();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "creator") navigate("/login");
  }, [user, navigate]);

  if (!user || user.role !== "creator") return null;

  const projects = getProjects();
  const notes = notificationsFor(user.id).slice(0, 6);
  const earned = projects
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + Math.round(p.price * 0.88), 0);

  return (
    <div className="page-body" key={String(earned)}>
      <div className="page-hero">
        <div className="shell">
          <span className="kicker">The Studio</span>
          <h1 className="display display-md" style={{ marginTop: 12 }}>
            Dennis’s <span className="serif-note" style={{ textTransform: "none" }}>desk</span>
          </h1>
        </div>
      </div>

      <div className="shell" style={{ display: "grid", gap: 22 }}>
        <div className="stat-grid">
          <div className="stat-card">
            <span className="mono-label">Briefs received</span>
            <div className="v">{projects.length}</div>
          </div>
          <div className="stat-card">
            <span className="mono-label">Songs delivered</span>
            <div className="v" style={{ color: "var(--gold-hi)" }}>
              {projects.filter((p) => p.status === "completed").length}
            </div>
          </div>
          <div className="stat-card">
            <span className="mono-label">Awaiting you</span>
            <div className="v">
              {projects.filter((p) => ["accepted", "in_production"].includes(p.status)).length}
            </div>
          </div>
          <div className="stat-card">
            <span className="mono-label">Escrow released</span>
            <div className="v">{money(earned)}</div>
          </div>
        </div>

        <div className="lumo-grid-2">
          <div className="panel panel-pad">
            <span className="mono-label">Incoming briefs</span>
            <div style={{ marginTop: 8 }}>
              {projects.length === 0 && (
                <p className="lede" style={{ fontSize: 15 }}>
                  No briefs yet. The next prompt could be the one.
                </p>
              )}
              {projects.map((p) => (
                <div className="list-row" key={p.id}>
                  <div>
                    <Link to={`/project/${p.id}`} style={{ fontWeight: 700 }}>
                      {p.title}
                    </Link>
                    <div className="mono-label" style={{ marginTop: 4 }}>
                      {packageById(p.packageId).name} · {p.occasion}
                    </div>
                  </div>
                  <span className={`chip ${p.status === "completed" ? "gold" : "amber"}`}>
                    {statusLabel(p.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel panel-pad">
            <span className="mono-label">Notifications</span>
            <div style={{ marginTop: 8 }}>
              {notes.length === 0 && (
                <p className="lede" style={{ fontSize: 15 }}>All quiet in the studio.</p>
              )}
              {notes.map((n) => (
                <div className="list-row" key={n.id}>
                  <span style={{ color: "var(--ivory-dim)", fontSize: 14 }}>{n.text}</span>
                  <span className="mono-label">{n.at.slice(5, 16)}</span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 16 }}
              onClick={() => setTick((v) => v + 1)}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
