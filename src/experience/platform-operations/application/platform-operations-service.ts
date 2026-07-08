import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { requireRole } from "../../../security/guards.js";
import {
  buildPlatformOperationsCenter,
  buildPlatformOperationsSnapshot,
  toComplaintOperationsViewDto,
  toContractOperationsViewDto,
  toEscrowOperationsViewDto,
  toExecutionOperationsViewDto,
  toFinancialOperationsViewDto,
  toOperationalRecommendationsView,
  toOperationalRiskRegisterView,
  toOperationsOverviewView,
  toPlatformOperationsCenterView,
  toSystemHealthViewDto,
  toTrustOperationsViewDto,
  type ComplaintOperationsViewDto,
  type ContractOperationsViewDto,
  type EscrowOperationsViewDto,
  type ExecutionOperationsViewDto,
  type FinancialOperationsViewDto,
  type OperationalRecommendationsView,
  type OperationalRiskRegisterView,
  type OperationsOverviewView,
  type PlatformOperationsCenterView,
  type SystemHealthViewDto,
  type TrustOperationsViewDto,
} from "../domain/platform-operations.js";
import {
  createPlatformOperationsRepository,
  type PlatformOperationsRepository,
} from "../infrastructure/platform-operations-repository.js";

export class PlatformOperationsService {
  private readonly repository: PlatformOperationsRepository;

  constructor(
    private readonly db: DbPool,
    repository?: PlatformOperationsRepository
  ) {
    this.repository = repository ?? createPlatformOperationsRepository();
  }

  async getPlatformOperationsCenter(
    authContext: AuthContext
  ): Promise<PlatformOperationsCenterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toPlatformOperationsCenterView(center);
  }

  async getOperationsOverview(authContext: AuthContext): Promise<OperationsOverviewView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperationsOverviewView(center.overview);
  }

  async getContractOperations(authContext: AuthContext): Promise<ContractOperationsViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toContractOperationsViewDto(center.contracts);
  }

  async getEscrowOperations(authContext: AuthContext): Promise<EscrowOperationsViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toEscrowOperationsViewDto(center.escrow);
  }

  async getTrustOperations(authContext: AuthContext): Promise<TrustOperationsViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toTrustOperationsViewDto(center.trust);
  }

  async getComplaintOperations(authContext: AuthContext): Promise<ComplaintOperationsViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toComplaintOperationsViewDto(center.complaints);
  }

  async getExecutionOperations(authContext: AuthContext): Promise<ExecutionOperationsViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toExecutionOperationsViewDto(center.execution);
  }

  async getFinancialOperations(authContext: AuthContext): Promise<FinancialOperationsViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toFinancialOperationsViewDto(center.financial);
  }

  async getSystemHealthView(authContext: AuthContext): Promise<SystemHealthViewDto> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toSystemHealthViewDto(center.systemHealth);
  }

  async getOperationalRiskRegister(
    authContext: AuthContext
  ): Promise<OperationalRiskRegisterView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperationalRiskRegisterView(center.riskRegister);
  }

  async getOperationalRecommendations(
    authContext: AuthContext
  ): Promise<OperationalRecommendationsView> {
    this.assertAdminAccess(authContext);
    const center = await this.buildCenter();
    return toOperationalRecommendationsView(center.recommendations);
  }

  private async buildCenter() {
    const raw = await this.repository.loadRawSnapshot(this.db.pool);
    const snapshot = buildPlatformOperationsSnapshot({ raw });
    return buildPlatformOperationsCenter({ snapshot });
  }

  private assertAdminAccess(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createPlatformOperationsService(
  db: DbPool,
  repository?: PlatformOperationsRepository
): PlatformOperationsService {
  return new PlatformOperationsService(db, repository);
}

export function createPlatformOperationsModule(
  db: DbPool,
  deps?: { repository?: PlatformOperationsRepository }
) {
  const repository = deps?.repository ?? createPlatformOperationsRepository();
  const platformOperations = createPlatformOperationsService(db, repository);

  return {
    platformOperations,
  };
}

export type PlatformOperationsModule = ReturnType<typeof createPlatformOperationsModule>;
