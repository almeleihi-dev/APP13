export type LiveFrameTier =
  | "PLATINUM_ELITE"
  | "EMERALD_PRO"
  | "TRUSTED"
  | "STANDARD"
  | "WATCHLIST";

export type LiveFrameColor = "platinum_gold" | "emerald" | "blue" | "gray" | "red";

export type LiveFrameRiskLevel = "minimal" | "low" | "moderate" | "elevated" | "high";

export interface LiveFrameClassification {
  frameTier: LiveFrameTier;
  frameColor: LiveFrameColor;
  frameLabel: string;
  riskLevel: LiveFrameRiskLevel;
}

export interface ProviderLiveFrame extends LiveFrameClassification {
  providerId: string;
  trustScore: number;
  generatedAt: Date;
}

export interface ProviderLiveFrameProjection extends ProviderLiveFrame {
  latestTrustScore: number;
  latestScoreChange: number;
  currentTier: LiveFrameTier;
}

function normalizeTrustScore(trustScore: number): number {
  if (!Number.isFinite(trustScore)) return 0;
  return Math.max(0, Math.min(100, Math.round(trustScore)));
}

export function classifyLiveFrame(trustScore: number): LiveFrameClassification {
  const score = normalizeTrustScore(trustScore);

  if (score >= 95) {
    return {
      frameTier: "PLATINUM_ELITE",
      frameColor: "platinum_gold",
      frameLabel: "Platinum Elite",
      riskLevel: "minimal",
    };
  }
  if (score >= 85) {
    return {
      frameTier: "EMERALD_PRO",
      frameColor: "emerald",
      frameLabel: "Emerald Pro",
      riskLevel: "low",
    };
  }
  if (score >= 70) {
    return {
      frameTier: "TRUSTED",
      frameColor: "blue",
      frameLabel: "Trusted",
      riskLevel: "moderate",
    };
  }
  if (score >= 50) {
    return {
      frameTier: "STANDARD",
      frameColor: "gray",
      frameLabel: "Standard",
      riskLevel: "elevated",
    };
  }
  return {
    frameTier: "WATCHLIST",
    frameColor: "red",
    frameLabel: "Watchlist",
    riskLevel: "high",
  };
}

export function buildLiveFrame(input: {
  providerId: string;
  trustScore: number;
  generatedAt?: Date;
}): ProviderLiveFrame {
  const trustScore = normalizeTrustScore(input.trustScore);
  return {
    providerId: input.providerId,
    trustScore,
    generatedAt: input.generatedAt ?? new Date(),
    ...classifyLiveFrame(trustScore),
  };
}
