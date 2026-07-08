import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildSecurityReadinessCenter,
  buildSecurityReadinessSnapshot,
  toApiSecurityAuditView,
  toAuditabilityReviewView,
  toAuthenticationAuditView,
  toAuthorizationAuditView,
  toComplianceReadinessView,
  toDataProtectionAuditView,
  toSecretsAuditView,
  toSecurityOverviewView,
  toSecurityReadinessCenterView,
  toSecurityRecommendationsView,
  toSecurityRiskRegisterView,
  type ApiSecurityAuditView,
  type AuditabilityReviewView,
  type AuthenticationAuditView,
  type AuthorizationAuditView,
  type ComplianceReadinessView,
  type DataProtectionAuditView,
  type SecretsAuditView,
  type SecurityOverviewView,
  type SecurityReadinessCenterView,
  type SecurityRecommendationsView,
  type SecurityRiskRegisterView,
} from "../domain/security-readiness.js";
import {
  createSecurityReadinessRepository,
  type SecurityReadinessRepository,
} from "../infrastructure/security-readiness-repository.js";

export class SecurityReadinessService {
  private readonly repository: SecurityReadinessRepository;

  constructor(
    private readonly db: DbPool,
    repository?: SecurityReadinessRepository
  ) {
    this.repository = repository ?? createSecurityReadinessRepository();
  }

  async getSecurityReadinessCenter(
    authContext: AuthContext
  ): Promise<SecurityReadinessCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecurityReadinessCenterView(center);
  }

  async getSecurityOverview(authContext: AuthContext): Promise<SecurityOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecurityOverviewView(center.overview);
  }

  async getAuthenticationAudit(authContext: AuthContext): Promise<AuthenticationAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toAuthenticationAuditView(center.authentication);
  }

  async getAuthorizationAudit(authContext: AuthContext): Promise<AuthorizationAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toAuthorizationAuditView(center.authorization);
  }

  async getSecretsAudit(authContext: AuthContext): Promise<SecretsAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecretsAuditView(center.secrets);
  }

  async getApiSecurityAudit(authContext: AuthContext): Promise<ApiSecurityAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toApiSecurityAuditView(center.apiSecurity);
  }

  async getDataProtectionAudit(authContext: AuthContext): Promise<DataProtectionAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toDataProtectionAuditView(center.dataProtection);
  }

  async getAuditabilityReview(authContext: AuthContext): Promise<AuditabilityReviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toAuditabilityReviewView(center.auditability);
  }

  async getComplianceReadiness(authContext: AuthContext): Promise<ComplianceReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toComplianceReadinessView(center.compliance);
  }

  async getSecurityRiskRegister(authContext: AuthContext): Promise<SecurityRiskRegisterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecurityRiskRegisterView(center.riskRegister);
  }

  async getSecurityRecommendations(
    authContext: AuthContext
  ): Promise<SecurityRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSecurityRecommendationsView(center.recommendations);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildSecurityReadinessSnapshot({ raw });
    return buildSecurityReadinessCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createSecurityReadinessService(
  db: DbPool,
  repository?: SecurityReadinessRepository
): SecurityReadinessService {
  return new SecurityReadinessService(db, repository);
}

export function createSecurityReadinessModule(
  db: DbPool,
  deps?: { rootDir?: string; runtimeEnvKeys?: Set<string>; repository?: SecurityReadinessRepository }
) {
  const repository =
    deps?.repository ??
    createSecurityReadinessRepository({
      rootDir: deps?.rootDir,
      runtimeEnvKeys: deps?.runtimeEnvKeys,
    });
  const securityReadiness = createSecurityReadinessService(db, repository);

  return {
    securityReadiness,
  };
}

export type SecurityReadinessModule = ReturnType<typeof createSecurityReadinessModule>;
