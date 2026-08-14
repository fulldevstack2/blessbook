import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login, loginAs } from "@/lib/store";
import type { Role } from "@/lib/types";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email, password);
    if (!user) {
      setError("That email and password don’t match. Try a demo account below.");
      return;
    }
    navigate(user.role === "admin" ? "/lumo" : user.role === "creator" ? "/studio" : next);
  };

  const demo = (role: Role) => {
    const user = loginAs(role);
    navigate(role === "admin" ? "/lumo" : role === "creator" ? "/studio" : next);
    return user;
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="kicker">Welcome back</span>
        <h1 className="display display-md" style={{ margin: "12px 0 24px" }}>
          Sign <span className="serif-note" style={{ textTransform: "none" }}>in</span>
        </h1>
        <form className="form-card" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-gold" style={{ width: "100%" }}>
            Sign in
          </button>
          <p className="mono-label" style={{ textAlign: "center", marginTop: 16 }}>
            <Link to="/reset" style={{ color: "var(--gold)" }}>
              Forgot password
            </Link>
            {" · "}
            <Link to="/register" style={{ color: "var(--gold)" }}>
              Create account
            </Link>
          </p>

          <div className="demo-accounts">
            <span className="mono-label">Demo one-click</span>
            <button type="button" onClick={() => demo("listener")}>
              Listener — you@blesspoke.com
            </button>
            <button type="button" onClick={() => demo("creator")}>
              Creator — Dennis Lau (studio)
            </button>
            <button type="button" onClick={() => demo("admin")}>
              Admin — Lumo portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
