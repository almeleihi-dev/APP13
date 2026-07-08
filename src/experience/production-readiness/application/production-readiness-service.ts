import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildProductionReadinessCenter,
  buildProductionReadinessSnapshot,
  toDatabaseReadinessView,
  toDeploymentReadinessView,
  toDisasterRecoveryReadinessView,
  toEnvironmentAuditView,
  toLaunchRecommendationsView,
  toMonitoringReadinessView,
  toProductionOverviewView,
  toProductionReadinessCenterView,
  toProductionRiskRegisterView,
  toSecurityReadinessView,
  toStorageReadinessView,
  type DatabaseReadinessView,
  type DeploymentReadinessView,
  type DisasterRecoveryReadinessView,
  type EnvironmentAuditView,
  type LaunchRecommendationsView,
  type MonitoringReadinessView,
  type ProductionOverviewView,
  type ProductionReadinessCenterView,
  type ProductionRiskRegisterView,
  type SecurityReadinessView,
  type StorageReadinessView,
} from "../domain/production-readiness.js";
import {
  createProductionReadinessRepository,
  type ProductionReadinessRepository,
} from "../infrastructure/production-readiness-repository.js";

export class ProductionReadinessService {
  private readonly repository: ProductionReadinessRepository;

  constructor(
    private readonly db: DbPool,
    repository?: ProductionReadinessRepository
  ) {
    this.repository = repository ?? createProductionReadinessRepository();
  }

  async getProductionReadinessCenter(
    authContext: AuthContext
  ): Promise<ProductionReadinessCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toProductionReadinessCenterView(center);
  }

  async getProductionOverview(authContext: AuthContext): Promise<ProductionOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toProductionOverviewView(center.overview);
  }

  async getEnvironmentAudit(authContext: AuthContext): Promise<EnvironmentAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toEnvironmentAuditView(center.environment);
  }

  async getDatabaseReadiness(authContext: AuthContext): Promise<DatabaseReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDatabaseReadinessView(center.database);
  }

  async getStorageReadiness(authContext: AuthContext): Promise<StorageReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toStorageReadinessView(center.storage);
  }

  async getSecurityReadiness(authContext: AuthContext): Promise<SecurityReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecurityReadinessView(center.security);
  }

  async getMonitoringReadiness(authContext: AuthContext): Promise<MonitoringReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMonitoringReadinessView(center.monitoring);
  }

  async getDeploymentReadiness(authContext: AuthContext): Promise<DeploymentReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDeploymentReadinessView(center.deployment);
  }

  async getDisasterRecoveryReadiness(
    authContext: AuthContext
  ): Promise<DisasterRecoveryReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDisasterRecoveryReadinessView(center.disasterRecovery);
  }

  async getProductionRiskRegister(authContext: AuthContext): Promise<ProductionRiskRegisterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toProductionRiskRegisterView(center.riskRegister);
  }

  async getLaunchRecommendations(authContext: AuthContext): Promise<LaunchRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toLaunchRecommendationsView(center.recommendations);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildProductionReadinessSnapshot({ raw });
    return buildProductionReadinessCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createProductionReadinessService(
  db: DbPool,
  repository?: ProductionReadinessRepository
): ProductionReadinessService {
  return new ProductionReadinessService(db, repository);
}

export function createProductionReadinessModule(
  db: DbPool,
  deps?: { rootDir?: string; runtimeEnvKeys?: Set<string>; repository?: ProductionReadinessRepository }
) {
  const repository =
    deps?.repository ??
    createProductionReadinessRepository({
      rootDir: deps?.rootDir,
      runtimeEnvKeys: deps?.runtimeEnvKeys,
    });
  const productionReadiness = createProductionReadinessService(db, repository);

  return {
    productionReadiness,
  };
}

export type ProductionReadinessModule = ReturnType<typeof createProductionReadinessModule>;
