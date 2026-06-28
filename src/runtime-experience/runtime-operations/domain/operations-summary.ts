import type { OperationsOverview } from "./operations-overview.js";
import type { OperationsHealth } from "./operations-health.js";
import type { OperationsAlert } from "./operations-alerts.js";

export interface OperationsSummary {
  overview: OperationsOverview;
  health: OperationsHealth;
  alertCount: number;
  criticalAlertCount: number;
  warningAlertCount: number;
  readOnly: true;
  delegated: true;
}

export function buildOperationsSummary(input: {
  overview: OperationsOverview;
  health: OperationsHealth;
  alerts: OperationsAlert[];
}): OperationsSummary {
  return {
    overview: input.overview,
    health: input.health,
    alertCount: input.alerts.length,
    criticalAlertCount: input.alerts.filter((a) => a.severity === "critical").length,
    warningAlertCount: input.alerts.filter((a) => a.severity === "warning").length,
    readOnly: true,
    delegated: true,
  };
}
