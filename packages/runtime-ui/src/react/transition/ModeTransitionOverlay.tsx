import React, { type CSSProperties } from "react";
import {
  AN_ACT_BRAND_LINE,
  AN_ACT_TRANSITION_DURATION_MS,
  loadTokensPayload,
  resolveColor,
  resolveTypography,
} from "@an-act/tokens";

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
  brandLine = AN_ACT_BRAND_LINE,
  stageText,
}: ModeTransitionOverlayProps) {
  if (!active) {
    return null;
  }

  const tokens = loadTokensPayload();
  const forward = direction === "need-to-action";
  const start = resolveColor(forward ? "need" : "action", "transition.start");
  const mid = resolveColor("need", "transition.mid");
  const end = resolveColor(forward ? "action" : "need", "transition.end");

  const background = progress < 0.5 ? blendHex(start, mid, progress * 2) : blendHex(mid, end, (progress - 0.5) * 2);

  const textColor = progress >= 0.5 ? resolveColor("action", "text.primary") : resolveColor("need", "text.primary");
  const trackMode = progress >= 0.5 ? "action" : "need";
  const terminal = resolveTypography("terminal");

  const overlayStyle: CSSProperties = {
    backgroundColor: background,
    color: textColor,
    transition: `background-color ${AN_ACT_TRANSITION_DURATION_MS}ms ${tokens.motion.easing.emphasized}, color ${AN_ACT_TRANSITION_DURATION_MS}ms ${tokens.motion.easing.emphasized}`,
    fontFamily: terminal.fontFamily,
  };

  return (
    <div
      className="an-act-transition-overlay"
      data-an-act-transition={direction}
      style={overlayStyle}
      role="status"
      aria-live="polite"
    >
      <div className="an-act-transition-overlay__brand">{brandLine}</div>
      {stageText ? <div className="an-act-transition-overlay__stage">{stageText}</div> : null}
      <div
        className="an-act-brand-loading__bar"
        style={{ marginTop: "var(--an-act-spacing-space-24)" }}
        aria-hidden="true"
      >
        <div
          className="an-act-brand-loading__bar-fill"
          style={{
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: resolveColor(trackMode, "accent.primary"),
          }}
        />
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
