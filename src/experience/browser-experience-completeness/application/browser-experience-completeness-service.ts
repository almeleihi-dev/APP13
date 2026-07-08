import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildBrowserExperienceCompletenessCenter,
  buildBrowserExperienceCompletenessSnapshot,
  toBrowserCompletenessOverviewView,
  toBrowserCompletenessRecommendationsView,
  toBrowserCompletenessScoreView,
  toBrowserExperienceCompletenessCenterView,
  toBrowserLayerAuditView,
  toBrowserRouteCompletenessView,
  toBrowserVerificationChainAuditView,
  toStaticAssetAuditView,
  toUiPageWiringAuditView,
  toX31AlignmentViewDto,
  type BrowserCompletenessOverviewView,
  type BrowserCompletenessRecommendationsView,
  type BrowserCompletenessScoreView,
  type BrowserExperienceCompletenessCenterView,
  type BrowserLayerAuditView,
  type BrowserRouteCompletenessView,
  type BrowserVerificationChainAuditView,
  type StaticAssetAuditView,
  type UiPageWiringAuditView,
  type X31AlignmentViewDto,
} from "../domain/browser-experience-completeness.js";
import {
  createBrowserExperienceCompletenessRepository,
  type BrowserExperienceCompletenessRepository,
} from "../infrastructure/browser-experience-completeness-repository.js";

export class BrowserExperienceCompletenessService {
  private readonly repository: BrowserExperienceCompletenessRepository;

  constructor(
    private readonly db: DbPool,
    repository?: BrowserExperienceCompletenessRepository
  ) {
    this.repository = repository ?? createBrowserExperienceCompletenessRepository();
  }

  async getBrowserExperienceCompletenessCenter(
    authContext: AuthContext
  ): Promise<BrowserExperienceCompletenessCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBrowserExperienceCompletenessCenterView(center);
  }

  async getBrowserCompletenessOverview(
    authContext: AuthContext
  ): Promise<BrowserCompletenessOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBrowserCompletenessOverviewView(center.overview);
  }

  async getBrowserLayerAudit(authContext: AuthContext): Promise<BrowserLayerAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBrowserLayerAuditView(center.layerAudit);
  }

  async getBrowserRouteCompleteness(
    authContext: AuthContext
  ): Promise<BrowserRouteCompletenessView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBrowserRouteCompletenessView(center.routeCompleteness);
  }

  async getStaticAssetAudit(authContext: AuthContext): Promise<StaticAssetAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toStaticAssetAuditView(center.staticAssets);
  }

  async getUiPageWiringAudit(authContext: AuthContext): Promise<UiPageWiringAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toUiPageWiringAuditView(center.uiPageWiring);
  }

  async getX31Alignment(authContext: AuthContext): Promise<X31AlignmentViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toX31AlignmentViewDto(center.x31Alignment);
  }

  async getBrowserVerificationChain(
    authContext: AuthContext
  ): Promise<BrowserVerificationChainAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBrowserVerificationChainAuditView(center.verificationChain);
  }

  async getBrowserCompletenessRecommendations(
    authContext: AuthContext
  ): Promise<BrowserCompletenessRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBrowserCompletenessRecommendationsView(center.recommendations);
  }

  async getBrowserCompletenessScore(
    authContext: AuthContext
  ): Promise<BrowserCompletenessScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBrowserCompletenessScoreView(center.completenessScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildBrowserExperienceCompletenessSnapshot({ raw });
    return buildBrowserExperienceCompletenessCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createBrowserExperienceCompletenessService(
  db: DbPool,
  repository?: BrowserExperienceCompletenessRepository
): BrowserExperienceCompletenessService {
  return new BrowserExperienceCompletenessService(db, repository);
}

export function createBrowserExperienceCompletenessModule(
  db: DbPool,
  deps?: {
    rootDir?: string;
    repository?: BrowserExperienceCompletenessRepository;
  }
) {
  const repository =
    deps?.repository ??
    createBrowserExperienceCompletenessRepository({
      rootDir: deps?.rootDir,
    });
  const browserExperienceCompleteness = createBrowserExperienceCompletenessService(db, repository);

  return {
    browserExperienceCompleteness,
  };
}

export type BrowserExperienceCompletenessModule = ReturnType<
  typeof createBrowserExperienceCompletenessModule
>;
