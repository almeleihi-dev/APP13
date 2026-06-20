import type { TekrrDimension, TekrrProfile } from "./action.js";

export interface TekrrFieldRequirement {
  dimension: TekrrDimension;
  field: string;
}

export function computeTekrrCompleteness(
  profile: TekrrProfile,
  requiredFields: TekrrFieldRequirement[]
): number {
  if (requiredFields.length === 0) return 0;

  let filled = 0;
  for (const field of requiredFields) {
    const bucket = profile[field.dimension];
    if (!bucket) continue;
    const value = bucket[field.field];
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value) && value.length === 0) continue;
      filled++;
    }
  }
  return Math.floor((filled / requiredFields.length) * 100);
}

export function isTekrrComplete(completeness: number): boolean {
  return completeness >= 100;
}
