import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildOperatorOnboardingReadinessCenter,
  buildOperatorOnboardingReadinessSnapshot,
  toBlockerRegisterView,
  toOnboardingChecklistView,
  toOnboardingOverviewView,
  toOnboardingReadinessScoreView,
  toOnboardingRecommendationsView,
  toOnboardingVerificationChainAuditView,
  toOperatorOnboardingReadinessCenterView,
  toRemediationQueueView,
  toWarningRegisterView,
  toXStackReadinessMatrixView,
  type BlockerRegisterView,
  type OnboardingChecklistView,
  type OnboardingOverviewView,
  type OnboardingReadinessScoreView,
  type OnboardingRecommendationsView,
  type OnboardingVerificationChainAuditView,
  type OperatorOnboardingReadinessCenterView,
  type RemediationQueueView,
  type WarningRegisterView,
  type XStackReadinessMatrixView,
} from "../domain/operator-onboarding-readiness.js";
import {
  createOperatorOnboardingReadinessRepository,
  type OperatorOnboardingReadinessRepository,
} from "../infrastructure/operator-onboarding-readiness-repository.js";

export class OperatorOnboardingReadinessService {
  private readonly repository: OperatorOnboardingReadinessRepository;

  constructor(
    private readonly db: DbPool,
    repository?: OperatorOnboardingReadinessRepository
  ) {
    this.repository = repository ?? createOperatorOnboardingReadinessRepository();
  }

  async getOperatorOnboardingReadinessCenter(
    authContext: AuthContext
  ): Promise<OperatorOnboardingReadinessCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperatorOnboardingReadinessCenterView(center);
  }

  async getOnboardingOverview(authContext: AuthContext): Promise<OnboardingOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOnboardingOverviewView(center.overview);
  }

  async getBlockerRegister(authContext: AuthContext): Promise<BlockerRegisterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toBlockerRegisterView(center.blockers);
  }

  async getWarningRegister(authContext: AuthContext): Promise<WarningRegisterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toWarningRegisterView(center.warnings);
  }

  async getRemediationQueue(authContext: AuthContext): Promise<RemediationQueueView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toRemediationQueueView(center.remediationQueue);
  }

  async getOnboardingChecklist(authContext: AuthContext): Promise<OnboardingChecklistView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOnboardingChecklistView(center.checklist);
  }

  async getXStackReadiness(authContext: AuthContext): Promise<XStackReadinessMatrixView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toXStackReadinessMatrixView(center.xStackReadiness);
  }

  async getVerificationChain(authContext: AuthContext): Promise<OnboardingVerificationChainAuditView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOnboardingVerificationChainAuditView(center.verificationChain);
  }

  async getOnboardingRecommendations(
    authContext: AuthContext
  ): Promise<OnboardingRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOnboardingRecommendationsView(center.recommendations);
  }

  async getOnboardingScore(authContext: AuthContext): Promise<OnboardingReadinessScoreView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOnboardingReadinessScoreView(center.onboardingScore);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildOperatorOnboardingReadinessSnapshot({ raw });
    return buildOperatorOnboardingReadinessCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createOperatorOnboardingReadinessService(
  db: DbPool,
  repository?: OperatorOnboardingReadinessRepository
): OperatorOnboardingReadinessService {
  return new OperatorOnboardingReadinessService(db, repository);
}

export function createOperatorOnboardingReadinessModule(
  db: DbPool,
  deps?: {
    rootDir?: string;
    repository?: OperatorOnboardingReadinessRepository;
  }
) {
  const repository =
    deps?.repository ??
    createOperatorOnboardingReadinessRepository({
      rootDir: deps?.rootDir,
    });
  const operatorOnboardingReadiness = createOperatorOnboardingReadinessService(db, repository);

  return {
    operatorOnboardingReadiness,
  };
}

export type OperatorOnboardingReadinessModule = ReturnType<
  typeof createOperatorOnboardingReadinessModule
>;
