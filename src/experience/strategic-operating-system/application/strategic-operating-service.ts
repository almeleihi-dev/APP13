import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildStrategicOperatingSnapshot,
  buildStrategicOperatingSystem,
  toExecutiveDecisionBriefView,
  toOperatingCadenceViewResponse,
  toStrategicActionPlanView,
  toStrategicGoalsViewResponse,
  toStrategicOperatingOverviewView,
  toStrategicOperatingScoreView,
  toStrategicOperatingSystemView,
  toStrategicOpportunityMapView,
  toStrategicPriorityViewResponse,
  toStrategicRiskRegisterView,
  toStrategicScorecardView,
  type ExecutiveDecisionBriefView,
  type OperatingCadenceViewResponse,
  type StrategicActionPlanView,
  type StrategicGoalsViewResponse,
  type StrategicOperatingOverviewView,
  type StrategicOperatingScoreView,
  type StrategicOperatingSystemView,
  type StrategicOpportunityMapView,
  type StrategicPriorityViewResponse,
  type StrategicRiskRegisterView,
  type StrategicScorecardView,
} from "../domain/strategic-operating-system.js";
import {
  createStrategicOperatingRepository,
  type StrategicOperatingRepository,
} from "../infrastructure/strategic-operating-repository.js";

export class StrategicOperatingService {
  private readonly repository: StrategicOperatingRepository;

  constructor(
    private readonly db: DbPool,
    repository?: StrategicOperatingRepository
  ) {
    this.repository = repository ?? createStrategicOperatingRepository();
  }

  async getStrategicOperatingSystem(
    authContext: AuthContext
  ): Promise<StrategicOperatingSystemView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicOperatingSystemView(system);
  }

  async getStrategicOperatingOverview(
    authContext: AuthContext
  ): Promise<StrategicOperatingOverviewView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicOperatingOverviewView(system.overview);
  }

  async getStrategicPriorities(
    authContext: AuthContext
  ): Promise<StrategicPriorityViewResponse> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicPriorityViewResponse(system.priorities);
  }

  async getStrategicRiskRegister(
    authContext: AuthContext
  ): Promise<StrategicRiskRegisterView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicRiskRegisterView(system.riskRegister);
  }

  async getStrategicOpportunityMap(
    authContext: AuthContext
  ): Promise<StrategicOpportunityMapView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicOpportunityMapView(system.opportunityMap);
  }

  async getExecutiveDecisionBrief(
    authContext: AuthContext
  ): Promise<ExecutiveDecisionBriefView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toExecutiveDecisionBriefView(system.decisionBrief);
  }

  async getStrategicGoals(authContext: AuthContext): Promise<StrategicGoalsViewResponse> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicGoalsViewResponse(system.goals);
  }

  async getOperatingCadence(authContext: AuthContext): Promise<OperatingCadenceViewResponse> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toOperatingCadenceViewResponse(system.cadence);
  }

  async getStrategicActionPlan(authContext: AuthContext): Promise<StrategicActionPlanView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicActionPlanView(system.actionPlan);
  }

  async getStrategicScorecard(authContext: AuthContext): Promise<StrategicScorecardView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicScorecardView(system.scorecard);
  }

  async getStrategicOperatingScore(
    authContext: AuthContext
  ): Promise<StrategicOperatingScoreView> {
    this.assertAdminAccess(authContext);
    const system = await this.buildSystem();
    return toStrategicOperatingScoreView(system.operatingScore);
  }

  private async buildSystem() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildStrategicOperatingSnapshot({ raw });
    return buildStrategicOperatingSystem({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createStrategicOperatingService(
  db: DbPool,
  repository?: StrategicOperatingRepository
): StrategicOperatingService {
  return new StrategicOperatingService(db, repository);
}

export function createStrategicOperatingModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: StrategicOperatingRepository }
) {
  const repository =
    deps?.repository ??
    createStrategicOperatingRepository({
      rootDir: deps?.rootDir,
    });
  const strategicOperatingSystem = createStrategicOperatingService(db, repository);

  return {
    strategicOperatingSystem,
  };
}

export type StrategicOperatingModule = ReturnType<typeof createStrategicOperatingModule>;
