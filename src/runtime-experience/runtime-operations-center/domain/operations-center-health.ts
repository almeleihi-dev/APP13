export interface OperationsCenterHealth {
  overallStatus: string;
  readinessPercentage: number;
  qualityScore: number;
  healthStatus: string;
  approvalPercentage: number;
  productionApproved: boolean;
  operationalPercentage: number;
}

export function buildOperationsCenterHealth(input: {
  healthStatus: string;
  readinessPercentage: number;
  qualityScore: number;
  approvalPercentage: number;
  productionApproved: boolean;
  operationalPercentage: number;
}): OperationsCenterHealth {
  return {
    overallStatus: input.healthStatus,
    readinessPercentage: input.readinessPercentage,
    qualityScore: input.qualityScore,
    healthStatus: input.healthStatus,
    approvalPercentage: input.approvalPercentage,
    productionApproved: input.productionApproved,
    operationalPercentage: input.operationalPercentage,
  };
}
