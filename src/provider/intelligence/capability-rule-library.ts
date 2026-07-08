import type { CapabilityLevel } from "./types.js";

const LEVEL_BASE_SCORE: Record<CapabilityLevel, number> = {
  junior: 45,
  professional: 62,
  senior: 78,
  expert: 90,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function resolveCapabilityLevel(yearsExperience: number): CapabilityLevel {
  if (yearsExperience <= 2) return "junior";
  if (yearsExperience <= 5) return "professional";
  if (yearsExperience <= 10) return "senior";
  return "expert";
}

export function calculateCapabilityScore(
  level: CapabilityLevel,
  yearsExperience: number
): number {
  const experienceBonus = Math.min(5, Math.max(0, yearsExperience));
  return clampScore(LEVEL_BASE_SCORE[level] + experienceBonus);
}

export function buildCapabilityProfile(yearsExperience: number) {
  const level = resolveCapabilityLevel(yearsExperience);
  return {
    level,
    capability_score: calculateCapabilityScore(level, yearsExperience),
  };
}
