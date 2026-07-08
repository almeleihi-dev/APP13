import type { ActivePersonalIdentity } from "../../../passport/personal-identity.js";
import type { LivingPlatformState, OpportunityAlert } from "../types.js";
import { buildGoalActionBreakdown, type GoalActionBreakdown } from "./goal-action-breakdown.js";
import {
  countInventoryByBucket,
  discoverActionInventory,
} from "./professional-action-inventory-engine.js";
import { listVisibleInventory } from "./action-inventory-store.js";
import { buildMatchingFoundationPresentation } from "./action-matching-foundation.js";
import { formatOpportunityHeadline, latestGrowthSummary } from "./opportunity-intelligence-engine.js";
import { listPassportContractHistory } from "../action-contract-store.js";

export interface ActionIntelligencePresentation {
  goalBreakdown: GoalActionBreakdown | null;
  inventoryTotal: number;
  inventoryBuckets: ReturnType<typeof countInventoryByBucket>;
  inventoryItems: ReturnType<typeof listVisibleInventory>;
  growthSummary: string | null;
  opportunityAlerts: OpportunityAlert[];
  opportunityHeadlines: string[];
  matching: ReturnType<typeof buildMatchingFoundationPresentation>;
}

export function buildActionIntelligencePresentation(
  identity: ActivePersonalIdentity | null,
  state: LivingPlatformState,
  goal?: string | null,
): ActionIntelligencePresentation {
  const goalBreakdown = goal?.trim() ? buildGoalActionBreakdown(goal.trim()) : null;

  if (!identity) {
    return {
      goalBreakdown,
      inventoryTotal: 0,
      inventoryBuckets: { ready_now: 0, needs_verification: 0, unlockable: 0 },
      inventoryItems: [],
      growthSummary: latestGrowthSummary(state),
      opportunityAlerts: state.opportunityAlerts ?? [],
      opportunityHeadlines: (state.opportunityAlerts ?? []).map(formatOpportunityHeadline),
      matching: buildMatchingFoundationPresentation(state),
    };
  }

  const passportKey = identity.fullName.trim().toLowerCase();
  const contractHistory = listPassportContractHistory(passportKey);
  const discovered = discoverActionInventory(identity, state, contractHistory);
  const stored = listVisibleInventory(state);
  const inventoryItems = stored.length > 0 ? stored : discovered;

  return {
    goalBreakdown,
    inventoryTotal: inventoryItems.length,
    inventoryBuckets: countInventoryByBucket(inventoryItems),
    inventoryItems,
    growthSummary: latestGrowthSummary(state),
    opportunityAlerts: state.opportunityAlerts ?? [],
    opportunityHeadlines: (state.opportunityAlerts ?? []).map(formatOpportunityHeadline),
    matching: buildMatchingFoundationPresentation(state),
  };
}
