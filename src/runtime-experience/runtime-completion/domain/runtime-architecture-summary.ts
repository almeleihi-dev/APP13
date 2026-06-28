export interface RuntimeArchitectureSummary {
  chapter: "CH3";
  title: "AN ACT Runtime Experience Architecture";
  layers: Array<{ id: string; label: string; chapterCode: string; role: string }>;
  principles: string[];
  moduleCount: number;
  readOnly: true;
  delegated: true;
}

export function buildRuntimeArchitectureSummary(moduleCount: number): RuntimeArchitectureSummary {
  return {
    chapter: "CH3",
    title: "AN ACT Runtime Experience Architecture",
    layers: [
      { id: "experiences", label: "Experience Layer", chapterCode: "CH3-X5", role: "Need, Action, Contract, Chat, Timeline, Notification, Profile experiences" },
      { id: "journey-state", label: "Journey & State Layer", chapterCode: "CH3-X12", role: "Runtime journey orchestration and state engine" },
      { id: "registry-coordination", label: "Registry & Coordination Layer", chapterCode: "CH3-X14", role: "Runtime registry, coordinator, health, demo, preview" },
      { id: "launch-release", label: "Launch & Release Layer", chapterCode: "CH3-X19", role: "Launcher and release readiness" },
      { id: "operations-governance", label: "Operations & Governance Layer", chapterCode: "CH3-X21", role: "Operations, executive, readiness, certification, final readiness" },
      { id: "approval-operations", label: "Approval & Operations Center Layer", chapterCode: "CH3-X26", role: "Production approval and operations center" },
      { id: "launch-authority", label: "Launch Authority Layer", chapterCode: "CH3-X28", role: "Launch control, readiness authority, executive launch authority" },
      { id: "completion", label: "Completion & Certification Layer", chapterCode: "CH3-FINAL", role: "Official Chapter 3 completion and certification hand-off to CH4" },
    ],
    principles: [
      "Clean architecture: domain, application, presentation, infrastructure, validation",
      "Read-only runtime experience layers with delegates-only aggregation",
      "No business logic duplication across modules",
      "Deterministic timestamps and memoized dependency validation",
      "Authentication required on all runtime experience endpoints",
    ],
    moduleCount,
    readOnly: true,
    delegated: true,
  };
}
