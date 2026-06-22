import type { DbPool } from "../../shared/db/index.js";
import type { AuthContext } from "../../shared/auth/index.js";
import { requireRole } from "../../security/guards.js";
import {
  buildContractOverview,
  buildEscrowOverview,
  buildExecutionOverview,
  buildIssueOverview,
  buildOfferOverview,
  buildPlatformOverview,
  buildRequestOverview,
  buildRiskOverview,
  buildTrustOverview,
  toContractOverviewView,
  toEscrowOverviewView,
  toIssueOverviewView,
  toOfferOverviewView,
  toPlatformOverviewView,
  toRequestOverviewView,
  toRiskOverviewView,
  toTrustOverviewView,
  type ContractOverviewView,
  type EscrowOverviewView,
  type IssueOverviewView,
  type OfferOverviewView,
  type PlatformOverviewView,
  type RequestOverviewView,
  type RiskOverviewView,
  type TrustOverviewView,
} from "../domain/admin-console.js";
import {
  AdminConsoleRepository,
  adminConsoleRepository,
} from "../infrastructure/admin-console-repository.js";

export class AdminConsoleService {
  private readonly repository: AdminConsoleRepository;

  constructor(
    private readonly db: DbPool,
    repository?: AdminConsoleRepository
  ) {
    this.repository = repository ?? adminConsoleRepository;
  }

  async getOverview(authContext: AuthContext): Promise<PlatformOverviewView> {
    this.assertAdminAccess(authContext);
    const snapshot = await this.loadSnapshot();
    return toPlatformOverviewView(snapshot);
  }

  async getRequests(authContext: AuthContext): Promise<RequestOverviewView> {
    this.assertAdminAccess(authContext);
    const metrics = await this.repository.getRequestMetrics(this.db.pool);
    return toRequestOverviewView(buildRequestOverview(metrics));
  }

  async getOffers(authContext: AuthContext): Promise<OfferOverviewView> {
    this.assertAdminAccess(authContext);
    const metrics = await this.repository.getOfferMetrics(this.db.pool);
    return toOfferOverviewView(buildOfferOverview(metrics));
  }

  async getContracts(authContext: AuthContext): Promise<ContractOverviewView> {
    this.assertAdminAccess(authContext);
    const metrics = await this.repository.getContractMetrics(this.db.pool);
    return toContractOverviewView(buildContractOverview(metrics));
  }

  async getEscrow(authContext: AuthContext): Promise<EscrowOverviewView> {
    this.assertAdminAccess(authContext);
    const metrics = await this.repository.getEscrowMetrics(this.db.pool);
    return toEscrowOverviewView(buildEscrowOverview(metrics));
  }

  async getIssues(authContext: AuthContext): Promise<IssueOverviewView> {
    this.assertAdminAccess(authContext);
    const metrics = await this.repository.getIssueMetrics(this.db.pool);
    return toIssueOverviewView(buildIssueOverview(metrics));
  }

  async getTrust(authContext: AuthContext): Promise<TrustOverviewView> {
    this.assertAdminAccess(authContext);
    const metrics = await this.repository.getTrustMetrics(this.db.pool);
    return toTrustOverviewView(buildTrustOverview(metrics));
  }

  async getRisks(authContext: AuthContext): Promise<RiskOverviewView> {
    this.assertAdminAccess(authContext);
    const riskMetrics = await this.repository.getRiskMetrics(this.db.pool);
    return toRiskOverviewView(buildRiskOverview(riskMetrics));
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }

  private async loadSnapshot() {
    const [
      requestMetrics,
      offerMetrics,
      contractMetrics,
      escrowMetrics,
      executionMetrics,
      issueMetrics,
      trustMetrics,
      riskMetrics,
    ] = await Promise.all([
      this.repository.getRequestMetrics(this.db.pool),
      this.repository.getOfferMetrics(this.db.pool),
      this.repository.getContractMetrics(this.db.pool),
      this.repository.getEscrowMetrics(this.db.pool),
      this.repository.getExecutionMetrics(this.db.pool),
      this.repository.getIssueMetrics(this.db.pool),
      this.repository.getTrustMetrics(this.db.pool),
      this.repository.getRiskMetrics(this.db.pool),
    ]);

    const requests = buildRequestOverview(requestMetrics);
    const offers = buildOfferOverview(offerMetrics);
    const contracts = buildContractOverview(contractMetrics);
    const escrow = buildEscrowOverview(escrowMetrics);
    const execution = buildExecutionOverview(executionMetrics);
    const issues = buildIssueOverview(issueMetrics);
    const trust = buildTrustOverview(trustMetrics);
    const risks = buildRiskOverview(riskMetrics);

    return buildPlatformOverview({
      requests,
      offers,
      contracts,
      escrow,
      execution,
      issues,
      trust,
      risks,
      failedOperations: riskMetrics.failedOperations,
    });
  }
}

export function createAdminConsoleService(
  db: DbPool,
  repository?: AdminConsoleRepository
): AdminConsoleService {
  return new AdminConsoleService(db, repository);
}

export function createOperationsModule(
  db: DbPool,
  deps?: { repository?: AdminConsoleRepository }
) {
  const adminConsole = createAdminConsoleService(db, deps?.repository);

  return {
    adminConsole,
  };
}

export type OperationsModule = ReturnType<typeof createOperationsModule>;
