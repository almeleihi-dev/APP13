function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLauncherHome(modeCount: number, mvpReadinessPercentage: number) {
  return {
    screenId: "launcher-home",
    readOnly: true,
    sections: [
      {
        id: "launcher-home",
        label: "Runtime Launcher Home",
        components: [
          component("mode-count", "core-ui-badge", { count: modeCount }, "Launch modes"),
          component("mvp-readiness", "core-ui-progress", { percentage: mvpReadinessPercentage, readOnly: true }, "MVP readiness"),
          component("read-only", "core-ui-chip", { readOnly: true, noLaunchExecution: true }, "Read-only launcher"),
        ],
      },
    ],
  };
}

export function buildLaunchSummary(summary: Record<string, unknown>) {
  return {
    screenId: "launch-summary",
    readOnly: true,
    sections: [
      {
        id: "launch-summary",
        label: "Launch Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Launch summary")],
      },
    ],
  };
}

export function buildReadinessScreen(readiness: Record<string, unknown>) {
  return {
    screenId: "readiness-screen",
    readOnly: true,
    sections: [
      {
        id: "readiness-screen",
        label: "MVP Readiness",
        components: [component("readiness", "core-ui-progress", { ...readiness, readOnly: true }, "MVP readiness")],
      },
    ],
  };
}

export function buildLaunchChecklist(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "launch-checklist",
    readOnly: true,
    sections: [
      {
        id: "launch-checklist",
        label: "Launch Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}

export function buildMvpReadinessScreen(readiness: Record<string, unknown>, blockers: string[], warnings: string[]) {
  return {
    screenId: "mvp-readiness-screen",
    readOnly: true,
    sections: [
      {
        id: "mvp-readiness",
        label: "MVP Readiness Screen",
        components: [
          component("readiness", "core-ui-progress", { ...readiness, readOnly: true }, "MVP readiness percentage"),
          component("blockers", "core-ui-badge", { count: blockers.length, items: blockers, readOnly: true }, "Blockers"),
          component("warnings", "core-ui-badge", { count: warnings.length, items: warnings, readOnly: true }, "Warnings"),
        ],
      },
    ],
  };
}

export function buildHandoffSummary(handoff: Record<string, unknown>) {
  return {
    screenId: "handoff-summary",
    readOnly: true,
    sections: [
      {
        id: "handoff-summary",
        label: "Handoff Summary",
        components: [component("handoff", "core-ui-card", { ...handoff, readOnly: true }, "Handoff summary")],
      },
    ],
  };
}
