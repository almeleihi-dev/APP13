import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildApiAuditCenter,
  buildApiAuditSnapshot,
  toApiAuditCenterView,
  toApiDocumentationAuditView,
  toApiOverviewView,
  toApiProductionReadinessView,
  toApiRecommendationsView,
  toApiRiskRegisterView,
  toAuthenticationAuditView,
  toEndpointCoverageAuditView,
  toModuleExposureAuditView,
  toRouteRegistryAuditView,
  type ApiAuditCenterView,
  type ApiDocumentationAuditView,
  type ApiOverviewView,
  type ApiProductionReadinessView,
  type ApiRecommendationsView,
  type ApiRiskRegisterView,
  type AuthenticationAuditView,
  type EndpointCoverageAuditView,
  type ModuleExposureAuditView,
  type RouteRegistryAuditView,
} from "../domain/api-audit.js";
import {
  createApiAuditRepository,
  type ApiAuditRepository,
} from "../infrastructure/api-audit-repository.js";

export class ApiAuditService {
  private readonly repository: ApiAuditRepository;

  constructor(
    private readonly db: DbPool,
    repository?: ApiAuditRepository
  ) {
    this.repository = repository ?? createApiAuditRepository();
  }

  async getApiAuditCenter(authContext: AuthContext): Promise<ApiAuditCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toApiAuditCenterView(center);
  }

  async getApiOverview(authContext: AuthContext): Promise<ApiOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toApiOverviewView(center.overview);
  }

  async getRouteRegistryAudit(authContext: AuthContext): Promise<RouteRegistryAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRouteRegistryAuditView(center.routeRegistry);
  }

  async getEndpointCoverageAudit(authContext: AuthContext): Promise<EndpointCoverageAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toEndpointCoverageAuditView(center.endpointCoverage);
  }

  async getAuthenticationAudit(authContext: AuthContext): Promise<AuthenticationAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toAuthenticationAuditView(center.authentication);
  }

  async getApiDocumentationAudit(authContext: AuthContext): Promise<ApiDocumentationAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toApiDocumentationAuditView(center.documentation);
  }

  async getModuleExposureAudit(authContext: AuthContext): Promise<ModuleExposureAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toModuleExposureAuditView(center.moduleExposure);
  }

  async getApiProductionReadiness(authContext: AuthContext): Promise<ApiProductionReadinessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toApiProductionReadinessView(center.productionReadiness);
  }

  async getApiRiskRegister(authContext: AuthContext): Promise<ApiRiskRegisterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toApiRiskRegisterView(center.riskRegister);
  }

  async getApiRecommendations(authContext: AuthContext): Promise<ApiRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toApiRecommendationsView(center.recommendations);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildApiAuditSnapshot({ raw });
    return buildApiAuditCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createApiAuditService(
  db: DbPool,
  repository?: ApiAuditRepository
): ApiAuditService {
  return new ApiAuditService(db, repository);
}

export function createApiAuditModule(
  db: DbPool,
  deps?: { rootDir?: string; repository?: ApiAuditRepository }
) {
  const repository =
    deps?.repository ??
    createApiAuditRepository({
      rootDir: deps?.rootDir,
    });
  const apiAudit = createApiAuditService(db, repository);

  return {
    apiAudit,
  };
}

export type ApiAuditModule = ReturnType<typeof createApiAuditModule>;
