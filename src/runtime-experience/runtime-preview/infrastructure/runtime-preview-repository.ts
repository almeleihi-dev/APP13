import type { PreviewSession } from "../domain/preview-session.js";
import { createPreviewSession } from "../domain/preview-session.js";

export class RuntimePreviewRepository {
  private readonly sessions = new Map<string, PreviewSession>();

  getSession(userId: string, generatedAt: string): PreviewSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, createPreviewSession(userId, generatedAt));
    }
    return this.sessions.get(userId)!;
  }

  saveSession(session: PreviewSession): PreviewSession {
    this.sessions.set(session.userId, {
      ...session,
      viewedTargetIds: [...session.viewedTargetIds],
    });
    return this.getSession(session.userId, session.generatedAt);
  }

  resetSession(userId: string, generatedAt: string): PreviewSession {
    const session = createPreviewSession(userId, generatedAt);
    this.sessions.set(userId, session);
    return session;
  }
}

export function createRuntimePreviewRepository(): RuntimePreviewRepository {
  return new RuntimePreviewRepository();
}
