import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "./prefersReducedMotion";

export interface SceneHandle {
  /** Called once per frame. `progress` is 0 → 1 scroll, `elapsed` is seconds. */
  render(progress: number, elapsed: number): void;
  resize(width: number, height: number, dpr: number): void;
  dispose(): void;
}

export interface SceneContext {
  readonly canvas: HTMLCanvasElement;
  /** Scenes should hold still when true, drawing only what scroll position dictates. */
  readonly reducedMotion: boolean;
}

export type SceneFactory = (context: SceneContext) => SceneHandle;

interface SceneCanvasProps {
  factory: SceneFactory;
  progress: RefObject<number>;
  /** Described to screen readers, which cannot see the canvas. */
  label: string;
  className?: string;
}

/**
 * Hosts a WebGL scene: owns the frame loop, sizing and teardown so each concept
 * only has to describe what it draws.
 */
export function SceneCanvas({ factory, progress, label, className }: SceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = prefersReducedMotion();
    let handle: SceneHandle;
    try {
      handle = factory({ canvas, reducedMotion });
    } catch {
      // No WebGL available. The layered HTML content still reads on its own.
      canvas.hidden = true;
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const applySize = () => {
      const { clientWidth, clientHeight } = canvas;
      if (clientWidth > 0 && clientHeight > 0) {
        handle.resize(clientWidth, clientHeight, dpr);
      }
    };
    applySize();

    const observer = new ResizeObserver(applySize);
    observer.observe(canvas);

    let visible = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { rootMargin: "10%" },
    );
    visibility.observe(canvas);

    let raf = 0;
    let last = -1;
    const start = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;

      const p = progress.current;
      // With reduced motion there is nothing to animate between scroll events.
      if (reducedMotion && Math.abs(p - last) < 0.0005) return;
      last = p;

      handle.render(p, (now - start) / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      handle.dispose();
    };
  }, [factory, progress]);

  return (
    <canvas
      ref={canvasRef}
      className={`stage-canvas ${className ?? ""}`}
      role="img"
      aria-label={label}
    />
  );
}
