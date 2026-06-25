import type { PricingPolicy } from "./pricing-policy.js";
import type { MarketplaceListing } from "../../marketplace-compilation/domain/marketplace-listing.js";

export interface EfficiencyFactor {
  factor: number;
  platformEfficiencyGain: number;
  automationBonus: number;
  governanceBonus: number;
  summary: string;
}

export function calculateEfficiencyFactor(input: {
  listing: MarketplaceListing;
  policy: PricingPolicy;
  certificationLevel: string;
}): EfficiencyFactor {
  const automationBonus =
    input.listing.tags.some((tag) => tag.includes("domain:E") || tag.includes("domain:C"))
      ? 0.02
      : 0.0;
  const governanceBonus =
    input.certificationLevel === "gold" || input.certificationLevel === "platinum" ? 0.01 : 0.0;
  const platformEfficiencyGain = 1 - input.policy.efficiencyFactorDefault + automationBonus + governanceBonus;
  const factor = Math.min(
    0.99,
    Math.max(0.75, input.policy.efficiencyFactorDefault - automationBonus - governanceBonus)
  );

  return {
    factor,
    platformEfficiencyGain,
    automationBonus,
    governanceBonus,
    summary: `Efficiency factor ${factor.toFixed(3)} — APP13 platform efficiency reduces customer cost.`,
  };
}
