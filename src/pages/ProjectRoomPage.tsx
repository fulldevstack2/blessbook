import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  currentUser,
  getProject,
  money,
  packageById,
  pushNotification,
  statusLabel,
  updateProject,
} from "@/lib/store";
import type { ProjectStatus } from "@/lib/types";

const TIMELINE: ProjectStatus[] = [
  "briefed",
  "accepted",
  "in_production",
  "preview",
  "delivered",
  "completed",
];

export function ProjectRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = currentUser();
  const [refresh, setRefresh] = useState(0);
  const project = id ? getProject(id) : null;

  if (!project) {
    return (
      <div className="page-body">
        <div className="page-hero">
          <div className="shell">
            <h1 className="display display-md">Song not found</h1>
            <Link to="/dashboard" className="btn btn-ghost" style={{ marginTop: 20 }}>
              Back to my songs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pkg = packageById(project.packageId);
  const stageIdx = TIMELINE.indexOf(project.status);
  const isOwner = user?.id === project.userId;
  const isDennis = user?.role === "creator";

  const advance = (status: ProjectStatus, note: string) => {
    updateProject(project.id, { status });
    pushNotification({
      userId: project.userId,
      projectId: project.id,
      kind: "project",
      text: note,
    });
    setRefresh((v) => v + 1);
  };

  const approve = () => {
    const deedId = `DEED-${project.id.slice(-6).toUpperCase()}`;
    updateProject(project.id, { status: "completed", deedId });
    pushNotification({
      userId: project.userId,
      projectId: project.id,
      kind: "project",
      text: `Ownership deed ${deedId} issued for “${project.title}”. It’s yours.`,
    });
    setRefresh((v) => v + 1);
  };

  void refresh;

  return (
    <div className="page-body">
      <div className="page-hero">
        <div className="shell">
          <span className="kicker">Project Room</span>
          <h1 className="display display-md" style={{ marginTop: 12 }}>{project.title}</h1>
          <p className="lede" style={{ marginTop: 12 }}>
            {pkg.name} · {project.occasion}
            {project.recipient ? ` · for ${project.recipient}` : ""} ·{" "}
            {money(project.price, project.currency)}
          </p>
        </div>
      </div>

      <div className="shell" style={{ display: "grid", gap: 22, maxWidth: 860 }}>
        {/* timeline */}
        <div className="panel panel-pad">
          <span className="mono-label">Journey</span>
          <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
            {TIMELINE.map((s, i) => (
              <span
                key={s}
                className={`chip ${i < stageIdx ? "gold" : i === stageIdx ? "amber" : "dim"}`}
              >
                {statusLabel(s)}
              </span>
            ))}
          </div>
        </div>

        {/* the brief */}
        <div className="panel panel-pad">
          <span className="mono-label">The one prompt</span>
          <p className="serif-note" style={{ fontSize: 21, lineHeight: 1.5, marginTop: 14 }}>
            “{project.prompt}”
          </p>
        </div>

        {/* preview / approval */}
        {project.status === "preview" && isOwner && (
          <div className="deed">
            <span className="kicker">Preview ready</span>
            <p className="lede" style={{ marginTop: 12 }}>
              Dennis has sent your preview. Listen, request a revision ({pkg.revisions}{" "}
              included), or approve it and receive your deed of ownership.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
              <button className="btn btn-gold" onClick={approve}>
                Approve — make it mine
              </button>
              <button
                className="btn btn-ghost"
                onClick={() =>
                  advance("in_production", `Revision requested on “${project.title}”.`)
                }
              >
                Request revision
              </button>
            </div>
          </div>
        )}

        {/* deed */}
        {project.status === "completed" && (
          <div className="deed">
            <div className="deed-seal">
              Bless
              <br />
              poke
            </div>
            <span className="kicker">Deed of Song Ownership</span>
            <p className="serif-note" style={{ fontSize: 22, marginTop: 14, maxWidth: "36ch" }}>
              “{project.title}” belongs wholly to its commissioner. Masters, stems,
              and all rights transferred.
            </p>
            <p className="mono-label" style={{ marginTop: 18 }}>
              Deed {project.deedId} · Signed — Dennis Lau
            </p>
          </div>
        )}

        {/* Dennis controls */}
        {isDennis && project.status !== "completed" && (
          <div className="panel panel-pad">
            <span className="mono-label">Studio controls</span>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {project.status === "accepted" && (
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() =>
                    advance("in_production", `Dennis started writing “${project.title}”.`)
                  }
                >
                  Start writing
                </button>
              )}
              {project.status === "in_production" && (
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() =>
                    advance("preview", `Preview ready for “${project.title}” — have a listen.`)
                  }
                >
                  Send preview
                </button>
              )}
              {project.status === "preview" && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    advance("delivered", `Final files delivered for “${project.title}”.`)
                  }
                >
                  Mark delivered
                </button>
              )}
            </div>
          </div>
        )}

        {!user && (
          <div className="panel panel-pad" style={{ textAlign: "center" }}>
            <p className="lede">Sign in to follow this song’s journey.</p>
            <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
