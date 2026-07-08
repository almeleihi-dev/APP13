import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildExecutiveExperienceLayer,
  buildExecutiveExperienceSnapshot,
  toExecutiveDashboardExperienceView,
  toExecutiveExperienceLayerView,
  toExecutiveExperienceScoreView,
  toExecutiveSnapshotView,
  toExecutiveSummaryExperienceView,
  toGovernmentPresentationExperienceView,
  toGrowthExperienceView,
  toInvestorPresentationExperienceView,
  toStrategicNarrativeExperienceView,
  type ExecutiveDashboardExperienceView,
  type ExecutiveExperienceLayerView,
  type ExecutiveExperienceScoreView,
  type ExecutiveSnapshotView,
  type ExecutiveSummaryExperienceView,
  type GovernmentPresentationExperienceView,
  type GrowthExperienceView,
  type InvestorPresentationExperienceView,
  type StrategicNarrativeExperienceView,
} from "../domain/executive-experience.js";
import {
  createExecutiveExperienceRepository,
  type ExecutiveExperienceRepository,
} from "../infrastructure/executive-experience-repository.js";

export class ExecutiveExperienceService {
  private readonly repository: ExecutiveExperienceRepository;

  constructor(
    private readonly db: DbPool,
    repository?: ExecutiveExperienceRepository
  ) {
    this.repository = repository ?? createExecutiveExperienceRepository();
  }

  async getExecutiveExperienceLayer(
    authContext: AuthContext
  ): Promise<ExecutiveExperienceLayerView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toExecutiveExperienceLayerView(layer);
  }

  async getExecutiveDashboardExperience(
    authContext: AuthContext
  ): Promise<ExecutiveDashboardExperienceView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toExecutiveDashboardExperienceView(layer.dashboard);
  }

  async getExecutiveSummaryExperience(
    authContext: AuthContext
  ): Promise<ExecutiveSummaryExperienceView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toExecutiveSummaryExperienceView(layer.summary);
  }

  async getInvestorPresentationExperience(
    authContext: AuthContext
  ): Promise<InvestorPresentationExperienceView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toInvestorPresentationExperienceView(layer.investorPresentation);
  }

  async getGovernmentPresentationExperience(
    authContext: AuthContext
  ): Promise<GovernmentPresentationExperienceView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toGovernmentPresentationExperienceView(layer.governmentPresentation);
  }

  async getGrowthExperience(authContext: AuthContext): Promise<GrowthExperienceView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toGrowthExperienceView(layer.growth);
  }

  async getStrategicNarrativeExperience(
    authContext: AuthContext
  ): Promise<StrategicNarrativeExperienceView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toStrategicNarrativeExperienceView(layer.narrative);
  }

  async getExecutiveSnapshot(authContext: AuthContext): Promise<ExecutiveSnapshotView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toExecutiveSnapshotView(layer.snapshot);
  }

  async getExecutiveExperienceScore(
    authContext: AuthContext
  ): Promise<ExecutiveExperienceScoreView> {
    this.assertAdminAccess(authContext);
    const layer = await this.buildLayer();
    return toExecutiveExperienceScoreView(layer.experienceScore);
  }

  private async buildLayer() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildExecutiveExperienceSnapshot({ raw });
    return buildExecutiveExperienceLayer({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createExecutiveExperienceService(
  db: DbPool,
  repository?: ExecutiveExperienceRepository
): ExecutiveExperienceService {
  return new ExecutiveExperienceService(db, repository);
}

export function createExecutiveExperienceModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: ExecutiveExperienceRepository }
) {
  const repository =
    deps?.repository ??
    createExecutiveExperienceRepository({
      rootDir: deps?.rootDir,
    });
  const executiveExperience = createExecutiveExperienceService(db, repository);

  return {
    executiveExperience,
  };
}

export type ExecutiveExperienceModule = ReturnType<typeof createExecutiveExperienceModule>;
