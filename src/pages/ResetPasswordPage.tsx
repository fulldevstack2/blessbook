import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "@/lib/store";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = resetPassword(email, password);
    if (!res.ok) {
      setError(res.error ?? "Could not reset password.");
      return;
    }
    setOk(true);
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="kicker">Reset</span>
        <h1 className="display display-md" style={{ margin: "12px 0 24px" }}>
          New <span className="serif-note" style={{ textTransform: "none" }}>key</span>
        </h1>
        <form className="form-card" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          {ok && <p className="form-ok">Password updated — taking you to sign in…</p>}
          <button type="submit" className="btn btn-gold" style={{ width: "100%" }}>
            Reset password
          </button>
          <p className="mono-label" style={{ textAlign: "center", marginTop: 16 }}>
            <Link to="/login" style={{ color: "var(--gold)" }}>
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
