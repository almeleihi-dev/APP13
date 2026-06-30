import type { LiveFramePresentation, LiveFrameUiTier, SemanticColorTokenPath } from "./types.js";
import { resolveColor } from "./token-resolver.js";

/** Maps trust tier labels from backend to Live Frame v1.0 UI tiers. Presentation only. */
export const TRUST_TIER_TO_UI_TIER: Record<string, LiveFrameUiTier> = {
  PLATINUM_ELITE: "diamond",
  EMERALD_PRO: "platinum",
  SAPPHIRE_VERIFIED: "gold",
  STANDARD: "silver",
  RESTRICTED: "bronze",
};

export const LIVE_FRAME_TIER_ACCENT: Record<LiveFrameUiTier, SemanticColorTokenPath> = {
  diamond: "accent.highlight",
  platinum: "accent.primary",
  gold: "status.warning",
  silver: "text.secondary",
  bronze: "status.error",
};

export const LIVE_FRAME_TIER_LABEL: Record<LiveFrameUiTier, string> = {
  diamond: "Diamond Live Frame",
  platinum: "Platinum Live Frame",
  gold: "Gold Live Frame",
  silver: "Silver Live Frame",
  bronze: "Bronze Live Frame",
};

export interface LiveFrameInput {
  trustTier?: string;
  uiTier?: LiveFrameUiTier;
  mode?: "need" | "action" | "transition";
}

export function resolveLiveFrameUiTier(input: LiveFrameInput): LiveFrameUiTier {
  if (input.uiTier) {
    return input.uiTier;
  }
  if (input.trustTier && TRUST_TIER_TO_UI_TIER[input.trustTier]) {
    return TRUST_TIER_TO_UI_TIER[input.trustTier]!;
  }
  return "silver";
}

export function resolveLiveFramePresentation(input: LiveFrameInput): LiveFramePresentation {
  const uiTier = resolveLiveFrameUiTier(input);
  const mode = input.mode ?? "need";
  const accentToken = LIVE_FRAME_TIER_ACCENT[uiTier];
  return {
    uiTier,
    accentToken,
    accentColor: resolveColor(mode, accentToken),
    label: LIVE_FRAME_TIER_LABEL[uiTier],
  };
}
