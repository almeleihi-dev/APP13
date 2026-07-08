import type { ApplicationRuntimeSession } from "../domain/runtime-session.js";
import { appendStateHistoryEntry } from "../domain/runtime-session.js";
import {
  syncApplicationStateFromJourney,
  type JourneyViewSnapshot,
} from "../domain/runtime-state.js";
import { resolveApplicationPhase, resolveRuntimeMode } from "../domain/runtime-phase.js";
import type { RuntimeStateRepository } from "../infrastructure/runtime-state-repository.js";

export class SessionManager {
  constructor(private readonly repository: RuntimeStateRepository) {}

  getSession(userId: string, generatedAt: string): ApplicationRuntimeSession {
    return this.repository.getSession(userId, generatedAt);
  }

  resetSession(userId: string, generatedAt: string): ApplicationRuntimeSession {
    return this.repository.resetSession(userId, generatedAt);
  }

  syncFromJourney(
    session: ApplicationRuntimeSession,
    journey: JourneyViewSnapshot & { session_id?: string }
  ): ApplicationRuntimeSession {
    session.generatedAt = journey.generated_at ?? session.generatedAt;
    session.journeySessionId = journey.session_id ?? session.journeySessionId;
    session.state = syncApplicationStateFromJourney(session.state, journey);
    appendStateHistoryEntry(session, {
      stepId: journey.current_step,
      screenId: journey.active_screen_id,
      route: journey.active_route ?? session.state.navigationStack.at(-1) ?? "/runtime/launch",
      experience: journey.active_experience ?? "journey",
      phase: resolveApplicationPhase(journey.current_step),
      mode: resolveRuntimeMode(journey.current_step),
      timestamp: session.generatedAt,
    });
    return this.repository.saveSession(session);
  }

  save(session: ApplicationRuntimeSession): ApplicationRuntimeSession {
    return this.repository.saveSession(session);
  }
}

export function createSessionManager(repository: RuntimeStateRepository): SessionManager {
  return new SessionManager(repository);
}
