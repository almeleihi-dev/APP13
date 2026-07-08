import type { ActivePersonalIdentity } from "../../../passport/personal-identity.js";
import type {
  ActionInventoryItem,
  LivingPlatformState,
  PassportGrowthEvent,
} from "../types.js";
import { listPassportContractHistory } from "../action-contract-store.js";
import {
  appendLivingActivity,
  createLivingId,
  nowIso,
  patchLivingPlatformState,
} from "../living-platform-storage.js";
import { discoverActionInventory, discoverActionInventoryFromProfessionText } from "./professional-action-inventory-engine.js";
import { buildOpportunityAlerts } from "./opportunity-intelligence-engine.js";

function mergeInventoryItems(
  existing: ActionInventoryItem[],
  discovered: ActionInventoryItem[],
): { merged: ActionInventoryItem[]; newlyUnlocked: ActionInventoryItem[] } {
  const preserved = existing.filter((item) => item.status === "active" || item.status === "edited");
  const preservedTitles = new Set(preserved.map((item) => item.title.toLowerCase()));
  const removedTitles = new Set(
    existing.filter((item) => item.status === "removed").map((item) => item.title.toLowerCase()),
  );

  const newlyUnlocked: ActionInventoryItem[] = [];
  const merged: ActionInventoryItem[] = [...preserved];

  for (const item of discovered) {
    const key = item.title.toLowerCase();
    if (removedTitles.has(key)) continue;

    const prior = existing.find((entry) => entry.title.toLowerCase() === key);
    if (prior) {
      merged.push({
        ...item,
        inventoryId: prior.inventoryId,
        status: prior.status === "active" || prior.status === "edited" ? prior.status : item.status,
        activatedAt: prior.activatedAt,
        createdAt: prior.createdAt,
        updatedAt: nowIso(),
      });
      continue;
    }

    if (!preservedTitles.has(key)) {
      newlyUnlocked.push(item);
    }
    merged.push(item);
  }

  return { merged, newlyUnlocked };
}

function detectGrowthKind(identity: ActivePersonalIdentity): PassportGrowthEvent["kind"] {
  const certs = identity.certifications.join(" ").toLowerCase();
  if (certs.includes("course") || certs.includes("training")) return "course";
  if (certs.includes("cert") || certs.includes("license")) return "certificate";
  if (identity.completedActions > 0) return "contract";
  return "experience";
}

export function syncActionInventoryFromProfessionText(professionText: string): LivingPlatformState {
  return patchLivingPlatformState((state) => {
    const discovered = discoverActionInventoryFromProfessionText(professionText, state);
    const { merged, newlyUnlocked } = mergeInventoryItems(state.actionInventory ?? [], discovered);

    let next = {
      ...state,
      actionInventory: merged,
    };

    if (newlyUnlocked.length > 0) {
      const growthEvent: PassportGrowthEvent = {
        eventId: createLivingId("grow"),
        kind: "experience",
        label:
          newlyUnlocked.length === 1
            ? `${newlyUnlocked.length} new action unlocked`
            : `${newlyUnlocked.length} new actions unlocked`,
        unlockedActionCount: newlyUnlocked.length,
        unlockedActionTitles: newlyUnlocked.map((item) => item.title),
        detectedAt: nowIso(),
      };
      next = {
        ...next,
        passportGrowthEvents: [growthEvent, ...(state.passportGrowthEvents ?? [])].slice(0, 20),
      };
      next = appendLivingActivity(next, {
        kind: "inventory",
        title: `Discovered ${discovered.length} actions from profession`,
        detail: professionText.trim(),
      });
    }

    return next;
  });
}

export function syncActionInventoryForIdentity(identity: ActivePersonalIdentity): LivingPlatformState {
  const passportKey = identity.fullName.trim().toLowerCase();
  const contractHistory = listPassportContractHistory(passportKey);

  return patchLivingPlatformState((state) => {
    const discovered = discoverActionInventory(identity, state, contractHistory);
    const { merged, newlyUnlocked } = mergeInventoryItems(state.actionInventory ?? [], discovered);

    let next = {
      ...state,
      actionInventory: merged,
      opportunityAlerts: buildOpportunityAlerts(identity, { ...state, actionInventory: merged }),
    };

    if (newlyUnlocked.length > 0) {
      const growthEvent: PassportGrowthEvent = {
        eventId: createLivingId("grow"),
        kind: detectGrowthKind(identity),
        label:
          newlyUnlocked.length === 1
            ? `${newlyUnlocked.length} new action unlocked`
            : `${newlyUnlocked.length} new actions unlocked`,
        unlockedActionCount: newlyUnlocked.length,
        unlockedActionTitles: newlyUnlocked.map((item) => item.title),
        detectedAt: nowIso(),
      };
      next = {
        ...next,
        passportGrowthEvents: [growthEvent, ...(state.passportGrowthEvents ?? [])].slice(0, 20),
      };
      next = appendLivingActivity(next, {
        kind: "growth",
        title: growthEvent.label,
        detail: newlyUnlocked.map((item) => item.title).join(" · "),
      });
    }

    return next;
  });
}

export function activateInventoryItem(inventoryId: string): ActionInventoryItem | null {
  let updated: ActionInventoryItem | null = null;
  patchLivingPlatformState((state) => {
    const index = state.actionInventory.findIndex((item) => item.inventoryId === inventoryId);
    if (index < 0) return state;
    const current = state.actionInventory[index]!;
    updated = {
      ...current,
      status: "active",
      bucket: "ready_now",
      activatedAt: nowIso(),
      updatedAt: nowIso(),
    };
    const actionInventory = [...state.actionInventory];
    actionInventory[index] = updated;
    return appendLivingActivity({ ...state, actionInventory }, {
      kind: "inventory",
      title: "Action activated",
      detail: updated.title,
    });
  });
  return updated;
}

export function removeInventoryItem(inventoryId: string): void {
  patchLivingPlatformState((state) => {
    const index = state.actionInventory.findIndex((item) => item.inventoryId === inventoryId);
    if (index < 0) return state;
    const current = state.actionInventory[index]!;
    const actionInventory = [...state.actionInventory];
    actionInventory[index] = { ...current, status: "removed", updatedAt: nowIso() };
    return appendLivingActivity({ ...state, actionInventory }, {
      kind: "inventory",
      title: "Action removed from inventory",
      detail: current.title,
    });
  });
}

export function editInventoryItem(
  inventoryId: string,
  patch: Pick<ActionInventoryItem, "title" | "description">,
): ActionInventoryItem | null {
  let updated: ActionInventoryItem | null = null;
  patchLivingPlatformState((state) => {
    const index = state.actionInventory.findIndex((item) => item.inventoryId === inventoryId);
    if (index < 0) return state;
    const current = state.actionInventory[index]!;
    updated = {
      ...current,
      ...patch,
      status: "edited",
      updatedAt: nowIso(),
    };
    const actionInventory = [...state.actionInventory];
    actionInventory[index] = updated;
    return { ...state, actionInventory };
  });
  return updated;
}

export function addCustomInventoryItemFromSource(
  sourceLabel: string,
  input: { title: string; description: string; requiredProof: string },
): ActionInventoryItem {
  const now = nowIso();
  const item: ActionInventoryItem = {
    inventoryId: createLivingId("inv"),
    title: input.title.trim(),
    description: input.description.trim() || "Custom professional action added by user.",
    confidenceScore: 68,
    bucket: "ready_now",
    requiredProof: input.requiredProof.trim() || "Self-attested ability",
    marketDemand: "moderate",
    estimatedValue: 320,
    trustRequirement: "standard",
    sourceSkill: sourceLabel.trim() || undefined,
    sourceType: "talent",
    status: "active",
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  patchLivingPlatformState((state) =>
    appendLivingActivity(
      { ...state, actionInventory: [item, ...state.actionInventory] },
      { kind: "inventory", title: "Ability added to inventory", detail: item.title },
    ),
  );

  return item;
}

export function addCustomInventoryItem(
  identity: ActivePersonalIdentity,
  input: { title: string; description: string; requiredProof: string },
): ActionInventoryItem {
  return addCustomInventoryItemFromSource(identity.mainSkill.trim() || identity.professionalTitle, input);
}

export function listActiveInventory(state: LivingPlatformState): ActionInventoryItem[] {
  return state.actionInventory.filter((item) => item.status === "active" || item.status === "edited");
}

export function listVisibleInventory(state: LivingPlatformState): ActionInventoryItem[] {
  return state.actionInventory.filter((item) => item.status !== "removed");
}
