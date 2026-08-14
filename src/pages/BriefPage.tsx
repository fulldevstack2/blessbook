import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OCCASIONS, PACKAGES } from "@/lib/data";
import { currentUser, money, newId, pushNotification, saveProject } from "@/lib/store";
import type { Project } from "@/lib/types";

export function BriefPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const user = currentUser();

  const [packageId, setPackageId] = useState(
    params.get("package") ?? PACKAGES[1]!.id,
  );
  const [prompt, setPrompt] = useState("");
  const [occasion, setOccasion] = useState(OCCASIONS[0]!);
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const pkg = PACKAGES.find((p) => p.id === packageId) ?? PACKAGES[1]!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login?next=/brief");
      return;
    }
    if (prompt.trim().length < 12) {
      setError("Give Dennis at least a sentence — one prompt is all it takes, but make it count.");
      return;
    }
    const project: Project = {
      id: newId("pr"),
      userId: user.id,
      title: title.trim() || `A song for ${recipient.trim() || "someone dear"}`,
      prompt: prompt.trim(),
      occasion,
      recipient: recipient.trim(),
      packageId: pkg.id,
      price: pkg.price,
      currency: pkg.currency,
      status: "briefed",
      createdAt: new Date().toISOString(),
    };
    saveProject(project);
    pushNotification({
      userId: "u-dennis",
      projectId: project.id,
      kind: "project",
      text: `New brief: “${project.title}” (${pkg.name})`,
    });
    navigate(`/checkout/${project.id}`);
  };

  return (
    <div className="page-body">
      <div className="page-hero">
        <div className="shell">
          <span className="kicker">The Brief</span>
          <h1 className="display display-md" style={{ marginTop: 12 }}>
            1 prompt <span className="gold-text">·</span> 1 request
          </h1>
          <p className="lede" style={{ marginTop: 14 }}>
            This is the whole commissioning form. One prompt, one request — Dennis
            takes it from there.
          </p>
        </div>
      </div>

      <div className="shell" style={{ maxWidth: 760 }}>
        <form className="form-card" onSubmit={submit}>
          <div className="field">
            <label>Choose your package</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {PACKAGES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPackageId(p.id)}
                  className="panel panel-pad"
                  style={{
                    border:
                      p.id === packageId
                        ? "1px solid var(--gold)"
                        : "1px solid var(--line)",
                    background: p.id === packageId ? "rgba(214,173,92,0.08)" : undefined,
                    color: "var(--ivory)",
                    textAlign: "left",
                  }}
                >
                  <div className="mono-label">{p.tier}</div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginTop: 4 }}>{p.name}</div>
                  <div style={{ color: "var(--gold-hi)", fontWeight: 700, marginTop: 2 }}>
                    {money(p.price, p.currency)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="prompt">Your one prompt</label>
            <textarea
              id="prompt"
              className="textarea"
              placeholder="e.g. A song for my wife on our 10th anniversary — we met in a bookshop in Penang, she hums when she cooks, and I want her to know she is still my favourite person in any room."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="field">
              <label htmlFor="occasion">Occasion</label>
              <select
                id="occasion"
                className="select"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              >
                {OCCASIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="recipient">Who is it for?</label>
              <input
                id="recipient"
                className="input"
                placeholder="e.g. my wife, Sarah"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="title">Working title (optional)</label>
            <input
              id="title"
              className="input"
              placeholder="Leave blank and Dennis will name it"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-gold" style={{ width: "100%" }}>
            Send brief — continue to checkout
          </button>
          <p className="mono-label" style={{ textAlign: "center", marginTop: 14 }}>
            Payment is held until you approve the preview
          </p>
        </form>
      </div>
    </div>
  );
}
