import type { ReactNode } from "react";
import { ScrollStage } from "../lib/ScrollStage";

/**
 * A run of content that travels sideways while the page travels down.
 *
 * On Dragon this is not a trick: the concept is built on a hand scroll, and a
 * hand scroll is read by unrolling it. Pinning the frame and pulling the record
 * across it is the most literal thing this site does, and the most satisfying.
 *
 * All of the machinery already exists — ScrollStage pins the frame and publishes
 * `--p` — so this is a track wide enough to overflow and one transform keyed off
 * that. Nothing measures anything: `100vw - 100%` is the exact distance the track
 * has to travel, whatever it ends up containing.
 */

interface HandscrollProps {
  /** Length of the scroll track, in viewport heights. Longer reads slower. */
  readonly vh?: number;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Handscroll({ vh = 320, className, children }: HandscrollProps) {
  return (
    <ScrollStage vh={vh} cuts={1} className={`handscroll ${className ?? ""}`}>
      {() => (
        <div className="handscroll-frame">
          <div className="handscroll-track">{children}</div>
        </div>
      )}
    </ScrollStage>
  );
}
