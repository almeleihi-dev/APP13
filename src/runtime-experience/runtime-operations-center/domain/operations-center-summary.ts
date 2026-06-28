import type { OperationsCenterOverview } from "./operations-center-overview.js";
import type { OperationsCenterHealth } from "./operations-center-health.js";
import type { OperationsCenterAlert } from "./operations-center-alerts.js";

export interface OperationsCenterSummary {
  overview: OperationsCenterOverview;
  health: OperationsCenterHealth;
  alertCount: number;
  criticalAlertCount: number;
  warningAlertCount: number;
  productionApproved: boolean;
  readOnly: true;
  delegated: true;
}

export function buildOperationsCenterSummary(input: {
  overview: OperationsCenterOverview;
  health: OperationsCenterHealth;
  alerts: OperationsCenterAlert[];
  productionApproved: boolean;
}): OperationsCenterSummary {
  return {
    overview: input.overview,
    health: input.health,
    alertCount: input.alerts.length,
    criticalAlertCount: input.alerts.filter((a) => a.severity === "critical").length,
    warningAlertCount: input.alerts.filter((a) => a.severity === "warning").length,
    productionApproved: input.productionApproved,
    readOnly: true,
    delegated: true,
  };
}
