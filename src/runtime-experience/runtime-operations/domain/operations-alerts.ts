export type OperationsAlertSeverity = "info" | "warning" | "critical";

export interface OperationsAlert {
  id: string;
  severity: OperationsAlertSeverity;
  source: string;
  message: string;
  delegateModule: string;
}

export function buildOperationsAlerts(input: {
  blockers: string[];
  warnings: string[];
  launcherBlockers: string[];
  launcherWarnings: string[];
}): OperationsAlert[] {
  const alerts: OperationsAlert[] = [];
  for (const blocker of [...input.blockers, ...input.launcherBlockers]) {
    alerts.push({
      id: `alert-blocker-${alerts.length}`,
      severity: "critical",
      source: "runtime-operations",
      message: blocker,
      delegateModule: "CH3-X20",
    });
  }
  for (const warning of [...input.warnings, ...input.launcherWarnings]) {
    alerts.push({
      id: `alert-warning-${alerts.length}`,
      severity: "warning",
      source: "runtime-operations",
      message: warning,
      delegateModule: "CH3-X19",
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      id: "alert-info-operational",
      severity: "info",
      source: "runtime-operations",
      message: "All runtime modules operational — no active alerts",
      delegateModule: "CH3-X21",
    });
  }
  return alerts;
}
