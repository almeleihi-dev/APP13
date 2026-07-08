function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildReleaseHome(qualityScore: number, readinessPercentage: number) {
  return {
    screenId: "release-home",
    readOnly: true,
    sections: [
      {
        id: "release-home",
        label: "Runtime Release Home",
        components: [
          component("quality-score", "core-ui-progress", { score: qualityScore, readOnly: true }, "Runtime quality score"),
          component("readiness", "core-ui-progress", { percentage: readinessPercentage, readOnly: true }, "Release readiness"),
          component("read-only", "core-ui-chip", { readOnly: true, noReleaseExecution: true }, "Read-only certification"),
        ],
      },
    ],
  };
}

export function buildReleaseSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "release-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "release-summary",
        label: "Release Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Release summary")],
      },
    ],
  };
}

export function buildReleaseChecklist(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "release-checklist",
    readOnly: true,
    sections: [
      {
        id: "release-checklist",
        label: "Release Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}

export function buildReleaseReportScreen(report: Record<string, unknown>) {
  return {
    screenId: "release-report-screen",
    readOnly: true,
    sections: [
      {
        id: "release-report",
        label: "Release Report",
        components: [component("report", "core-ui-card", { ...report, readOnly: true }, "Release report")],
      },
    ],
  };
}

export function buildReleaseCandidateScreen(candidate: Record<string, unknown>) {
  return {
    screenId: "release-candidate-screen",
    readOnly: true,
    sections: [
      {
        id: "release-candidate",
        label: "Release Candidate",
        components: [component("candidate", "core-ui-card", { ...candidate, readOnly: true }, "Release candidate")],
      },
    ],
  };
}

export function buildCertificationScreen(certification: Record<string, unknown>) {
  return {
    screenId: "certification-screen",
    readOnly: true,
    sections: [
      {
        id: "certification",
        label: "Certification Summary",
        components: [component("certification", "core-ui-card", { ...certification, readOnly: true }, "Certification")],
      },
    ],
  };
}
