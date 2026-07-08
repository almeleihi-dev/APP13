import type { ActionBlueprintForm } from "./types.js";

export const ACTION_BLUEPRINT_DRAFT_KEY = "an-act-action-blueprint-draft";

export interface ActionBlueprintDraft extends ActionBlueprintForm {
  savedAt: string;
  qualityScore: number;
}

export function saveActionBlueprintDraft(draft: ActionBlueprintDraft): void {
  sessionStorage.setItem(ACTION_BLUEPRINT_DRAFT_KEY, JSON.stringify(draft));
}

export function readActionBlueprintDraft(): ActionBlueprintDraft | null {
  const raw = sessionStorage.getItem(ACTION_BLUEPRINT_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActionBlueprintDraft;
  } catch {
    return null;
  }
}

export function clearActionBlueprintDraft(): void {
  sessionStorage.removeItem(ACTION_BLUEPRINT_DRAFT_KEY);
}
