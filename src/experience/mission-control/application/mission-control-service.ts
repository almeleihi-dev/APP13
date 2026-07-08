import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildMissionControlCenter,
  buildMissionControlSnapshot,
  toExecutiveActionQueueView,
  toGovernmentCommandPanelView,
  toGrowthCommandPanelView,
  toInvestorCommandPanelView,
  toMissionControlCenterView,
  toMissionControlOverviewView,
  toMissionControlScoreView,
  toOperationsCommandPanelView,
  toTopDecisionsPanelView,
  toTopOpportunitiesPanelView,
  toTopRisksPanelView,
  type ExecutiveActionQueueView,
  type GovernmentCommandPanelView,
  type GrowthCommandPanelView,
  type InvestorCommandPanelView,
  type MissionControlCenterView,
  type MissionControlOverviewView,
  type MissionControlScoreView,
  type OperationsCommandPanelView,
  type TopDecisionsPanelView,
  type TopOpportunitiesPanelView,
  type TopRisksPanelView,
} from "../domain/mission-control.js";
import {
  createMissionControlRepository,
  type MissionControlRepository,
} from "../infrastructure/mission-control-repository.js";

export class MissionControlService {
  private readonly repository: MissionControlRepository;

  constructor(
    private readonly db: DbPool,
    repository?: MissionControlRepository
  ) {
    this.repository = repository ?? createMissionControlRepository();
  }

  async getMissionControlCenter(authContext: AuthContext): Promise<MissionControlCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMissionControlCenterView(center);
  }

  async getMissionControlOverview(authContext: AuthContext): Promise<MissionControlOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMissionControlOverviewView(center.overview);
  }

  async getTopDecisionsPanel(authContext: AuthContext): Promise<TopDecisionsPanelView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toTopDecisionsPanelView(center.decisions);
  }

  async getTopRisksPanel(authContext: AuthContext): Promise<TopRisksPanelView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toTopRisksPanelView(center.risks);
  }

  async getTopOpportunitiesPanel(authContext: AuthContext): Promise<TopOpportunitiesPanelView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toTopOpportunitiesPanelView(center.opportunities);
  }

  async getGrowthCommandPanel(authContext: AuthContext): Promise<GrowthCommandPanelView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toGrowthCommandPanelView(center.growth);
  }

  async getGovernmentCommandPanel(authContext: AuthContext): Promise<GovernmentCommandPanelView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toGovernmentCommandPanelView(center.government);
  }

  async getInvestorCommandPanel(authContext: AuthContext): Promise<InvestorCommandPanelView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toInvestorCommandPanelView(center.investors);
  }

  async getOperationsCommandPanel(authContext: AuthContext): Promise<OperationsCommandPanelView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperationsCommandPanelView(center.operations);
  }

  async getExecutiveActionQueue(authContext: AuthContext): Promise<ExecutiveActionQueueView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExecutiveActionQueueView(center.actionQueue);
  }

  async getMissionControlScore(authContext: AuthContext): Promise<MissionControlScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMissionControlScoreView(center.missionScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildMissionControlSnapshot({ raw });
    return buildMissionControlCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createMissionControlService(
  db: DbPool,
  repository?: MissionControlRepository
): MissionControlService {
  return new MissionControlService(db, repository);
}

export function createMissionControlModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: MissionControlRepository }
) {
  const repository =
    deps?.repository ??
    createMissionControlRepository({
      rootDir: deps?.rootDir,
    });
  const missionControl = createMissionControlService(db, repository);

  return {
    missionControl,
  };
}

export type MissionControlModule = ReturnType<typeof createMissionControlModule>;
