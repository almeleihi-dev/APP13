import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildOperatorSurfaceNavigationCenter,
  buildOperatorSurfaceNavigationSnapshot,
  toCrossLinkAuditView,
  toNavigationRecommendationsView,
  toNavigationScoreView,
  toOperatorJourneyAuditView,
  toOperatorSurfaceNavigationCenterView,
  toOperatorSurfaceNavigationOverviewView,
  toOrphanCenterAuditView,
  toSurfaceMapView,
  toXStackAlignmentViewDto,
  type CrossLinkAuditView,
  type NavigationRecommendationsView,
  type NavigationScoreView,
  type OperatorJourneyAuditView,
  type OperatorSurfaceNavigationCenterView,
  type OperatorSurfaceNavigationOverviewView,
  type OrphanCenterAuditView,
  type SurfaceMapView,
  type XStackAlignmentViewDto,
} from "../domain/operator-surface-navigation.js";
import {
  createOperatorSurfaceNavigationRepository,
  type OperatorSurfaceNavigationRepository,
} from "../infrastructure/operator-surface-navigation-repository.js";

export class OperatorSurfaceNavigationService {
  private readonly repository: OperatorSurfaceNavigationRepository;

  constructor(
    private readonly db: DbPool,
    repository?: OperatorSurfaceNavigationRepository
  ) {
    this.repository = repository ?? createOperatorSurfaceNavigationRepository();
  }

  async getOperatorSurfaceNavigationCenter(
    authContext: AuthContext
  ): Promise<OperatorSurfaceNavigationCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperatorSurfaceNavigationCenterView(center);
  }

  async getNavigationOverview(
    authContext: AuthContext
  ): Promise<OperatorSurfaceNavigationOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperatorSurfaceNavigationOverviewView(center.overview);
  }

  async getSurfaceMap(authContext: AuthContext): Promise<SurfaceMapView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSurfaceMapView(center.surfaceMap);
  }

  async getCrossLinkAudit(authContext: AuthContext): Promise<CrossLinkAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toCrossLinkAuditView(center.crossLinks);
  }

  async getOperatorJourneyAudit(authContext: AuthContext): Promise<OperatorJourneyAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperatorJourneyAuditView(center.journeys);
  }

  async getOrphanCenterAudit(authContext: AuthContext): Promise<OrphanCenterAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOrphanCenterAuditView(center.orphanCenters);
  }

  async getXStackAlignment(authContext: AuthContext): Promise<XStackAlignmentViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toXStackAlignmentViewDto(center.xStackAlignment);
  }

  async getNavigationRecommendations(
    authContext: AuthContext
  ): Promise<NavigationRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toNavigationRecommendationsView(center.recommendations);
  }

  async getNavigationScore(authContext: AuthContext): Promise<NavigationScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toNavigationScoreView(center.navigationScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildOperatorSurfaceNavigationSnapshot({ raw });
    return buildOperatorSurfaceNavigationCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createOperatorSurfaceNavigationService(
  db: DbPool,
  repository?: OperatorSurfaceNavigationRepository
): OperatorSurfaceNavigationService {
  return new OperatorSurfaceNavigationService(db, repository);
}

export function createOperatorSurfaceNavigationModule(
  db: DbPool,
  deps?: {
    rootDir?: string;
    repository?: OperatorSurfaceNavigationRepository;
  }
) {
  const repository =
    deps?.repository ??
    createOperatorSurfaceNavigationRepository({
      rootDir: deps?.rootDir,
    });
  const operatorSurfaceNavigation = createOperatorSurfaceNavigationService(db, repository);

  return {
    operatorSurfaceNavigation,
  };
}

export type OperatorSurfaceNavigationModule = ReturnType<typeof createOperatorSurfaceNavigationModule>;
