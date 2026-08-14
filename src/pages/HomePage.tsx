import { Link } from "react-router-dom";
import { CinemaHero } from "@/components/fx/CinemaHero";
import { Reveal } from "@/components/fx/Reveal";
import { DENNIS, PACKAGES } from "@/lib/data";
import { money } from "@/lib/store";

const MARQUEE = [
  "Create your own song",
  "1 prompt · 1 request",
  "Ownership is yours",
  "Written by Dennis Lau",
  "No templates",
  "One of one",
];

export function HomePage() {
  return (
    <>
      <CinemaHero />

      {/* ---------- ACT I — NOIR: the artist ---------- */}
      <section className="section act act-noir" id="dennis">
        <div className="shell">
          <div className="act-head">
            <Reveal>
              <span className="kicker">Act I — The Artist</span>
              <h2 className="display display-lg" style={{ marginTop: 14 }}>
                One artist.
                <br />
                <span className="serif-note" style={{ textTransform: "none" }}>
                  no one else.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <span className="act-index">01 / 03</span>
            </Reveal>
          </div>

          <div className="noir-grid">
            <Reveal>
              <figure className="noir-portrait" style={{ margin: 0 }}>
                <img src={`${import.meta.env.BASE_URL}artists/dennis-lau.jpg`} alt={DENNIS.imageAlt} />
                <figcaption className="plate">
                  <div className="name">Dennis Lau</div>
                  <div className="role">{DENNIS.title}</div>
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={140}>
              <p className="lede">{DENNIS.longBio}</p>
              <p className="lede" style={{ marginTop: 18 }}>
                There is no roster to scroll, no marketplace to gamble on. When you
                brief Blesspoke, <strong style={{ color: "var(--gold-hi)" }}>Dennis Lau himself</strong> reads
                it, writes it, plays it, and signs it over to you.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
                <Link to="/brief" className="btn btn-gold">
                  Brief Dennis
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  Sign in
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- marquee ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>
              {m.split("·").map((part, j) =>
                j === 0 ? (
                  <b key={j}>{part.trim()} </b>
                ) : (
                  <span key={j}>· {part.trim()} </span>
                ),
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- ACT II — STAGE: how it works ---------- */}
      <section className="section act act-stage" id="how">
        <div className="shell">
          <div className="act-head">
            <Reveal>
              <span className="kicker">Act II — The Ritual</span>
              <h2 className="display display-lg" style={{ marginTop: 14 }}>
                1 prompt.
                <br />
                1 <span className="red-text">request</span>.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <span className="act-index">02 / 03</span>
            </Reveal>
          </div>

          <div className="steps">
            <Reveal>
              <div className="step">
                <div className="num">i.</div>
                <h3>Speak your prompt</h3>
                <p>
                  One prompt, one request. Tell Dennis who the song is for, what it
                  must say, and the moment it must carry. That single brief is the
                  whole commission.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="step">
                <div className="num">ii.</div>
                <h3>Dennis writes it</h3>
                <p>
                  He reads every brief personally. Violin, voice, arrangement —
                  composed around your words, produced in his studio, previewed to
                  you before delivery.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="step">
                <div className="num">iii.</div>
                <h3>You own it</h3>
                <p>
                  Approve the preview and the song is signed over — masters, stems,
                  and a deed of ownership with your name on it. Forever. No
                  royalties back, no fine print.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- ACT III — VAULT: ownership + packages ---------- */}
      <section className="section act act-vault" id="packages">
        <div className="shell">
          <div className="act-head">
            <Reveal>
              <span className="kicker">Act III — The Deed</span>
              <h2 className="display display-lg" style={{ marginTop: 14 }}>
                Ownership is <span className="gold-text">yours</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <span className="act-index">03 / 03</span>
            </Reveal>
          </div>

          <Reveal>
            <div className="deed" style={{ marginBottom: 54 }}>
              <div className="deed-seal">
                Bless
                <br />
                poke
              </div>
              <span className="kicker">Deed of Song Ownership</span>
              <p
                className="serif-note"
                style={{ fontSize: "clamp(19px, 2.4vw, 27px)", maxWidth: "34ch", lineHeight: 1.4 }}
              >
                “This song was written for one person, from one prompt, and belongs
                to them entirely — to keep, to gift, to release.”
              </p>
              <p className="mono-label" style={{ marginTop: 20 }}>
                Signed — Dennis Lau · Kuala Lumpur
              </p>
            </div>
          </Reveal>

          <div className="packages">
            {PACKAGES.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 120}>
                <article className={`package${pkg.featured ? " featured" : ""}`}>
                  <span className="tier">{pkg.tier}</span>
                  <h3>{pkg.name}</h3>
                  <div className="price">
                    {money(pkg.price, pkg.currency)} <small>/ song</small>
                  </div>
                  <p style={{ color: "var(--ivory-dim)", margin: 0, fontSize: 14.5 }}>
                    {pkg.blurb}
                  </p>
                  <ul>
                    {pkg.includes.map((inc) => (
                      <li key={inc}>{inc}</li>
                    ))}
                  </ul>
                  <div style={{ marginTop: "auto", paddingTop: 10 }}>
                    <Link
                      to={`/brief?package=${pkg.id}`}
                      className={`btn ${pkg.featured ? "btn-gold" : "btn-ghost"}`}
                      style={{ width: "100%" }}
                    >
                      Commission {pkg.name}
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <span className="brand">
              Bless<b>poke</b>
            </span>
            <p className="mono-label" style={{ marginTop: 12 }}>
              Create your own song
              <br />
              1 prompt · 1 request
              <br />
              Song ownership is yours
            </p>
          </div>
          <div className="mono-label">
            Dennis Lau — sole artist
            <br />
            Kuala Lumpur, Malaysia
            <br />
            <Link to="/login" style={{ color: "var(--gold)" }}>
              Sign in
            </Link>
            {" · "}
            <Link to="/brief" style={{ color: "var(--gold)" }}>
              Begin your brief
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
