import React, { type CSSProperties } from "react";
import { AN_ACT_TRANSITION_DURATION_MS, resolveColor } from "@an-act/tokens";

export interface ModeTransitionOverlayProps {
  active: boolean;
  direction: "need-to-action" | "action-to-need";
  progress: number;
  brandLine?: string;
  stageText?: string;
}

export function ModeTransitionOverlay({
  active,
  direction,
  progress,
  brandLine = "an act...",
  stageText,
}: ModeTransitionOverlayProps) {
  if (!active) {
    return null;
  }

  const start =
    direction === "need-to-action"
      ? resolveColor("need", "background.primary")
      : resolveColor("action", "background.primary");
  const end =
    direction === "need-to-action"
      ? resolveColor("action", "background.primary")
      : resolveColor("need", "background.primary");
  const mid = resolveColor("need", "transition.mid");

  const background =
    progress < 0.5
      ? blendHex(start, mid, progress * 2)
      : blendHex(mid, end, (progress - 0.5) * 2);

  const textColor =
    progress >= 0.5
      ? resolveColor("action", "text.primary")
      : resolveColor("need", "text.primary");

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: background,
    color: textColor,
    transition: `background-color ${AN_ACT_TRANSITION_DURATION_MS}ms ease, color ${AN_ACT_TRANSITION_DURATION_MS}ms ease`,
    fontFamily: '"SF Mono", "Menlo", "Consolas", monospace',
  };

  const barTrack: CSSProperties = {
    width: "min(320px, 80vw)",
    height: "4px",
    backgroundColor: resolveColor(progress >= 0.5 ? "action" : "need", "surface.muted"),
    borderRadius: "999px",
    overflow: "hidden",
    marginTop: "24px",
  };

  const barFill: CSSProperties = {
    width: `${Math.round(progress * 100)}%`,
    height: "100%",
    backgroundColor: resolveColor(progress >= 0.5 ? "action" : "need", "accent.primary"),
    transition: `width ${AN_ACT_TRANSITION_DURATION_MS}ms ease`,
  };

  return (
    <div data-an-act-transition={direction} style={overlayStyle} role="status" aria-live="polite">
      <div style={{ fontSize: "28px", letterSpacing: "0.08em" }}>{brandLine}</div>
      {stageText ? <div style={{ marginTop: "12px", opacity: 0.85 }}>{stageText}</div> : null}
      <div style={barTrack}>
        <div style={barFill} />
      </div>
    </div>
  );
}

function blendHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) {
    return t < 0.5 ? a : b;
  }
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return null;
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export { AN_ACT_TRANSITION_DURATION_MS };
