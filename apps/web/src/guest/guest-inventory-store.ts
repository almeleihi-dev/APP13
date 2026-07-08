import type { ActionInventoryItem } from "../lib/living-platform/types.js";
import { discoverActionInventoryFromProfessionText } from "../lib/living-platform/intelligence/professional-action-inventory-engine.js";
import { readLivingPlatformState } from "../lib/living-platform/living-platform-storage.js";
import { createLivingId, nowIso } from "../lib/living-platform/living-platform-storage.js";
import { patchGuestSession, readGuestSession } from "./guest-session.js";
import type { LaunchInputIntent } from "../launch/navigation.js";
import { buildGoalActionBreakdown } from "../lib/living-platform/intelligence/goal-action-breakdown.js";
import type { GoalActionBreakdown } from "../lib/living-platform/intelligence/goal-action-breakdown.js";

export function syncGuestInventoryFromProfession(professionText: string): ActionInventoryItem[] {
  const discovered = discoverActionInventoryFromProfessionText(professionText, readLivingPlatformState());
  patchGuestSession({
    inventory: discovered,
    professionText: professionText.trim(),
    inputIntent: "profession",
    goalText: null,
    goalBreakdown: null,
  });
  return discovered;
}

export function syncGuestGoalBreakdown(goalText: string): GoalActionBreakdown {
  const breakdown = buildGoalActionBreakdown(goalText.trim());
  patchGuestSession({
    goalBreakdown: breakdown,
    goalText: goalText.trim(),
    inputIntent: "goal",
    professionText: null,
    inventory: [],
  });
  return breakdown;
}

export function listGuestInventory(): ActionInventoryItem[] {
  return readGuestSession().inventory.filter((item) => item.status !== "removed");
}

export function activateGuestInventoryItem(inventoryId: string): ActionInventoryItem | null {
  const session = readGuestSession();
  const index = session.inventory.findIndex((item) => item.inventoryId === inventoryId);
  if (index < 0) return null;
  const current = session.inventory[index]!;
  const updated: ActionInventoryItem = {
    ...current,
    status: "active",
    bucket: "ready_now",
    activatedAt: nowIso(),
    updatedAt: nowIso(),
  };
  const inventory = [...session.inventory];
  inventory[index] = updated;
  patchGuestSession({ inventory });
  return updated;
}

export function removeGuestInventoryItem(inventoryId: string): void {
  const session = readGuestSession();
  const inventory = session.inventory.map((item) =>
    item.inventoryId === inventoryId ? { ...item, status: "removed" as const, updatedAt: nowIso() } : item,
  );
  patchGuestSession({ inventory });
}

export function editGuestInventoryItem(
  inventoryId: string,
  patch: Pick<ActionInventoryItem, "title" | "description">,
): ActionInventoryItem | null {
  const session = readGuestSession();
  const index = session.inventory.findIndex((item) => item.inventoryId === inventoryId);
  if (index < 0) return null;
  const updated: ActionInventoryItem = {
    ...session.inventory[index]!,
    ...patch,
    status: "edited",
    updatedAt: nowIso(),
  };
  const inventory = [...session.inventory];
  inventory[index] = updated;
  patchGuestSession({ inventory });
  return updated;
}

export function addGuestCustomInventoryItem(
  sourceLabel: string,
  input: { title: string; description: string; requiredProof: string },
): ActionInventoryItem {
  const now = nowIso();
  const item: ActionInventoryItem = {
    inventoryId: createLivingId("ginv"),
    title: input.title.trim(),
    description: input.description.trim() || "Custom professional action added during guest exploration.",
    confidenceScore: 68,
    bucket: "ready_now",
    requiredProof: input.requiredProof.trim() || "Self-attested ability",
    marketDemand: "moderate",
    estimatedValue: 320,
    trustRequirement: "standard",
    sourceSkill: sourceLabel.trim() || undefined,
    sourceType: "talent",
    status: "discovered",
    createdAt: now,
    updatedAt: now,
  };
  const session = readGuestSession();
  patchGuestSession({ inventory: [item, ...session.inventory] });
  return item;
}

export function recordGuestInputIntent(text: string, inputIntent: LaunchInputIntent): void {
  patchGuestSession({
    goalText: inputIntent === "goal" ? text.trim() : null,
    professionText: inputIntent === "profession" ? text.trim() : null,
    inputIntent,
  });
}
