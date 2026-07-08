import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeExecutiveLaunchAuthorityService } from "../../runtime-executive-launch-authority/application/runtime-executive-launch-authority-service.js";
import {
  RUNTIME_COMPLETION_VERSION,
  RUNTIME_COMPLETION_FIXED_TIMESTAMP,
  buildRuntimeCompletionDefinition,
} from "../domain/runtime-completion.js";
import { CH3_RUNTIME_MODULE_IDS } from "../domain/runtime-completion-report.js";
import { RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION } from "../../runtime-executive-launch-authority/domain/runtime-executive-launch-authority.js";
import {
  RuntimeCompletionRepository,
  createRuntimeCompletionRepository,
} from "../infrastructure/runtime-completion-repository.js";
import { createRuntimeCompletionAggregator } from "./runtime-completion-aggregator.js";
import { RuntimeCompletionController, createRuntimeCompletionController } from "./runtime-completion-controller.js";
import { validateRuntimeCompletionCertification } from "../validation/runtime-completion-certification-validator.js";
import { buildCompletionHome } from "../presentation/completion-home.js";
import { buildCompletionDashboard } from "../presentation/completion-dashboard.js";
import { buildCertificationScreen } from "../presentation/certification-screen.js";
import { buildStatisticsScreen } from "../presentation/statistics-screen.js";
import { buildArchitectureScreen } from "../presentation/architecture-screen.js";
import { buildExecutiveSummaryScreen } from "../presentation/executive-summary-screen.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeCompletionService {
  private readonly repository: RuntimeCompletionRepository;
  private readonly controller: RuntimeCompletionController;

  constructor(deps: {
    runtimeExecutiveLaunchAuthority: RuntimeExecutiveLaunchAuthorityService;
    repository?: RuntimeCompletionRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeCompletionRepository();
    const aggregator = createRuntimeCompletionAggregator(deps);
    this.controller = createRuntimeCompletionController(this.repository, aggregator);
  }

  getCompletion(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeCompletionDefinition();
    return {
      version: RUNTIME_COMPLETION_VERSION,
      runtime_executive_launch_authority_version: RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION,
      definition,
      module_count: CH3_RUNTIME_MODULE_IDS.length,
      home: buildCompletionHome(
        aggregation.report.overview.completionPercentage,
        aggregation.certification.runtimeChapter3Completed,
        aggregation.certification.runtimeCertified
      ),
      report: aggregation.report,
      certification: aggregation.certification,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: RUNTIME_COMPLETION_FIXED_TIMESTAMP,
      runtime_completion: true,
      read_only: true,
      delegates_only: true,
      no_runtime_execution: true,
    };
  }

  getDashboard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      dashboard: aggregation.report.overview,
      screen: buildCompletionDashboard({ ...aggregation.report.overview }),
    };
  }

  getCertification(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      certification: aggregation.certification,
      screen: buildCertificationScreen({ ...aggregation.certification }),
    };
  }

  getStatistics(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      statistics: aggregation.statistics,
      screen: buildStatisticsScreen({ ...aggregation.statistics }),
    };
  }

  getArchitecture(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      architecture: aggregation.architecture,
      screen: buildArchitectureScreen({ ...aggregation.architecture }),
    };
  }

  getExecutiveSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      executiveSummary: aggregation.executiveSummary,
      screen: buildExecutiveSummaryScreen({ ...aggregation.executiveSummary }),
    };
  }

  validateRuntime() {
    return validateRuntimeCompletionCertification();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeCompletionService(deps: {
  runtimeExecutiveLaunchAuthority: RuntimeExecutiveLaunchAuthorityService;
  repository?: RuntimeCompletionRepository;
}) {
  return new RuntimeCompletionService(deps);
}
