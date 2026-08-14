import { useNavigate, useParams } from "react-router-dom";
import { getProject, money, packageById, pushNotification, updateProject } from "@/lib/store";

export function CheckoutPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projectId ? getProject(projectId) : null;

  if (!project) {
    return (
      <div className="page-body">
        <div className="page-hero">
          <div className="shell">
            <h1 className="display display-md">Order not found</h1>
            <p className="lede" style={{ marginTop: 12 }}>
              That brief doesn’t exist — start a new one.
            </p>
            <button className="btn btn-gold" style={{ marginTop: 20 }} onClick={() => navigate("/brief")}>
              Begin your brief
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pkg = packageById(project.packageId);
  const escrowFee = Math.round(project.price * 0.05);
  const total = project.price + escrowFee;

  const pay = () => {
    updateProject(project.id, { status: "accepted" });
    pushNotification({
      userId: project.userId,
      projectId: project.id,
      kind: "payment",
      text: `Payment held in escrow for “${project.title}”. Dennis is on it.`,
    });
    pushNotification({
      userId: "u-dennis",
      projectId: project.id,
      kind: "payment",
      text: `Escrow confirmed for “${project.title}” — time to write.`,
    });
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="page-body">
      <div className="page-hero">
        <div className="shell">
          <span className="kicker">Checkout</span>
          <h1 className="display display-md" style={{ marginTop: 12 }}>
            Held in <span className="gold-text">escrow</span>
          </h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Your payment sits with Blesspoke until you approve the preview. If the
            song isn’t right, you don’t pay for disappointment.
          </p>
        </div>
      </div>

      <div className="shell" style={{ maxWidth: 680 }}>
        <div className="form-card">
          <div className="list-row">
            <span className="mono-label">Song</span>
            <strong>{project.title}</strong>
          </div>
          <div className="list-row">
            <span className="mono-label">Package</span>
            <span>
              {pkg.name} · {pkg.days} days · {pkg.revisions} revisions
            </span>
          </div>
          <div className="list-row">
            <span className="mono-label">Occasion</span>
            <span>{project.occasion}</span>
          </div>
          <div className="list-row">
            <span className="mono-label">Commission</span>
            <span className="num">{money(project.price, project.currency)}</span>
          </div>
          <div className="list-row">
            <span className="mono-label">Escrow protection</span>
            <span className="num">{money(escrowFee, project.currency)}</span>
          </div>
          <div className="list-row" style={{ borderBottom: 0 }}>
            <span className="mono-label" style={{ color: "var(--gold)" }}>
              Total due
            </span>
            <strong style={{ fontSize: 24, color: "var(--gold-hi)" }}>
              {money(total, project.currency)}
            </strong>
          </div>

          <button className="btn btn-gold" style={{ width: "100%", marginTop: 22 }} onClick={pay}>
            Pay {money(total, project.currency)} — hold in escrow
          </button>
          <p className="mono-label" style={{ textAlign: "center", marginTop: 14 }}>
            Released to Dennis only after you approve the preview
          </p>
        </div>
      </div>
    </div>
  );
}
