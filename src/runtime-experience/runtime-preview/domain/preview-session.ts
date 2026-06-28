import type { PreviewTargetId } from "./preview-screen.js";

export type PreviewSessionStatus = "idle" | "active" | "completed";

export interface PreviewSession {
  userId: string;
  generatedAt: string;
  status: PreviewSessionStatus;
  activeTargetId?: PreviewTargetId;
  viewedTargetIds: PreviewTargetId[];
  createdAt: string;
  updatedAt: string;
}

export function createPreviewSession(userId: string, generatedAt: string): PreviewSession {
  return {
    userId,
    generatedAt,
    status: "idle",
    viewedTargetIds: [],
    createdAt: generatedAt,
    updatedAt: generatedAt,
  };
}
