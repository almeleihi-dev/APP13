import type { NegotiationAnalysisContext } from "./types.js";

const PRICE_GAP_SUGGESTION_THRESHOLD = 10;
const LARGE_SCOPE_THRESHOLD = 5;

const COMPROMISE_CATALOG = {
  priceGap:
    "Consider splitting delivery into milestones to bridge the remaining price difference.",
  timeGap: "Increase timeline to reduce cost pressure and align delivery expectations.",
  riskHigh:
    "Use milestone escrow with acceptance checkpoints before releasing later payments.",
  scopeLarge:
    "Reduce initial scope and deliver remaining items in phase two after core acceptance.",
  midpoint:
    "Move both parties closer to the recommended midpoint price to preserve delivery quality.",
} as const;

export function generateCompromises(context: NegotiationAnalysisContext): string[] {
  const compromises: string[] = [];

  if (context.price_gap_percent > PRICE_GAP_SUGGESTION_THRESHOLD) {
    compromises.push(COMPROMISE_CATALOG.priceGap);
  }

  if (context.days_gap !== null && context.days_gap > 0) {
    compromises.push(COMPROMISE_CATALOG.timeGap);
  }

  if (context.risk_profile === "high") {
    compromises.push(COMPROMISE_CATALOG.riskHigh);
  }

  if (context.scope_items >= LARGE_SCOPE_THRESHOLD) {
    compromises.push(COMPROMISE_CATALOG.scopeLarge);
  }

  if (context.price_gap_percent > 30) {
    compromises.push(COMPROMISE_CATALOG.midpoint);
  }

  if (compromises.length === 0) {
    compromises.push(
      "Confirm scope boundaries and acceptance criteria so both parties can finalize at the recommended midpoint."
    );
  }

  return compromises.slice(0, 5);
}
