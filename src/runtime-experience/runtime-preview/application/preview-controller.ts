import type { AuthContext } from "../../../shared/auth/index.js";
import { PREVIEW_FIXED_TIMESTAMP } from "../domain/runtime-preview.js";
import { PREVIEW_TARGET_IDS, isPreviewTargetId, type PreviewTargetId } from "../domain/preview-screen.js";
import type { PreviewSession } from "../domain/preview-session.js";
import { previewCoveragePercentage } from "../domain/preview-state.js";
import type { RuntimePreviewRepository } from "../infrastructure/runtime-preview-repository.js";
import type { PreviewBuilder } from "./preview-builder.js";

export class PreviewController {
  constructor(
    private readonly repository: RuntimePreviewRepository,
    private readonly builder: PreviewBuilder
  ) {}

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, PREVIEW_FIXED_TIMESTAMP);
    return {
      session,
      coverage: previewCoveragePercentage(session.viewedTargetIds.length, PREVIEW_TARGET_IDS.length),
    };
  }

  selectTarget(authContext: AuthContext, targetId: string) {
    if (!isPreviewTargetId(targetId)) {
      return { ok: false as const, error: "Unknown preview target" };
    }
    const session = this.repository.getSession(authContext.userId, PREVIEW_FIXED_TIMESTAMP);
    const preview = this.builder.buildTargetPreview(authContext, targetId);
    const updated: PreviewSession = {
      ...session,
      status: "active",
      activeTargetId: targetId,
      viewedTargetIds: session.viewedTargetIds.includes(targetId)
        ? session.viewedTargetIds
        : [...session.viewedTargetIds, targetId],
      updatedAt: PREVIEW_FIXED_TIMESTAMP,
    };
    this.repository.saveSession(updated);
    return {
      ok: true as const,
      session: updated,
      preview,
      coverage: previewCoveragePercentage(updated.viewedTargetIds.length, PREVIEW_TARGET_IDS.length),
    };
  }

  getActivePreview(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, PREVIEW_FIXED_TIMESTAMP);
    if (!session.activeTargetId) {
      return { ok: false as const, error: "No active preview target" };
    }
    const preview = this.builder.buildTargetPreview(authContext, session.activeTargetId);
    return { ok: true as const, session, preview };
  }

  resetSession(authContext: AuthContext) {
    const session = this.repository.resetSession(authContext.userId, PREVIEW_FIXED_TIMESTAMP);
    return { ok: true as const, session };
  }

  buildAllPreviews(authContext: AuthContext) {
    return PREVIEW_TARGET_IDS.map((targetId) => ({
      targetId,
      preview: this.builder.buildTargetPreview(authContext, targetId as PreviewTargetId),
    }));
  }
}

export function createPreviewController(
  repository: RuntimePreviewRepository,
  builder: PreviewBuilder
): PreviewController {
  return new PreviewController(repository, builder);
}
