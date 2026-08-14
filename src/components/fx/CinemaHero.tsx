import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Scroll-cinema hero: a 420vh wrapper with a sticky stage.
 * Scroll progress scrubs a canvas "performance" (spotlight, gold dust,
 * violin strings, light sweeps) while kinetic lines cut in and out —
 * the short-form promo feel, driven by the scrollbar.
 */

const LINES = [
  {
    at: 0.04,
    span: 0.2,
    kicker: "Blesspoke · by Dennis Lau",
    body: (
      <>
        Create your <em>own</em> song
      </>
    ),
  },
  {
    at: 0.29,
    span: 0.2,
    kicker: "No catalogues · no templates",
    body: (
      <>
        1 prompt <span className="gold-text">·</span> 1 <em>request</em>
      </>
    ),
  },
  {
    at: 0.54,
    span: 0.2,
    kicker: "Signed deed · stems · masters",
    body: (
      <>
        Song ownership is <em>yours</em>
      </>
    ),
  },
  {
    at: 0.79,
    span: 0.19,
    kicker: "One artist · one song · one owner",
    body: (
      <>
        Bless<span className="gold-text">poke</span>
      </>
    ),
  },
];

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  tw: number;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

/** Opacity envelope for a line active at `at` for `span`. */
function lineOpacity(t: number, at: number, span: number) {
  const fade = 0.045;
  if (t < at - fade || t > at + span + fade) return 0;
  if (t < at) return ease((t - (at - fade)) / fade);
  if (t > at + span) return ease(1 - (t - (at + span)) / fade);
  return 1;
}

export function CinemaHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const particles: Particle[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles();
    };

    const seedParticles = () => {
      particles.length = 0;
      const count = Math.round((w * h) / 16000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.08 - Math.random() * 0.3,
          tw: Math.random() * Math.PI * 2,
        });
      }
    };

    const progress = () => {
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      return clamp01(-rect.top / Math.max(1, total));
    };

    const draw = (now: number) => {
      const t = reduced ? 0.85 : progress();
      const time = now / 1000;

      // --- stage wash ---
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.46;

      // spotlight follows the performance
      const spotX = cx + Math.sin(t * Math.PI * 2.2) * w * 0.16;
      const spot = ctx.createRadialGradient(spotX, cy, 0, spotX, cy, Math.max(w, h) * 0.55);
      const spotPower = 0.1 + 0.16 * Math.sin(t * Math.PI);
      spot.addColorStop(0, `rgba(214,173,92,${spotPower})`);
      spot.addColorStop(0.5, "rgba(20,16,10,0.2)");
      spot.addColorStop(1, "rgba(8,8,10,0)");
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      // red sweep in the final act
      if (t > 0.72) {
        const sweep = ease(clamp01((t - 0.72) / 0.12));
        const gx = ctx.createLinearGradient(0, 0, w, 0);
        gx.addColorStop(0, "rgba(200,30,58,0)");
        gx.addColorStop(clamp01(sweep - 0.18), "rgba(200,30,58,0)");
        gx.addColorStop(sweep, `rgba(200,30,58,${0.16 * (1 - t * 0.4)})`);
        gx.addColorStop(clamp01(sweep + 0.18), "rgba(200,30,58,0)");
        gx.addColorStop(1, "rgba(200,30,58,0)");
        ctx.fillStyle = gx;
        ctx.fillRect(0, 0, w, h);
      }

      // --- violin strings ---
      const stringPhase = ease(clamp01((t - 0.22) / 0.14));
      if (stringPhase > 0) {
        const strings = 5;
        const amp =
          (4 + 26 * Math.sin(t * Math.PI)) * stringPhase * (0.6 + 0.4 * Math.sin(time * 1.4));
        for (let s = 0; s < strings; s++) {
          const yBase = cy + (s - (strings - 1) / 2) * Math.min(46, h * 0.055);
          const freq = 2.2 + s * 0.7;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 6) {
            const envelope = Math.sin((x / w) * Math.PI);
            const y =
              yBase +
              Math.sin((x / w) * Math.PI * freq * 2 + time * (2 + s * 0.35)) *
                amp *
                envelope;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          const gold = s === 2;
          ctx.strokeStyle = gold
            ? `rgba(214,173,92,${0.5 * stringPhase})`
            : `rgba(244,239,230,${0.14 * stringPhase})`;
          ctx.lineWidth = gold ? 1.6 : 1;
          ctx.stroke();
        }
      }

      // --- gold dust ---
      const dustPower = 0.35 + 0.65 * Math.sin(t * Math.PI);
      for (const p of particles) {
        p.x += p.vx + Math.sin(time * 0.6 + p.tw) * 0.08;
        p.y += p.vy * (0.5 + dustPower);
        if (p.y < -6) {
          p.y = h + 6;
          p.x = Math.random() * w;
        }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * 1.3 + p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,200,126,${0.32 * twinkle * dustPower})`;
        ctx.fill();
      }

      // --- ownership ring (act 3) ---
      const ringPhase = ease(clamp01((t - 0.5) / 0.16)) * (1 - ease(clamp01((t - 0.76) / 0.08)));
      if (ringPhase > 0.01) {
        const ringR = Math.min(w, h) * (0.16 + 0.05 * Math.sin(time * 0.8));
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(214,173,92,${0.55 * ringPhase})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, ringR * 0.82, time * 0.3, time * 0.3 + Math.PI * 1.4);
        ctx.strokeStyle = `rgba(238,217,164,${0.35 * ringPhase})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // --- finale glow ---
      if (t > 0.78) {
        const g = ease(clamp01((t - 0.78) / 0.14));
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.42);
        glow.addColorStop(0, `rgba(214,173,92,${0.2 * g})`);
        glow.addColorStop(1, "rgba(8,8,10,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // --- kinetic lines + progress UI (imperative, no re-render) ---
      LINES.forEach((line, i) => {
        const el = lineRefs.current[i];
        if (!el) return;
        const o = reduced ? (i === LINES.length - 1 ? 1 : 0) : lineOpacity(t, line.at, line.span);
        el.style.opacity = String(o);
        const drift = (t - line.at) * 60;
        el.style.transform = `translateY(${-drift}px) scale(${0.97 + o * 0.03})`;
      });

      const ctaO = reduced ? 1 : ease(clamp01((t - 0.88) / 0.08));
      if (ctaRef.current) {
        ctaRef.current.style.opacity = String(ctaO);
        ctaRef.current.style.pointerEvents = ctaO > 0.6 ? "auto" : "none";
        ctaRef.current.style.transform = `translateY(${(1 - ctaO) * 18}px)`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(1 - ease(clamp01(t / 0.06)));
      }
      if (fillRef.current) {
        fillRef.current.style.width = `${t * 100}%`;
      }
      if (counterRef.current) {
        counterRef.current.textContent = `${String(Math.round(t * 100)).padStart(3, "0")} / 100`;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="cinema" ref={wrapRef} aria-label="Blesspoke — create your own song">
      <div className="cinema-stage">
        <canvas ref={canvasRef} className="cinema-canvas" aria-hidden="true" />
        <div className="cinema-vignette" aria-hidden="true" />
        <div className="cinema-grain" aria-hidden="true" />

        <div className="cinema-copy">
          {LINES.map((line, i) => (
            <div
              key={i}
              className="cinema-line"
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
            >
              <div className="cinema-line-inner">
                <span className="kicker">{line.kicker}</span>
                <h1 className="cinema-word">{line.body}</h1>
              </div>
            </div>
          ))}

          <div
            ref={ctaRef}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "66%",
              display: "flex",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            <Link to="/brief" className="btn btn-gold">
              Begin your brief
            </Link>
            <Link to="/#how" className="btn btn-ghost">
              How it works
            </Link>
          </div>
        </div>

        <div className="cinema-scrollhint" ref={hintRef}>
          <span className="dot" />
          <span className="mono-label">Scroll to play</span>
        </div>
        <div className="cinema-progress" aria-hidden="true">
          <div className="track">
            <div className="fill" ref={fillRef} />
          </div>
        </div>
        <div className="cinema-counter">
          <span ref={counterRef}>000 / 100</span>
        </div>
      </div>
    </div>
  );
}
