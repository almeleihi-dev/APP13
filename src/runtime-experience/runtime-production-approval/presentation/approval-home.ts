function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildApprovalHome(approvalPercentage: number, officiallyApproved: boolean) {
  return {
    screenId: "approval-home",
    readOnly: true,
    sections: [
      {
        id: "approval-home",
        label: "Production Approval Home",
        components: [
          component("approval", "core-ui-progress", { percentage: approvalPercentage, readOnly: true }, "Approval percentage"),
          component("official", "core-ui-badge", { approved: officiallyApproved, readOnly: true }, "Official production approval"),
          component("read-only", "core-ui-chip", { readOnly: true, noRuntimeExecution: true }, "Read-only approval"),
        ],
      },
    ],
  };
}

export function buildApprovalDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "approval-dashboard",
    readOnly: true,
    sections: [
      {
        id: "approval-dashboard",
        label: "Production Approval Dashboard",
        components: [component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Approval dashboard")],
      },
    ],
  };
}

export function buildApprovalChecklist(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "approval-checklist",
    readOnly: true,
    sections: [
      {
        id: "approval-checklist",
        label: "Production Approval Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}

export function buildApprovalDecisionScreen(decision: Record<string, unknown>) {
  return {
    screenId: "approval-decision-screen",
    readOnly: true,
    sections: [
      {
        id: "approval-decision",
        label: "Production Approval Decision",
        components: [component("decision", "core-ui-card", { ...decision, readOnly: true }, "Approval decision")],
      },
    ],
  };
}

export function buildApprovalSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "approval-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "approval-summary",
        label: "Production Approval Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Approval summary")],
      },
    ],
  };
}

export function buildApprovalBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string }>
) {
  return {
    screenId: "approval-board",
    readOnly: true,
    sections: [
      {
        id: "approval-board",
        label: "Production Approval Board",
        components: items.map((item) =>
          component(`board-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
