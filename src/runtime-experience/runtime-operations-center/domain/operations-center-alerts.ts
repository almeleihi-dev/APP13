export type OperationsCenterAlertSeverity = "info" | "warning" | "critical";

export interface OperationsCenterAlert {
  id: string;
  severity: OperationsCenterAlertSeverity;
  source: string;
  message: string;
  delegateModule: string;
}

export function buildOperationsCenterAlerts(input: {
  operationsAlerts: Array<{ id: string; severity: OperationsCenterAlertSeverity; message: string; delegateModule: string }>;
  productionApproved: boolean;
}): OperationsCenterAlert[] {
  const alerts: OperationsCenterAlert[] = input.operationsAlerts.map((alert) => ({
    id: alert.id,
    severity: alert.severity,
    source: "runtime-operations-center",
    message: alert.message,
    delegateModule: alert.delegateModule,
  }));

  if (!input.productionApproved) {
    alerts.push({
      id: "alert-approval-pending",
      severity: "warning",
      source: "runtime-operations-center",
      message: "Production approval pending — operational handoff not complete",
      delegateModule: "CH3-X26",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "alert-info-operational",
      severity: "info",
      source: "runtime-operations-center",
      message: "All approved runtime modules operational — no active alerts",
      delegateModule: "CH3-X27",
    });
  }

  return alerts;
}
