import type { ApplicationRuntimeSession } from "../domain/runtime-session.js";
import type { RuntimeApplicationContext } from "../domain/runtime-context.js";

export class ContextManager {
  extractContext(session: ApplicationRuntimeSession): RuntimeApplicationContext {
    return session.state.context;
  }

  extractActiveContract(session: ApplicationRuntimeSession) {
    return session.state.context.contract;
  }

  extractActiveConversation(session: ApplicationRuntimeSession) {
    return session.state.context.conversation;
  }

  extractActiveTimeline(session: ApplicationRuntimeSession) {
    return session.state.context.timeline;
  }

  extractActiveNotification(session: ApplicationRuntimeSession) {
    return session.state.context.notification;
  }

  extractActiveProfile(session: ApplicationRuntimeSession) {
    return session.state.context.profile;
  }

  extractTransitionProgress(session: ApplicationRuntimeSession) {
    return session.state.transitionProgress;
  }

  extractReturnDestination(session: ApplicationRuntimeSession) {
    return session.state.returnDestination;
  }
}

export function createContextManager(): ContextManager {
  return new ContextManager();
}
