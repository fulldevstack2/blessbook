import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page-body">
      <div className="page-hero">
        <div className="shell" style={{ textAlign: "center", paddingTop: 80 }}>
          <span className="kicker">404</span>
          <h1 className="display display-lg" style={{ marginTop: 14 }}>
            Off <span className="serif-note" style={{ textTransform: "none" }}>key</span>
          </h1>
          <p className="lede" style={{ margin: "18px auto 0" }}>
            This page never made the setlist.
          </p>
          <Link to="/" className="btn btn-gold" style={{ marginTop: 26 }}>
            Back to Blesspoke
          </Link>
        </div>
      </div>
    </div>
  );
}
