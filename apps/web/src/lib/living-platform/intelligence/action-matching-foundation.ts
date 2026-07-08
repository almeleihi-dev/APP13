import type {
  ActionInventoryItem,
  ActionMatchCandidate,
  ActionServiceRequest,
  LivingPlatformState,
} from "../types.js";
import { resolveActionCategory } from "../economy/action-category.js";
import { createLivingId } from "../living-platform-storage.js";
import { listActiveInventory, listVisibleInventory } from "./action-inventory-store.js";

function tokenOverlap(need: string, supply: string): number {
  const needTokens = need.toLowerCase().split(/\W+/).filter((token) => token.length > 3);
  const supplyTokens = supply.toLowerCase().split(/\W+/).filter((token) => token.length > 3);
  let hits = 0;
  for (const token of needTokens) {
    if (supplyTokens.some((entry) => entry.includes(token) || token.includes(entry))) hits += 1;
  }
  return hits;
}

export function matchNeedsToInventory(
  state: LivingPlatformState,
  needs: ActionServiceRequest[] = state.requests,
): ActionMatchCandidate[] {
  const supply =
    listActiveInventory(state).length > 0 ? listActiveInventory(state) : listVisibleInventory(state);

  const matches: ActionMatchCandidate[] = [];

  for (const need of needs) {
    if (need.status === "completed" || need.status === "cancelled") continue;

    let bestItem: ActionInventoryItem | null = null;
    let bestScore = 0;

    for (const item of supply) {
      const score = tokenOverlap(need.serviceName, item.title);
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    if (!bestItem || bestScore === 0) continue;

    const category = resolveActionCategory(bestItem.title);
    matches.push({
      matchId: createLivingId("match"),
      needActionName: need.serviceName,
      needRequestId: need.id,
      supplyInventoryId: bestItem.inventoryId,
      supplyTitle: bestItem.title,
      confidenceScore: Math.min(95, 55 + bestScore * 12 + bestItem.confidenceScore * 0.2),
      contractReady: bestItem.status === "active" || bestItem.bucket === "ready_now",
      suggestedContractValue: bestItem.estimatedValue || category.baseValue,
    });
  }

  return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

export function buildMatchingFoundationPresentation(state: LivingPlatformState): {
  openNeeds: number;
  supplyActions: number;
  matchCandidates: ActionMatchCandidate[];
  readyForContract: number;
} {
  const matchCandidates = matchNeedsToInventory(state);
  return {
    openNeeds: state.requests.filter((request) => request.status !== "completed" && request.status !== "cancelled")
      .length,
    supplyActions: listVisibleInventory(state).length,
    matchCandidates,
    readyForContract: matchCandidates.filter((match) => match.contractReady).length,
  };
}
