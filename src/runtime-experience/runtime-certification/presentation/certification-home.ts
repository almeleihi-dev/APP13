function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildCertificationHome(certificationPercentage: number, readyForApproval: boolean) {
  return {
    screenId: "certification-home",
    readOnly: true,
    sections: [
      {
        id: "certification-home",
        label: "Certification Home",
        components: [
          component("certification", "core-ui-progress", { percentage: certificationPercentage, readOnly: true }, "Certification percentage"),
          component("approval", "core-ui-badge", { ready: readyForApproval, readOnly: true }, "Production approval"),
          component("read-only", "core-ui-chip", { readOnly: true, noRuntimeExecution: true }, "Read-only certification"),
        ],
      },
    ],
  };
}

export function buildCertificationDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "certification-dashboard",
    readOnly: true,
    sections: [
      {
        id: "certification-dashboard",
        label: "Certification Dashboard",
        components: [component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Certification dashboard")],
      },
    ],
  };
}

export function buildCertificationStatusScreen(status: Record<string, unknown>) {
  return {
    screenId: "certification-status-screen",
    readOnly: true,
    sections: [
      {
        id: "certification-status",
        label: "Certification Status",
        components: [component("status", "core-ui-card", { ...status, readOnly: true }, "Certification status")],
      },
    ],
  };
}

export function buildCertificationChecklistScreen(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "certification-checklist-screen",
    readOnly: true,
    sections: [
      {
        id: "certification-checklist",
        label: "Certification Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}

export function buildCertificationSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "certification-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "certification-summary",
        label: "Certification Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Certification summary")],
      },
    ],
  };
}

export function buildCertificationBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string }>
) {
  return {
    screenId: "certification-board",
    readOnly: true,
    sections: [
      {
        id: "certification-board",
        label: "Certification Board",
        components: items.map((item) =>
          component(`board-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
