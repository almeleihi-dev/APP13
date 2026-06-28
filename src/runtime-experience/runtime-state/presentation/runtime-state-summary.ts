import type { ApplicationRuntimeSession } from "../domain/runtime-session.js";
import { OFFICIAL_RUNTIME_LIFECYCLE } from "../domain/runtime-phase.js";

export interface RuntimeStateSummarySection {
  id: string;
  label: string;
  components: Array<{
    id: string;
    componentId: string;
    props: Record<string, unknown>;
    accessibility?: { label?: string; role?: string };
  }>;
}

export function buildRuntimeStateSummary(session: ApplicationRuntimeSession): RuntimeStateSummarySection[] {
  return [
    {
      id: "state-overview",
      label: "Runtime State Summary",
      components: [
        {
          id: "current-screen",
          componentId: "core-ui-card",
          props: {
            currentScreen: session.state.currentScreen,
            previousScreen: session.state.previousScreen,
            mode: session.state.currentMode,
            phase: session.state.runtimePhase,
          },
          accessibility: { label: "Current runtime screen", role: "region" },
        },
        {
          id: "timestamps",
          componentId: "core-ui-badge",
          props: {
            launchTimestamp: session.state.launchTimestamp,
            lastActivityTimestamp: session.state.lastActivityTimestamp,
          },
          accessibility: { label: "Session timestamps", role: "status" },
        },
      ],
    },
    {
      id: "navigation-stack",
      label: "Navigation Stack",
      components: session.state.navigationStack.map((route, i) => ({
        id: `nav-${i}`,
        componentId: "core-ui-chip",
        props: { route, index: i, readOnly: true },
        accessibility: { label: `Navigation entry ${route}`, role: "listitem" },
      })),
    },
    {
      id: "lifecycle",
      label: "Lifecycle",
      components: OFFICIAL_RUNTIME_LIFECYCLE.map((label, i) => ({
        id: `lifecycle-${i}`,
        componentId: "core-ui-timeline-card",
        props: { title: label, active: session.state.runtimePhase === label.toLowerCase().replace(" ", "-") },
        accessibility: { label, role: "listitem" },
      })),
    },
  ];
}
