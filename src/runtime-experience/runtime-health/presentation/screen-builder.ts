import type { RuntimeHealthSummary } from "../domain/health-summary.js";
import type { HealthCheckSnapshot } from "../domain/health-check.js";

function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildHealthDashboard(summary: RuntimeHealthSummary, snapshot: HealthCheckSnapshot) {
  return {
    sections: [
      {
        id: "health-dashboard",
        label: "Runtime Health Dashboard",
        components: [
          component("overall-status", "core-ui-badge", { status: summary.overallStatus }, "Overall runtime status"),
          component("readiness", "core-ui-card", { percentage: summary.readinessPercentage }, "Runtime readiness"),
          component("registered", "core-ui-chip", { count: summary.registeredExperiences }, "Registered experiences"),
          component("healthy", "core-ui-chip", { count: summary.healthyExperiences }, "Healthy experiences"),
          component("warnings", "core-ui-badge", { count: summary.warningCount }, "Warning count"),
          component("errors", "core-ui-badge", { count: summary.errorCount }, "Error count"),
          component("coordinator", "core-ui-card", { ...summary.platform.coordinator }, "Coordinator status"),
          component("registry", "core-ui-card", { ...summary.platform.registry }, "Registry status"),
          component("journey", "core-ui-card", { ...summary.platform.journey }, "Journey status"),
          component("state", "core-ui-card", { ...summary.platform.stateEngine }, "State engine status"),
        ],
      },
      {
        id: "experience-health-list",
        label: "Experience Health",
        components: snapshot.experiences.map((exp) =>
          component(
            `health-${exp.id}`,
            "core-ui-timeline-card",
            {
              id: exp.id,
              name: exp.name,
              overallHealth: exp.overallHealth,
              validationStatus: exp.validationStatus,
              readOnly: true,
            },
            `${exp.name} health`
          )
        ),
      },
    ],
  };
}

export function buildHealthSummaryScreen(summary: RuntimeHealthSummary) {
  return buildScreen("health-summary", "Runtime Health Summary", [
    component("summary-status", "core-ui-card", { ...summary }, "Health summary"),
  ]);
}

export function buildDiagnosticsScreen(snapshot: HealthCheckSnapshot) {
  return buildScreen("diagnostics", "Runtime Diagnostics", [
    component("diagnostics-meta", "core-ui-badge", {
      healthy: snapshot.healthyCount,
      warnings: snapshot.warningCount,
      errors: snapshot.errorCount,
    }, "Diagnostics totals"),
    ...snapshot.experiences.map((exp, i) =>
      component(`diag-${i}`, "core-ui-card", { id: exp.id, health: exp.overallHealth }, exp.name)
    ),
  ]);
}

export function buildExperienceHealthScreen(report: import("../domain/health-check.js").ExperienceHealthReport) {
  return buildScreen(`experience-health-${report.id}`, `${report.name} Health`, [
    component("experience-meta", "core-ui-card", { ...report }, report.name),
  ]);
}

export function buildValidationScreen(validation: { valid: boolean; summary: string; checked: Record<string, unknown> }) {
  return buildScreen("validation", "Runtime Health Validation", [
    component("validation-result", "core-ui-card", validation, "Validation result"),
  ]);
}

function buildScreen(screenId: string, title: string, components: ReturnType<typeof component>[]) {
  return {
    screenId,
    title,
    layoutId: "need-layout",
    readOnly: true,
    sections: [{ id: `${screenId}-section`, label: title, components }],
  };
}
