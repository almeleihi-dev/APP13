import type { AuthContext } from "../../../shared/auth/index.js";
import type { DbPool } from "../../../shared/db/index.js";
import { notFound } from "../../../shared/errors/index.js";
import {
  buildContractJourney,
  buildJourneyProgress,
  buildJourneyTimeline,
  toContractJourneyView,
  toJourneyProgressView,
  toJourneyTimelineView,
  type ContractJourneyView,
  type JourneyPerspective,
  type JourneyProgressView,
  type JourneyTimelineView,
} from "../domain/contract-journey.js";
import {
  ContractJourneyRepository,
  contractJourneyRepository,
} from "../infrastructure/contract-journey-repository.js";

export class ContractJourneyService {
  private readonly repository: ContractJourneyRepository;

  constructor(
    private readonly db: DbPool,
    repository?: ContractJourneyRepository
  ) {
    this.repository = repository ?? contractJourneyRepository;
  }

  async getJourney(
    authContext: AuthContext,
    contractId: string
  ): Promise<ContractJourneyView> {
    const journey = await this.buildJourney(authContext, contractId);
    return toContractJourneyView(journey);
  }

  async getTimeline(
    authContext: AuthContext,
    contractId: string
  ): Promise<JourneyTimelineView> {
    const snapshot = await this.requireSnapshot(authContext, contractId);
    const timeline = buildJourneyTimeline(snapshot);
    return toJourneyTimelineView(contractId, timeline, new Date());
  }

  async getProgress(
    authContext: AuthContext,
    contractId: string
  ): Promise<JourneyProgressView> {
    const snapshot = await this.requireSnapshot(authContext, contractId);
    return toJourneyProgressView(buildJourneyProgress(snapshot));
  }

  private async buildJourney(authContext: AuthContext, contractId: string) {
    const snapshot = await this.requireSnapshot(authContext, contractId);
    return buildContractJourney({
      snapshot,
      perspective: this.resolvePerspective(snapshot, authContext.userId),
    });
  }

  private async requireSnapshot(authContext: AuthContext, contractId: string) {
    const snapshot = await this.repository.loadSnapshot(this.db.pool, contractId);
    if (!snapshot) {
      throw notFound("Contract journey not found");
    }

    const isParty = await this.repository.isPartyToContract(
      this.db.pool,
      contractId,
      authContext.userId
    );
    if (!isParty) {
      throw notFound("Contract journey not found");
    }

    return snapshot;
  }

  private resolvePerspective(
    snapshot: { customerUserId: string; providerUserId: string },
    userId: string
  ): JourneyPerspective {
    if (userId === snapshot.customerUserId) return "customer";
    if (userId === snapshot.providerUserId) return "provider";
    return "customer";
  }
}

export function createContractJourneyService(
  db: DbPool,
  repository?: ContractJourneyRepository
): ContractJourneyService {
  return new ContractJourneyService(db, repository);
}

export function createContractJourneyModule(
  db: DbPool,
  deps?: { repository?: ContractJourneyRepository }
) {
  const contractJourney = createContractJourneyService(db, deps?.repository);

  return {
    contractJourney,
  };
}

export type ContractJourneyModule = ReturnType<typeof createContractJourneyModule>;
