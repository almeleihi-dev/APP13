import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildInvestorReadinessCenter,
  buildInvestorReadinessSnapshot,
  toFundingReadinessView,
  toInvestmentOverviewView,
  toInvestorReadinessCenterView,
  toInvestorReadinessScoreView,
  toMarketOpportunityView,
  toPartnershipReadinessView,
  toRevenuePotentialView,
  toRiskMatrixView,
  toScaleReadinessView,
  toStrategicStrengthView,
  type FundingReadinessView,
  type InvestmentOverviewView,
  type InvestorReadinessCenterView,
  type InvestorReadinessScoreView,
  type MarketOpportunityView,
  type PartnershipReadinessView,
  type RevenuePotentialView,
  type RiskMatrixView,
  type ScaleReadinessView,
  type StrategicStrengthView,
} from "../domain/investor-readiness.js";
import {
  createInvestorReadinessRepository,
  type InvestorReadinessRepository,
} from "../infrastructure/investor-readiness-repository.js";

export class InvestorReadinessService {
  private readonly repository: InvestorReadinessRepository;

  constructor(
    private readonly db: DbPool,
    repository?: InvestorReadinessRepository
  ) {
    this.repository = repository ?? createInvestorReadinessRepository();
  }

  async getInvestorReadinessCenter(authContext: AuthContext): Promise<InvestorReadinessCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toInvestorReadinessCenterView(center);
  }

  async getInvestmentOverview(authContext: AuthContext): Promise<InvestmentOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toInvestmentOverviewView(center.overview);
  }

  async getMarketOpportunity(authContext: AuthContext): Promise<MarketOpportunityView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toMarketOpportunityView(center.marketOpportunity);
  }

  async getRevenuePotential(authContext: AuthContext): Promise<RevenuePotentialView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRevenuePotentialView(center.revenuePotential);
  }

  async getScaleReadiness(authContext: AuthContext): Promise<ScaleReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toScaleReadinessView(center.scaleReadiness);
  }

  async getRiskMatrix(authContext: AuthContext): Promise<RiskMatrixView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRiskMatrixView(center.riskMatrix);
  }

  async getStrategicStrengths(authContext: AuthContext): Promise<StrategicStrengthView[]> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return center.strengths.map(toStrategicStrengthView);
  }

  async getFundingReadiness(authContext: AuthContext): Promise<FundingReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toFundingReadinessView(center.fundingReadiness);
  }

  async getPartnershipReadiness(authContext: AuthContext): Promise<PartnershipReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toPartnershipReadinessView(center.partnershipReadiness);
  }

  async getInvestorReadinessScore(authContext: AuthContext): Promise<InvestorReadinessScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toInvestorReadinessScoreView(center.investorScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildInvestorReadinessSnapshot({ raw });
    return buildInvestorReadinessCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createInvestorReadinessService(
  db: DbPool,
  repository?: InvestorReadinessRepository
): InvestorReadinessService {
  return new InvestorReadinessService(db, repository);
}

export function createInvestorReadinessModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: InvestorReadinessRepository }
) {
  const repository =
    deps?.repository ??
    createInvestorReadinessRepository({
      rootDir: deps?.rootDir,
    });
  const investorReadiness = createInvestorReadinessService(db, repository);

  return {
    investorReadiness,
  };
}

export type InvestorReadinessModule = ReturnType<typeof createInvestorReadinessModule>;
