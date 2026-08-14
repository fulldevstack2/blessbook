import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "@/lib/store";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { user, error: err } = registerUser({ name, email, password });
    if (!user) {
      setError(err ?? "Could not create your account.");
      return;
    }
    navigate("/brief");
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="kicker">Join Blesspoke</span>
        <h1 className="display display-md" style={{ margin: "12px 0 24px" }}>
          Your song <span className="serif-note" style={{ textTransform: "none" }}>awaits</span>
        </h1>
        <form className="form-card" onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-gold" style={{ width: "100%" }}>
            Create account
          </button>
          <p className="mono-label" style={{ textAlign: "center", marginTop: 16 }}>
            Already a member?{" "}
            <Link to="/login" style={{ color: "var(--gold)" }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
