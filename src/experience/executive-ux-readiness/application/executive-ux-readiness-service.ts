import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildExecutiveUxReadinessCenter,
  buildExecutiveUxReadinessSnapshot,
  toEntryPointAuditView,
  toExecutiveUxReadinessCenterView,
  toReadinessClassificationView,
  toRouteBrowserAuditView,
  toSurfaceDetectionView,
  toUxReadinessOverviewView,
  toUxReadinessScoreView,
  toUxRecommendationsView,
  type EntryPointAuditView,
  type ExecutiveUxReadinessCenterView,
  type ReadinessClassificationView,
  type RouteBrowserAuditView,
  type SurfaceDetectionView,
  type UxReadinessOverviewView,
  type UxReadinessScoreView,
  type UxRecommendationsView,
} from "../domain/executive-ux-readiness.js";
import {
  createExecutiveUxReadinessRepository,
  type ExecutiveUxReadinessRepository,
} from "../infrastructure/executive-ux-readiness-repository.js";

export class ExecutiveUxReadinessService {
  private readonly repository: ExecutiveUxReadinessRepository;

  constructor(
    private readonly db: DbPool,
    repository?: ExecutiveUxReadinessRepository
  ) {
    this.repository = repository ?? createExecutiveUxReadinessRepository();
  }

  async getExecutiveUxReadinessCenter(
    authContext: AuthContext
  ): Promise<ExecutiveUxReadinessCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExecutiveUxReadinessCenterView(center);
  }

  async getUxReadinessOverview(authContext: AuthContext): Promise<UxReadinessOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toUxReadinessOverviewView(center.overview);
  }

  async getSurfaceDetection(authContext: AuthContext): Promise<SurfaceDetectionView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSurfaceDetectionView(center.surfaceDetection);
  }

  async getRouteBrowserAudit(authContext: AuthContext): Promise<RouteBrowserAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRouteBrowserAuditView(center.routeAudit);
  }

  async getEntryPointAudit(authContext: AuthContext): Promise<EntryPointAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toEntryPointAuditView(center.entryPoints);
  }

  async getReadinessClassification(authContext: AuthContext): Promise<ReadinessClassificationView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toReadinessClassificationView(center.classification);
  }

  async getUxRecommendations(authContext: AuthContext): Promise<UxRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toUxRecommendationsView(center.recommendations);
  }

  async getUxReadinessScore(authContext: AuthContext): Promise<UxReadinessScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toUxReadinessScoreView(center.readinessScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildExecutiveUxReadinessSnapshot({ raw });
    return buildExecutiveUxReadinessCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createExecutiveUxReadinessService(
  db: DbPool,
  repository?: ExecutiveUxReadinessRepository
): ExecutiveUxReadinessService {
  return new ExecutiveUxReadinessService(db, repository);
}

export function createExecutiveUxReadinessModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: ExecutiveUxReadinessRepository }
) {
  const repository =
    deps?.repository ??
    createExecutiveUxReadinessRepository({
      rootDir: deps?.rootDir,
    });
  const executiveUxReadiness = createExecutiveUxReadinessService(db, repository);

  return {
    executiveUxReadiness,
  };
}

export type ExecutiveUxReadinessModule = ReturnType<typeof createExecutiveUxReadinessModule>;
