import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildExecutiveCommandCenter,
  buildExecutiveCommandCenterSnapshot,
  toExecutiveCommandCenterView,
  toExecutiveRecommendedActionView,
  toFinancialEscrowOverviewView,
  toMarketplaceOverviewView,
  toOperationalBlockerView,
  toOperationalStrengthView,
  toOperationalWarningView,
  toReleaseReadinessOverviewView,
  toTrustReputationOverviewView,
  type ExecutiveCommandCenterView,
  type ExecutiveRecommendedActionView,
  type FinancialEscrowOverviewView,
  type MarketplaceOverviewView,
  type OperationalBlockerView,
  type OperationalStrengthView,
  type OperationalWarningView,
  type ReleaseReadinessOverviewView,
  type TrustReputationOverviewView,
} from "../domain/executive-command-center.js";
import {
  createExecutiveCommandCenterRepository,
  type ExecutiveCommandCenterRepository,
} from "../infrastructure/executive-command-center-repository.js";

export class ExecutiveCommandCenterService {
  private readonly repository: ExecutiveCommandCenterRepository;

  constructor(
    private readonly db: DbPool,
    repository?: ExecutiveCommandCenterRepository
  ) {
    this.repository = repository ?? createExecutiveCommandCenterRepository();
  }

  async getExecutiveCommandCenter(authContext: AuthContext): Promise<ExecutiveCommandCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExecutiveCommandCenterView(center);
  }

  async getReleaseReadinessOverview(
    authContext: AuthContext
  ): Promise<ReleaseReadinessOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toReleaseReadinessOverviewView(center.releaseReadiness);
  }

  async getMarketplaceOverview(authContext: AuthContext): Promise<MarketplaceOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMarketplaceOverviewView(center.marketplace);
  }

  async getTrustReputationOverview(authContext: AuthContext): Promise<TrustReputationOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toTrustReputationOverviewView(center.trust);
  }

  async getFinancialOverview(authContext: AuthContext): Promise<FinancialEscrowOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toFinancialEscrowOverviewView(center.financial);
  }

  async getOperationalBlockers(authContext: AuthContext): Promise<OperationalBlockerView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.blockers.map(toOperationalBlockerView);
  }

  async getOperationalWarnings(authContext: AuthContext): Promise<OperationalWarningView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.warnings.map(toOperationalWarningView);
  }

  async getOperationalStrengths(authContext: AuthContext): Promise<OperationalStrengthView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.strengths.map(toOperationalStrengthView);
  }

  async getRecommendedActions(authContext: AuthContext): Promise<ExecutiveRecommendedActionView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.actions.map(toExecutiveRecommendedActionView);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildExecutiveCommandCenterSnapshot({ raw });
    return buildExecutiveCommandCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createExecutiveCommandCenterService(
  db: DbPool,
  repository?: ExecutiveCommandCenterRepository
): ExecutiveCommandCenterService {
  return new ExecutiveCommandCenterService(db, repository);
}

export function createExecutiveCommandCenterModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: ExecutiveCommandCenterRepository }
) {
  const repository =
    deps?.repository ??
    createExecutiveCommandCenterRepository({
      rootDir: deps?.rootDir,
    });
  const executiveCommandCenter = createExecutiveCommandCenterService(db, repository);

  return {
    executiveCommandCenter,
  };
}

export type ExecutiveCommandCenterModule = ReturnType<typeof createExecutiveCommandCenterModule>;
