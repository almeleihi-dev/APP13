import type { ApplicationRuntimeSession } from "../domain/runtime-session.js";

export function buildSessionInspector(session: ApplicationRuntimeSession) {
  return {
    sessionId: session.sessionId,
    journeySessionId: session.journeySessionId,
    userId: session.userId,
    historyLength: session.history.length,
    state: {
      currentScreen: session.state.currentScreen,
      previousScreen: session.state.previousScreen,
      currentStepId: session.state.currentStepId,
      currentMode: session.state.currentMode,
      runtimePhase: session.state.runtimePhase,
      navigationStackDepth: session.state.navigationStack.length,
      finished: session.state.finished,
    },
    context: session.state.context,
    sections: [
      {
        id: "session-meta",
        label: "Session Inspector",
        components: [
          {
            id: "session-id",
            componentId: "core-ui-badge",
            props: { sessionId: session.sessionId },
            accessibility: { label: "Session identifier", role: "status" },
          },
          {
            id: "history-count",
            componentId: "core-ui-chip",
            props: { count: session.history.length },
            accessibility: { label: "History entries", role: "status" },
          },
        ],
      },
    ],
  };
}
