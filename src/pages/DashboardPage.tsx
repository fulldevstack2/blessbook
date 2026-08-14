import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { currentUser, getProjects, money, packageById, statusLabel } from "@/lib/store";

export function DashboardPage() {
  const navigate = useNavigate();
  const user = currentUser();

  useEffect(() => {
    if (!user) navigate("/login?next=/dashboard");
  }, [user, navigate]);

  if (!user) return null;

  const projects = getProjects().filter((p) => p.userId === user.id);
  const spent = projects.reduce((acc, p) => acc + p.price, 0);
  const owned = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="page-body">
      <div className="page-hero">
        <div className="shell">
          <span className="kicker">My Songs</span>
          <h1 className="display display-md" style={{ marginTop: 12 }}>
            {user.name.split(" ")[0]}’s <span className="serif-note" style={{ textTransform: "none" }}>collection</span>
          </h1>
        </div>
      </div>

      <div className="shell">
        <div className="stat-grid" style={{ marginBottom: 34 }}>
          <div className="stat-card">
            <span className="mono-label">Commissions</span>
            <div className="v">{projects.length}</div>
          </div>
          <div className="stat-card">
            <span className="mono-label">Songs owned</span>
            <div className="v" style={{ color: "var(--gold-hi)" }}>{owned}</div>
          </div>
          <div className="stat-card">
            <span className="mono-label">In progress</span>
            <div className="v">{projects.length - owned}</div>
          </div>
          <div className="stat-card">
            <span className="mono-label">Commissioned value</span>
            <div className="v">{money(spent)}</div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="panel panel-pad" style={{ textAlign: "center", padding: 60 }}>
            <p className="serif-note" style={{ fontSize: 24 }}>
              “No songs yet — every collection starts with one prompt.”
            </p>
            <Link to="/brief" className="btn btn-gold" style={{ marginTop: 20 }}>
              Create your first song
            </Link>
          </div>
        ) : (
          <div className="panel panel-pad">
            {projects.map((p) => (
              <div className="list-row" key={p.id}>
                <div>
                  <Link to={`/project/${p.id}`} style={{ fontWeight: 700, fontSize: 16 }}>
                    {p.title}
                  </Link>
                  <div className="mono-label" style={{ marginTop: 4 }}>
                    {packageById(p.packageId).name} · {p.occasion} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span className={`chip ${p.status === "completed" ? "gold" : "amber"}`}>
                    {statusLabel(p.status)}
                  </span>
                  <span className="num">{money(p.price, p.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
