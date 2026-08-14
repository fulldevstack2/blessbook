import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { currentUser } from "@/lib/store";

export function AccountPage() {
  const navigate = useNavigate();
  const user = currentUser();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="page-body">
      <div className="page-hero">
        <div className="shell">
          <span className="kicker">Account</span>
          <h1 className="display display-md" style={{ marginTop: 12 }}>{user.name}</h1>
        </div>
      </div>
      <div className="shell" style={{ maxWidth: 620 }}>
        <div className="panel panel-pad">
          <div className="list-row">
            <span className="mono-label">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="list-row">
            <span className="mono-label">Phone</span>
            <span>{user.phone ?? "—"}</span>
          </div>
          <div className="list-row">
            <span className="mono-label">Role</span>
            <span className="chip gold">{user.role}</span>
          </div>
          <div className="list-row">
            <span className="mono-label">Member since</span>
            <span>{user.createdAt}</span>
          </div>
          <div className="list-row" style={{ borderBottom: 0 }}>
            <span className="mono-label">2FA</span>
            <span className={`chip ${user.is2fa ? "green" : "dim"}`}>
              {user.is2fa ? "Enabled" : "Off"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
