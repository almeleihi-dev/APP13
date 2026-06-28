import type { AuthContext } from "../../shared/auth/index.js";
import type { IntelligenceDashboardService } from "../../intelligence-dashboard/application/intelligence-dashboard-service.js";
import type { PredictionIntelligenceQuery } from "../../prediction-intelligence/application/prediction-intelligence-service.js";
import {
  createIntelligenceDashboardRepository,
  type IntelligenceDashboardRepository,
} from "../../intelligence-dashboard/infrastructure/intelligence-dashboard-repository.js";
import { createIntelligenceDashboardService } from "../../intelligence-dashboard/application/intelligence-dashboard-service.js";
import type { IntelligenceDashboardOutput } from "../../intelligence-dashboard/domain/intelligence-dashboard-context.js";
import type { ExecutiveIntelligenceCenterContext } from "../domain/executive-intelligence-center-context.js";

export interface UpstreamExecutiveCenterInputs {
  dashboard: IntelligenceDashboardOutput;
}

export class ExecutiveIntelligenceCenterRepository {
  private readonly dashboardRepository: IntelligenceDashboardRepository;
  private readonly intelligenceDashboard: IntelligenceDashboardService;

  constructor(deps?: {
    dashboardRepository?: IntelligenceDashboardRepository;
    intelligenceDashboard?: IntelligenceDashboardService;
  }) {
    this.dashboardRepository = deps?.dashboardRepository ?? createIntelligenceDashboardRepository();
    this.intelligenceDashboard =
      deps?.intelligenceDashboard ??
      createIntelligenceDashboardService({ repository: this.dashboardRepository });
  }

  listExecutiveCenterScenarios() {
    return this.dashboardRepository.listDashboardScenarios();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: ExecutiveIntelligenceCenterContext,
    query: PredictionIntelligenceQuery
  ): UpstreamExecutiveCenterInputs {
    const dashboard = this.intelligenceDashboard.buildOutputForValidation(authContext, query);
    return { dashboard };
  }
}

export function createExecutiveIntelligenceCenterRepository(
  deps?: ConstructorParameters<typeof ExecutiveIntelligenceCenterRepository>[0]
): ExecutiveIntelligenceCenterRepository {
  return new ExecutiveIntelligenceCenterRepository(deps);
}
