import type { PreviewTargetId } from "./preview-screen.js";
import type { PreviewSessionStatus } from "./preview-session.js";

export interface PreviewState {
  status: PreviewSessionStatus;
  activeTargetId?: PreviewTargetId;
  viewedCount: number;
  totalTargets: number;
  coveragePercentage: number;
  readOnly: true;
  delegated: true;
}

export function createInitialPreviewState(totalTargets: number): PreviewState {
  return {
    status: "idle",
    viewedCount: 0,
    totalTargets,
    coveragePercentage: 0,
    readOnly: true,
    delegated: true,
  };
}

export function previewCoveragePercentage(viewedCount: number, totalTargets: number): number {
  if (totalTargets <= 0) return 0;
  return Math.round((viewedCount / totalTargets) * 100);
}
