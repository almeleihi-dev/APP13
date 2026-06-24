import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildOperatorExperienceIntegrityCenter,
  buildOperatorExperienceIntegritySnapshot,
  toAuthBoundaryAuditView,
  toDataModeAuditView,
  toIntegrityOverviewView,
  toIntegrityRecommendationsView,
  toIntegrityScoreView,
  toJourneyIntegrityAuditView,
  toOperatorExperienceIntegrityCenterView,
  toWorkflowParityAuditView,
  toXStackIntegrityAlignmentViewDto,
  type AuthBoundaryAuditView,
  type DataModeAuditView,
  type IntegrityOverviewView,
  type IntegrityRecommendationsView,
  type IntegrityScoreView,
  type JourneyIntegrityAuditView,
  type OperatorExperienceIntegrityCenterView,
  type WorkflowParityAuditView,
  type XStackIntegrityAlignmentViewDto,
} from "../domain/operator-experience-integrity.js";
import {
  createOperatorExperienceIntegrityRepository,
  type OperatorExperienceIntegrityRepository,
} from "../infrastructure/operator-experience-integrity-repository.js";

export class OperatorExperienceIntegrityService {
  private readonly repository: OperatorExperienceIntegrityRepository;

  constructor(
    private readonly db: DbPool,
    repository?: OperatorExperienceIntegrityRepository
  ) {
    this.repository = repository ?? createOperatorExperienceIntegrityRepository();
  }

  async getOperatorExperienceIntegrityCenter(
    authContext: AuthContext
  ): Promise<OperatorExperienceIntegrityCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperatorExperienceIntegrityCenterView(center);
  }

  async getIntegrityOverview(authContext: AuthContext): Promise<IntegrityOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toIntegrityOverviewView(center.overview);
  }

  async getAuthBoundaryAudit(authContext: AuthContext): Promise<AuthBoundaryAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toAuthBoundaryAuditView(center.authBoundaries);
  }

  async getDataModeAudit(authContext: AuthContext): Promise<DataModeAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDataModeAuditView(center.dataModes);
  }

  async getWorkflowParityAudit(authContext: AuthContext): Promise<WorkflowParityAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toWorkflowParityAuditView(center.workflowParity);
  }

  async getJourneyIntegrityAudit(authContext: AuthContext): Promise<JourneyIntegrityAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toJourneyIntegrityAuditView(center.journeyIntegrity);
  }

  async getXStackAlignment(authContext: AuthContext): Promise<XStackIntegrityAlignmentViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toXStackIntegrityAlignmentViewDto(center.xStackAlignment);
  }

  async getIntegrityRecommendations(
    authContext: AuthContext
  ): Promise<IntegrityRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toIntegrityRecommendationsView(center.recommendations);
  }

  async getIntegrityScore(authContext: AuthContext): Promise<IntegrityScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toIntegrityScoreView(center.integrityScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildOperatorExperienceIntegritySnapshot({ raw });
    return buildOperatorExperienceIntegrityCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createOperatorExperienceIntegrityService(
  db: DbPool,
  repository?: OperatorExperienceIntegrityRepository
): OperatorExperienceIntegrityService {
  return new OperatorExperienceIntegrityService(db, repository);
}

export function createOperatorExperienceIntegrityModule(
  db: DbPool,
  deps?: {
    rootDir?: string;
    repository?: OperatorExperienceIntegrityRepository;
  }
) {
  const repository =
    deps?.repository ??
    createOperatorExperienceIntegrityRepository({
      rootDir: deps?.rootDir,
    });
  const operatorExperienceIntegrity = createOperatorExperienceIntegrityService(db, repository);

  return {
    operatorExperienceIntegrity,
  };
}

export type OperatorExperienceIntegrityModule = ReturnType<
  typeof createOperatorExperienceIntegrityModule
>;
