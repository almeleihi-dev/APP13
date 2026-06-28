import type { RuntimeJourneySession } from "../domain/runtime-session.js";
import { OFFICIAL_RUNTIME_JOURNEY_FLOW } from "../domain/runtime-journey.js";
import { RUNTIME_JOURNEY_STEPS } from "../domain/runtime-step.js";

export interface RuntimeJourneyPresentationSection {
  id: string;
  label: string;
  purpose: string;
  components: Array<{
    id: string;
    componentId: string;
    variant?: string;
    props: Record<string, unknown>;
    accessibility?: { label?: string; role?: string; tabIndex?: number };
  }>;
}

function buildComponent(input: {
  id: string;
  componentId: string;
  props: Record<string, unknown>;
  label?: string;
  role?: string;
}) {
  return {
    id: input.id,
    componentId: input.componentId,
    props: input.props,
    accessibility: { label: input.label, role: input.role, tabIndex: 0 },
  };
}

export function buildFirstUserJourneySections(): RuntimeJourneyPresentationSection[] {
  return [
    {
      id: "journey-overview",
      label: "First User Journey",
      purpose: "Complete deterministic runtime journey from launch through return.",
      components: OFFICIAL_RUNTIME_JOURNEY_FLOW.map((label, i) =>
        buildComponent({
          id: `flow-${i}`,
          componentId: "core-ui-card",
          props: { title: label, stepIndex: i, readOnly: true },
          label,
          role: "listitem",
        })
      ),
    },
    {
      id: "experience-map",
      label: "Experience Map",
      purpose: "Runtime experiences consumed without duplication.",
      components: RUNTIME_JOURNEY_STEPS.filter((s) => s.experience !== "journey").map((step) =>
        buildComponent({
          id: `exp-${step.id}`,
          componentId: "core-ui-badge",
          props: { label: step.experience, route: step.route, screenId: step.screenId },
          label: `${step.label} via ${step.experience}`,
          role: "status",
        })
      ),
    },
  ];
}

export function buildReturnJourneySections(session: RuntimeJourneySession): RuntimeJourneyPresentationSection[] {
  return [
    {
      id: "return-transition",
      label: "Return Transition",
      purpose: "Return from action completion to need mode.",
      components: [
        buildComponent({
          id: "return-context",
          componentId: "core-ui-card",
          props: {
            fromExperience: session.state.returnContext.fromExperience,
            returnRoute: session.state.returnContext.returnRoute,
            completed: session.state.returnContext.completed,
          },
          label: "Return context",
        }),
      ],
    },
    {
      id: "return-flow",
      label: "Return Flow",
      purpose: "Completion through return transition to need home.",
      components: ["Completion", "Return Transition", "Need Home"].map((label, i) =>
        buildComponent({
          id: `return-${i}`,
          componentId: "core-ui-timeline-card",
          props: { title: label, readOnly: true },
          label,
          role: "listitem",
        })
      ),
    },
  ];
}

export function buildSessionSummarySections(session: RuntimeJourneySession): RuntimeJourneyPresentationSection[] {
  return [
    {
      id: "session-summary",
      label: "Session Summary",
      purpose: "Current runtime journey session state.",
      components: [
        buildComponent({
          id: "session-id",
          componentId: "core-ui-badge",
          props: { label: session.sessionId },
          label: `Session ${session.sessionId}`,
          role: "status",
        }),
        buildComponent({
          id: "current-step",
          componentId: "core-ui-card",
          props: {
            stepId: session.state.currentStepId,
            stepIndex: session.state.currentStepIndex,
            phase: session.state.lifecyclePhase,
          },
          label: `Current step: ${session.state.currentStepId}`,
        }),
        buildComponent({
          id: "active-experience",
          componentId: "core-ui-chip",
          props: {
            experience: session.activeExperience,
            screenId: session.activeScreenId,
            route: session.activeRoute,
          },
          label: session.activeExperience ?? "none",
          role: "status",
        }),
      ],
    },
    {
      id: "handoff-context",
      label: "Handoff Context",
      purpose: "Preserved handoff between experiences.",
      components: [
        buildComponent({
          id: "handoff",
          componentId: "core-ui-card",
          props: { handoff: session.state.handoff, readOnly: true },
          label: "Handoff context",
        }),
      ],
    },
    {
      id: "history-count",
      label: "History",
      purpose: "Journey step history.",
      components: [
        buildComponent({
          id: "history",
          componentId: "core-ui-badge",
          props: { count: session.history.length },
          label: `${session.history.length} steps recorded`,
          role: "status",
        }),
      ],
    },
  ];
}

export function buildRuntimeJourneyPresentation(session: RuntimeJourneySession) {
  return {
    firstUserJourney: buildFirstUserJourneySections(),
    returnJourney: buildReturnJourneySections(session),
    sessionSummary: buildSessionSummarySections(session),
  };
}
