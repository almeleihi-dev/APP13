import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildArchitectureReviewCenter,
  buildArchitectureReviewSnapshot,
  toArchitectureRecommendationsView,
  toArchitectureReviewCenterView,
  toArchitectureReviewScoreView,
  toArchitectureOverviewView,
  toArchitectureRiskRegisterView,
  toDependencyBoundaryAuditView,
  toDocumentationAuditView,
  toExecutiveStackCompletenessView,
  toExperienceLayerAuditView,
  toRouteSurfaceAuditView,
  toVerificationChainAuditView,
  type ArchitectureRecommendationsView,
  type ArchitectureReviewCenterView,
  type ArchitectureReviewScoreView,
  type ArchitectureOverviewView,
  type ArchitectureRiskRegisterView,
  type DependencyBoundaryAuditView,
  type DocumentationAuditView,
  type ExecutiveStackCompletenessView,
  type ExperienceLayerAuditView,
  type RouteSurfaceAuditView,
  type VerificationChainAuditView,
} from "../domain/architecture-review.js";
import {
  createArchitectureReviewRepository,
  type ArchitectureReviewRepository,
} from "../infrastructure/architecture-review-repository.js";

export class ArchitectureReviewService {
  private readonly repository: ArchitectureReviewRepository;

  constructor(
    private readonly db: DbPool,
    repository?: ArchitectureReviewRepository
  ) {
    this.repository = repository ?? createArchitectureReviewRepository();
  }

  async getArchitectureReviewCenter(
    authContext: AuthContext
  ): Promise<ArchitectureReviewCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toArchitectureReviewCenterView(center);
  }

  async getArchitectureOverview(authContext: AuthContext): Promise<ArchitectureOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toArchitectureOverviewView(center.overview);
  }

  async getExperienceLayerAudit(authContext: AuthContext): Promise<ExperienceLayerAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExperienceLayerAuditView(center.experienceLayers);
  }

  async getRouteSurfaceAudit(authContext: AuthContext): Promise<RouteSurfaceAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRouteSurfaceAuditView(center.routes);
  }

  async getVerificationChainAudit(
    authContext: AuthContext
  ): Promise<VerificationChainAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toVerificationChainAuditView(center.verifications);
  }

  async getDocumentationAudit(authContext: AuthContext): Promise<DocumentationAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDocumentationAuditView(center.documentation);
  }

  async getDependencyBoundaryAudit(
    authContext: AuthContext
  ): Promise<DependencyBoundaryAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDependencyBoundaryAuditView(center.dependencies);
  }

  async getExecutiveStackCompleteness(
    authContext: AuthContext
  ): Promise<ExecutiveStackCompletenessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExecutiveStackCompletenessView(center.completeness);
  }

  async getArchitectureRiskRegister(
    authContext: AuthContext
  ): Promise<ArchitectureRiskRegisterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toArchitectureRiskRegisterView(center.risks);
  }

  async getArchitectureRecommendations(
    authContext: AuthContext
  ): Promise<ArchitectureRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toArchitectureRecommendationsView(center.recommendations);
  }

  async getArchitectureReviewScore(
    authContext: AuthContext
  ): Promise<ArchitectureReviewScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toArchitectureReviewScoreView(center.reviewScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildArchitectureReviewSnapshot({ raw });
    return buildArchitectureReviewCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createArchitectureReviewService(
  db: DbPool,
  repository?: ArchitectureReviewRepository
): ArchitectureReviewService {
  return new ArchitectureReviewService(db, repository);
}

export function createArchitectureReviewModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: ArchitectureReviewRepository }
) {
  const repository =
    deps?.repository ??
    createArchitectureReviewRepository({
      rootDir: deps?.rootDir,
    });
  const architectureReview = createArchitectureReviewService(db, repository);

  return {
    architectureReview,
  };
}

export type ArchitectureReviewModule = ReturnType<typeof createArchitectureReviewModule>;
