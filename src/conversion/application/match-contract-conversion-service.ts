import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import type { ContractCreationBridgeService } from "../../contracts-experience/application/contract-creation-bridge-service.js";
import { createContractsExperienceModule } from "../../contracts-experience/application/contract-creation-bridge-service.js";
import type { ContractInitiationService } from "../../contracts-experience/application/contract-initiation-service.js";
import type { ContractDraftView } from "../../contracts-experience/domain/contract-initiation.js";
import type { RequestRepository } from "../../request-experience/infrastructure/request-repository.js";
import { requestRepository } from "../../request-experience/infrastructure/request-repository.js";
import type { MatchingService } from "../../matching/application/matching-service.js";
import { createMatchingService } from "../../matching/application/matching-service.js";
import {
  buildContractDraftPreview,
  buildConversionSummary,
  buildMatchContractConversion,
  canAcceptOffer,
  canCancelOffer,
  canPreviewDraft,
  normalizeProposedCommercialTerms,
  toAcceptConversionResultView,
  toContractDraftPreviewView,
  toContractOfferView,
  toMarketplaceProviderRecord,
  type AcceptConversionResultView,
  type ContractDraftPreviewView,
  type ContractOfferView,
  type ProposedCommercialTerms,
} from "../domain/match-contract-conversion.js";
import {
  MatchContractConversionRepository,
  matchContractConversionRepository,
} from "../infrastructure/match-contract-conversion-repository.js";
import type { EventInboxService } from "../../notifications/application/event-inbox-service.js";
import { observeInboxContractCreated, observeInboxOfferCreated } from "../../notifications/application/event-inbox-service.js";

export interface CreateContractOfferInput {
  customer_request_id: string;
  provider_user_id: string;
  selected_action_id: string;
  commercial_terms?: ProposedCommercialTerms;
  idempotency_key?: string;
}

export interface MatchContractConversionServiceDependencies {
  db: DbPool;
  requestRepository: RequestRepository;
  conversionRepository: MatchContractConversionRepository;
  contractInitiation: ContractInitiationService;
  contractBridge: ContractCreationBridgeService;
  matching: MatchingService;
  eventInbox?: EventInboxService;
}

export class MatchContractConversionService {
  private readonly conversionRepository: MatchContractConversionRepository;

  constructor(private readonly deps: MatchContractConversionServiceDependencies) {
    this.conversionRepository =
      deps.conversionRepository ?? matchContractConversionRepository;
  }

  async createContractOffer(
    customerUserId: string,
    input: CreateContractOfferInput
  ): Promise<ContractOfferView> {
    const request = await this.deps.requestRepository.findById(
      this.deps.db.pool,
      input.customer_request_id
    );
    if (!request || request.customerUserId !== customerUserId) {
      throw notFound();
    }

    const provider = await this.conversionRepository.findProviderByUserId(
      this.deps.db.pool,
      input.provider_user_id
    );
    if (!provider) {
      throw this.validationError("provider does not exist");
    }

    const publishedAction = await this.conversionRepository.findPublishedActionForProvider(
      this.deps.db.pool,
      input.selected_action_id,
      provider.id
    );
    if (!publishedAction) {
      throw this.validationError("selected action does not exist or does not belong to provider");
    }

    await this.assertProviderIsMatchable(request.id, provider.id, publishedAction.actionCode);

    const commercialTerms = normalizeProposedCommercialTerms(input.commercial_terms);
    const matchableProviders = await this.deps.requestRepository.listMatchableProviders(
      this.deps.db.pool
    );
    const matchable = matchableProviders.find((entry) => entry.providerId === provider.id);
    if (!matchable) {
      throw this.validationError("provider is not matchable");
    }

    const marketplaceProvider = toMarketplaceProviderRecord(
      matchable,
      commercialTerms,
      request
    );
    const initiation = this.deps.contractInitiation.startContractInitiation(
      {
        customerId: request.customerId,
        providerId: provider.id,
        actionCode: publishedAction.actionCode,
        proposedTitle: commercialTerms.title,
        proposedDescription: commercialTerms.description ?? request.requestText.slice(0, 500),
      },
      { providers: [marketplaceProvider], generatedAt: new Date() }
    );

    if (!initiation) {
      throw this.validationError("unable to build contract initiation for selected match");
    }

    const draftView = await this.deps.contractInitiation.buildContractDraftView(initiation, {
      providers: [marketplaceProvider],
      generatedAt: initiation.createdAt,
    });

    if (!draftView) {
      throw this.validationError("unable to build contract draft preview");
    }

    if (commercialTerms.estimatedDuration) {
      draftView.commercialTerms.estimatedDuration = commercialTerms.estimatedDuration;
    }

    const draftPreview = buildContractDraftPreview(draftView);
    const idempotencyKey =
      input.idempotency_key ??
      `s8-offer:${request.id}:${provider.id}:${publishedAction.id}`;

    const { offer, created } = await this.conversionRepository.createOffer(this.deps.db.pool, {
      customerRequestId: request.id,
      customerUserId: request.customerUserId,
      customerId: request.customerId,
      providerId: provider.id,
      providerUserId: provider.userId,
      selectedActionId: publishedAction.id,
      selectedActionCode: publishedAction.actionCode,
      commercialTerms,
      draftPreview,
      idempotencyKey,
    });

    if (created) {
      await this.deps.db.withTransaction(async (tx) => {
        await observeInboxOfferCreated(this.deps.eventInbox, tx, {
          offerId: offer.id,
          customerUserId: offer.customerUserId,
          providerUserId: offer.providerUserId,
        });
      });
    }

    return toContractOfferView(
      buildMatchContractConversion({
        offer,
        draftPreview,
      })
    );
  }

  async getContractOffer(customerUserId: string, offerId: string): Promise<ContractOfferView> {
    const offer = await this.requireOwnedOffer(customerUserId, offerId);
    const draftPreview = await this.conversionRepository.getDraftPreview(
      this.deps.db.pool,
      offerId
    );

    return toContractOfferView(
      buildMatchContractConversion({
        offer,
        draftPreview,
      })
    );
  }

  async getContractDraftPreview(
    customerUserId: string,
    offerId: string
  ): Promise<ContractDraftPreviewView> {
    const offer = await this.requireOwnedOffer(customerUserId, offerId);
    if (!canPreviewDraft(offer.status)) {
      throw this.validationError(`offer cannot be previewed in status ${offer.status}`);
    }

    let draftPreview = await this.conversionRepository.getDraftPreview(
      this.deps.db.pool,
      offerId
    );
    if (!draftPreview) {
      throw notFound();
    }

    if (offer.status === "offer_created") {
      const updated = await this.conversionRepository.saveDraftPreview(
        this.deps.db.pool,
        offerId,
        draftPreview,
        "draft_previewed"
      );
      return toContractDraftPreviewView(updated, draftPreview);
    }

    return toContractDraftPreviewView(offer, draftPreview);
  }

  async acceptContractOffer(
    customerUserId: string,
    offerId: string
  ): Promise<AcceptConversionResultView> {
    return this.deps.db.withTransaction(async (tx) => {
      const locked = await this.conversionRepository.findOfferByIdForUpdate(tx, offerId);
      if (!locked || locked.customerUserId !== customerUserId) {
        throw notFound();
      }

      if (locked.status === "contract_created" && locked.contractId) {
        const contract = await this.loadContractSummary(locked);
        return toAcceptConversionResultView({
          offer: locked,
          result: contract,
          summary: buildConversionSummary(locked),
        });
      }

      if (!canAcceptOffer(locked.status)) {
        throw this.validationError(`offer cannot be accepted in status ${locked.status}`);
      }

      const draftPreview = await this.conversionRepository.getDraftPreview(tx, offerId);
      if (!draftPreview) {
        throw notFound();
      }

      await this.conversionRepository.updateStatus(tx, offerId, "accepted");

      const draftView = await this.rebuildDraftView(locked, draftPreview);
      const outcome = await this.deps.contractBridge.createContractFromDraft({
        draft: draftView,
        customerId: locked.customerId,
        customerUserId: locked.customerUserId,
        providerId: locked.providerId,
        idempotencyKey: `s8-accept:${locked.id}`,
      });

      if (!outcome.ok) {
        throw this.validationError(outcome.validation.errors.join("; "));
      }

      const completed = await this.conversionRepository.updateStatus(
        tx,
        offerId,
        "contract_created",
        outcome.result.contractId
      );

      await observeInboxContractCreated(this.deps.eventInbox, tx, {
        contractId: outcome.result.contractId,
        customerUserId: locked.customerUserId,
        providerUserId: locked.providerUserId,
        offerId: locked.id,
      });

      return toAcceptConversionResultView({
        offer: completed,
        result: outcome.result,
        summary: buildConversionSummary(completed),
      });
    });
  }

  async cancelContractOffer(
    customerUserId: string,
    offerId: string
  ): Promise<ContractOfferView> {
    const offer = await this.requireOwnedOffer(customerUserId, offerId);
    if (!canCancelOffer(offer.status)) {
      throw this.validationError(`offer cannot be cancelled in status ${offer.status}`);
    }

    const cancelled = await this.conversionRepository.updateStatus(
      this.deps.db.pool,
      offerId,
      "cancelled"
    );

    return toContractOfferView(
      buildMatchContractConversion({
        offer: cancelled,
        draftPreview: await this.conversionRepository.getDraftPreview(
          this.deps.db.pool,
          offerId
        ),
      })
    );
  }

  private async requireOwnedOffer(customerUserId: string, offerId: string) {
    const offer = await this.conversionRepository.findOfferById(this.deps.db.pool, offerId);
    if (!offer || offer.customerUserId !== customerUserId) {
      throw notFound();
    }
    return offer;
  }

  private async assertProviderIsMatchable(
    requestId: string,
    providerId: string,
    actionCode: string
  ): Promise<void> {
    const request = await this.deps.requestRepository.findById(this.deps.db.pool, requestId);
    if (!request) {
      throw notFound();
    }

    const providers = await this.deps.requestRepository.listMatchableProviders(this.deps.db.pool);
    const matchable = providers.find((entry) => entry.providerId === providerId);
    if (!matchable || !matchable.actionCodes.includes(actionCode)) {
      throw this.validationError("provider is not matchable for the selected action");
    }

    const ranked = this.deps.matching.getBestMatches(
      {
        actionId: actionCode,
        budget: request.budget ?? undefined,
      },
      [
        {
          providerId: matchable.providerId,
          trustScore: matchable.trustScore,
          availableNow: matchable.availableNow,
          distanceKm: matchable.distanceKm,
          priceEstimate: matchable.priceEstimate,
          completedContractsForAction: matchable.completedContractsForAction,
        },
      ],
      1
    );

    if (ranked.length === 0) {
      throw this.validationError("provider is not matchable for this request");
    }
  }

  private async rebuildDraftView(
    offer: Awaited<ReturnType<MatchContractConversionRepository["findOfferById"]>> & object,
    preview: NonNullable<Awaited<ReturnType<MatchContractConversionRepository["getDraftPreview"]>>>
  ): Promise<ContractDraftView> {
    const request = await this.deps.requestRepository.findById(
      this.deps.db.pool,
      offer.customerRequestId
    );
    if (!request) throw notFound();

    const matchableProviders = await this.deps.requestRepository.listMatchableProviders(
      this.deps.db.pool
    );
    const matchable = matchableProviders.find((entry) => entry.providerId === offer.providerId);
    if (!matchable) throw notFound();

    const marketplaceProvider = toMarketplaceProviderRecord(
      matchable,
      offer.commercialTerms,
      request
    );

    const initiation = this.deps.contractInitiation.startContractInitiation(
      {
        customerId: offer.customerId,
        providerId: offer.providerId,
        actionCode: offer.selectedActionCode,
        proposedTitle: preview.proposedTitle,
        proposedDescription: preview.proposedDescription,
        createdAt: preview.generatedAt,
      },
      { providers: [marketplaceProvider], generatedAt: preview.generatedAt }
    );

    if (!initiation) throw notFound();

    const draftView = await this.deps.contractInitiation.buildContractDraftView(initiation, {
      providers: [marketplaceProvider],
      generatedAt: preview.generatedAt,
    });

    if (!draftView) throw notFound();

    draftView.commercialTerms.estimatedValue = preview.estimatedValue;
    draftView.commercialTerms.estimatedDuration = preview.estimatedDuration;
    draftView.proposedTitle = preview.proposedTitle;
    draftView.proposedDescription = preview.proposedDescription;

    return draftView;
  }

  private async loadContractSummary(
    offer: NonNullable<Awaited<ReturnType<MatchContractConversionRepository["findOfferById"]>>>
  ) {
    const { contractRepository } = await import(
      "../../contract/infrastructure/contract-repository.js"
    );
    const contract = await contractRepository.findById(this.deps.db.pool, offer.contractId!);
    if (!contract) throw notFound();

    return {
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: contract.status,
      providerId: contract.providerId ?? offer.providerId,
      customerId: contract.customerId ?? offer.customerId,
      actionId: contract.actionId,
      createdAt: contract.createdAt,
      created: false,
    };
  }

  private validationError(detail: string): AppError {
    return new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "contract",
        detail,
      })
    );
  }
}

export function createMatchContractConversionService(
  deps: MatchContractConversionServiceDependencies
): MatchContractConversionService {
  return new MatchContractConversionService(deps);
}

export function createConversionModule(
  db: DbPool,
  deps?: {
    requestRepository?: RequestRepository;
    conversionRepository?: MatchContractConversionRepository;
    eventInbox?: EventInboxService;
  }
) {
  const contractsExperience = createContractsExperienceModule(db);
  const matching = createMatchingService();

  const matchContractConversion = createMatchContractConversionService({
    db,
    requestRepository: deps?.requestRepository ?? requestRepository,
    conversionRepository: deps?.conversionRepository ?? matchContractConversionRepository,
    contractInitiation: contractsExperience.contractInitiation,
    contractBridge: contractsExperience.contractBridge,
    matching,
    eventInbox: deps?.eventInbox,
  });

  return {
    matchContractConversion,
  };
}

export type ConversionModule = ReturnType<typeof createConversionModule>;
