import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/prefersReducedMotion";

/**
 * A figure that counts up the first time it is scrolled to. The numbers are the
 * proof — 420 commissions, 10,000 performances — and a number that arrives
 * rather than sits there is the cheapest thing on a page that reads expensive.
 *
 * Values are written as display strings ("10,000+", "4.98", "Five"). Anything
 * without digits in it is simply printed, so the content file never has to know
 * this component exists.
 */

const NUMERIC = /^(\D*?)([\d][\d,]*(?:\.\d+)?)(.*)$/;

interface Parsed {
  readonly prefix: string;
  readonly suffix: string;
  readonly target: number;
  readonly decimals: number;
  readonly grouped: boolean;
}

function parse(value: string): Parsed | null {
  const match = NUMERIC.exec(value);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  const dot = digits.indexOf(".");
  return {
    prefix,
    suffix,
    target,
    decimals: dot === -1 ? 0 : digits.length - dot - 1,
    grouped: digits.includes(","),
  };
}

function format(value: number, { prefix, suffix, decimals, grouped }: Parsed): string {
  const body = grouped
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : value.toFixed(decimals);
  return `${prefix}${body}${suffix}`;
}

interface TallyProps {
  value: string;
  /** Seconds. Long enough to read as deliberate, short enough not to be waited on. */
  duration?: number;
}

export function Tally({ value, duration = 1.5 }: TallyProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const parsed = parse(value);
    if (!parsed || prefersReducedMotion()) return;

    let raf = 0;
    let started = 0;

    const tick = (now: number) => {
      if (!started) started = now;
      const t = Math.min(1, (now - started) / (duration * 1000));
      // Same exponential ease as the CSS tokens: fast out, long settle.
      const eased = 1 - Math.pow(1 - t, 4);
      node.textContent = format(parsed.target * eased, parsed);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          node.textContent = format(0, parsed);
          raf = requestAnimationFrame(tick);
        }
      },
      // Zero threshold with a trimmed root, for the same reason as the reveal
      // hook: a figure inside a wipe has no visible area until the wipe runs.
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );
    observer.observe(node);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      // Whatever happened, the true value is what stays on screen.
      node.textContent = value;
    };
  }, [value, duration]);

  return (
    <span className="tally" ref={ref}>
      {value}
    </span>
  );
}
