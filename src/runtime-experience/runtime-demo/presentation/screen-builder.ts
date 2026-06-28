import type { DemoScenario } from "../domain/demo-scenario.js";
import type { DemoSession } from "../domain/demo-session.js";
import { scenarioProgress } from "../domain/demo-scenario.js";

function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildDemoHome(scenarioCount: number) {
  return {
    screenId: "demo-home",
    readOnly: true,
    sections: [
      {
        id: "demo-home",
        label: "Runtime Demo Home",
        components: [
          component("scenario-count", "core-ui-badge", { count: scenarioCount }, "Available scenarios"),
          component("read-only", "core-ui-chip", { readOnly: true, simulated: true }, "Read-only demo"),
        ],
      },
    ],
  };
}

export function buildDemoJourney(scenario: DemoScenario, session: DemoSession) {
  return {
    screenId: "demo-journey",
    readOnly: true,
    sections: [
      {
        id: "demo-journey",
        label: scenario.title,
        components: [
          component("scenario", "core-ui-card", { ...scenario, progress: scenarioProgress(session.currentStepIndex, session.stepIndices.length) }, scenario.title),
        ],
      },
    ],
  };
}

export function buildDemoStep(stepLabel: string, route: string, experience: string) {
  return {
    screenId: "demo-step",
    readOnly: true,
    sections: [
      {
        id: "demo-step",
        label: "Current Demo Step",
        components: [component("step", "core-ui-timeline-card", { stepLabel, route, experience, readOnly: true }, stepLabel)],
      },
    ],
  };
}

export function buildDemoSummary(summary: Record<string, unknown>) {
  return {
    screenId: "demo-summary",
    readOnly: true,
    sections: [
      {
        id: "demo-summary",
        label: "Runtime Demo Summary",
        components: [component("summary", "core-ui-card", summary, "Demo summary")],
      },
    ],
  };
}

export function buildDemoControls(status: string, availableControls: string[]) {
  return {
    screenId: "demo-controls",
    readOnly: true,
    sections: [
      {
        id: "demo-controls",
        label: "Demo Controls",
        components: availableControls.map((control) =>
          component(`control-${control}`, "core-ui-chip", { control, status, readOnly: true }, control)
        ),
      },
    ],
  };
}
