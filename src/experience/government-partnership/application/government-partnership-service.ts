import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildGovernmentPartnershipCenter,
  buildGovernmentPartnershipSnapshot,
  toDigitalGovernmentAlignmentView,
  toEconomicImpactView,
  toFinancialAlignmentView,
  toGovernmentPartnershipCenterView,
  toGovernmentPartnershipOverviewView,
  toGovernmentReadinessScoreView,
  toInsuranceAlignmentView,
  toPartnershipMatrixView,
  toRegulatoryAlignmentView,
  toWorkforceDevelopmentView,
  toWorkforceImpactView,
  type DigitalGovernmentAlignmentView,
  type EconomicImpactView,
  type FinancialAlignmentView,
  type GovernmentPartnershipCenterView,
  type GovernmentPartnershipOverviewView,
  type GovernmentReadinessScoreView,
  type InsuranceAlignmentView,
  type PartnershipMatrixView,
  type RegulatoryAlignmentView,
  type WorkforceDevelopmentView,
  type WorkforceImpactView,
} from "../domain/government-partnership.js";
import {
  createGovernmentPartnershipRepository,
  type GovernmentPartnershipRepository,
} from "../infrastructure/government-partnership-repository.js";

export class GovernmentPartnershipService {
  private readonly repository: GovernmentPartnershipRepository;

  constructor(
    private readonly db: DbPool,
    repository?: GovernmentPartnershipRepository
  ) {
    this.repository = repository ?? createGovernmentPartnershipRepository();
  }

  async getGovernmentPartnershipCenter(
    authContext: AuthContext
  ): Promise<GovernmentPartnershipCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toGovernmentPartnershipCenterView(center);
  }

  async getGovernmentPartnershipOverview(
    authContext: AuthContext
  ): Promise<GovernmentPartnershipOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toGovernmentPartnershipOverviewView(center.overview);
  }

  async getEconomicImpact(authContext: AuthContext): Promise<EconomicImpactView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toEconomicImpactView(center.economicImpact);
  }

  async getWorkforceImpact(authContext: AuthContext): Promise<WorkforceImpactView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toWorkforceImpactView(center.workforceImpact);
  }

  async getFinancialAlignment(authContext: AuthContext): Promise<FinancialAlignmentView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toFinancialAlignmentView(center.financialAlignment);
  }

  async getInsuranceAlignment(authContext: AuthContext): Promise<InsuranceAlignmentView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toInsuranceAlignmentView(center.insuranceAlignment);
  }

  async getWorkforceDevelopmentAlignment(
    authContext: AuthContext
  ): Promise<WorkforceDevelopmentView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toWorkforceDevelopmentView(center.workforceDevelopment);
  }

  async getDigitalGovernmentAlignment(
    authContext: AuthContext
  ): Promise<DigitalGovernmentAlignmentView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDigitalGovernmentAlignmentView(center.digitalGovernment);
  }

  async getRegulatoryAlignment(authContext: AuthContext): Promise<RegulatoryAlignmentView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRegulatoryAlignmentView(center.regulatoryAlignment);
  }

  async getPartnershipMatrix(authContext: AuthContext): Promise<PartnershipMatrixView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toPartnershipMatrixView(center.partnershipMatrix);
  }

  async getGovernmentReadinessScore(
    authContext: AuthContext
  ): Promise<GovernmentReadinessScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toGovernmentReadinessScoreView(center.governmentScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildGovernmentPartnershipSnapshot({ raw });
    return buildGovernmentPartnershipCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createGovernmentPartnershipService(
  db: DbPool,
  repository?: GovernmentPartnershipRepository
): GovernmentPartnershipService {
  return new GovernmentPartnershipService(db, repository);
}

export function createGovernmentPartnershipModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: GovernmentPartnershipRepository }
) {
  const repository =
    deps?.repository ??
    createGovernmentPartnershipRepository({
      rootDir: deps?.rootDir,
    });
  const governmentPartnership = createGovernmentPartnershipService(db, repository);

  return {
    governmentPartnership,
  };
}

export type GovernmentPartnershipModule = ReturnType<typeof createGovernmentPartnershipModule>;
