import type { ApplicationRuntimeSession } from "../domain/runtime-session.js";
import type { LifecycleView } from "../application/lifecycle-manager.js";
import { OFFICIAL_RUNTIME_LIFECYCLE } from "../domain/runtime-phase.js";

export function buildLifecycleViewPresentation(session: ApplicationRuntimeSession, lifecycle: LifecycleView) {
  return {
    currentPhase: lifecycle.currentPhase,
    lifecycle: OFFICIAL_RUNTIME_LIFECYCLE,
    inTransition: lifecycle.inTransition,
    finished: lifecycle.finished,
    sections: [
      {
        id: "lifecycle-view",
        label: "Lifecycle View",
        components: OFFICIAL_RUNTIME_LIFECYCLE.map((stage, i) => ({
          id: `stage-${i}`,
          componentId: "core-ui-timeline-card",
          props: {
            title: stage,
            active: stageMatchesPhase(stage, lifecycle.currentPhase),
            currentStepId: session.state.currentStepId,
          },
          accessibility: { label: stage, role: "listitem" },
        })),
      },
    ],
  };
}

function stageMatchesPhase(stage: string, phase: string): boolean {
  const normalized = stage.toLowerCase().replace(/\s+/g, "-");
  return normalized === phase || (stage === "Need Session" && phase === "need-session");
}
