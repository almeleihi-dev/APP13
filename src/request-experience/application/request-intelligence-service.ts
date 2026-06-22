import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import { createMatchingService } from "../../matching/application/matching-service.js";
import type { MatchingService } from "../../matching/application/matching-service.js";
import type { TrustScoreService } from "../../trust/application/trust-score-service.js";
import { createTrustModule } from "../../trust/module.js";
import {
  buildMatchExplanation,
  buildMatchingSummary,
  buildRequestSummary,
  classifyProviderLiveFrame,
  resolvePrimaryActionCode,
  suggestMatchingActions,
  toCustomerRequestView,
  toMatchingSummaryView,
  toRequestSuggestionView,
  toRequestSummaryView,
  type CustomerRequest,
  type CustomerRequestView,
  type MatchingSummaryView,
  type RequestSuggestionView,
  type RequestSummaryView,
} from "../domain/request.js";
import {
  RequestRepository,
  requestRepository,
  type MatchableProviderRecord,
} from "../infrastructure/request-repository.js";

export interface CreateCustomerRequestInput {
  request_text: string;
  budget?: number;
  preferred_days?: number;
}

export interface RequestIntelligenceServiceDependencies {
  db: DbPool;
  matching: MatchingService;
  trustScore: TrustScoreService;
  repository?: RequestRepository;
}

export class RequestIntelligenceService {
  private readonly repository: RequestRepository;

  constructor(private readonly deps: RequestIntelligenceServiceDependencies) {
    this.repository = deps.repository ?? requestRepository;
  }

  async createCustomerRequest(
    userId: string,
    input: CreateCustomerRequestInput
  ): Promise<CustomerRequestView> {
    this.assertValidRequestText(input.request_text);

    const customer = await this.repository.findCustomerByUserId(this.deps.db.pool, userId);
    if (!customer) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.FORBIDDEN,
          engine: "matching",
          detail: "Customer profile required to create a request",
        })
      );
    }

    const request = await this.repository.createRequest(this.deps.db.pool, {
      customerUserId: userId,
      customerId: customer.id,
      requestText: input.request_text,
      budget: input.budget ?? null,
      preferredDays: input.preferred_days ?? null,
    });

    const summary = this.buildSummaryForRequest(request);
    return toCustomerRequestView(request, summary);
  }

  async getCustomerRequest(userId: string, requestId: string): Promise<CustomerRequestView> {
    const request = await this.requireOwnedRequest(userId, requestId);
    const summary = this.buildSummaryForRequest(request);
    return toCustomerRequestView(request, summary);
  }

  async getRequestSummary(userId: string, requestId: string): Promise<RequestSummaryView> {
    const request = await this.requireOwnedRequest(userId, requestId);
    return toRequestSummaryView(this.buildSummaryForRequest(request));
  }

  async getRequestSuggestions(userId: string, requestId: string): Promise<RequestSuggestionView[]> {
    const request = await this.requireOwnedRequest(userId, requestId);
    return suggestMatchingActions(request.requestText).map(toRequestSuggestionView);
  }

  async getRequestMatches(userId: string, requestId: string): Promise<MatchingSummaryView> {
    const request = await this.requireOwnedRequest(userId, requestId);
    const suggestions = suggestMatchingActions(request.requestText);
    const primary = resolvePrimaryActionCode(suggestions);

    if (!primary) {
      return toMatchingSummaryView(
        buildMatchingSummary({
          request,
          primaryActionCode: "unknown",
          actionName: "Unknown action",
          matches: [],
          totalCandidates: 0,
        })
      );
    }

    const providers = await this.repository.listMatchableProviders(this.deps.db.pool);
    const eligible = providers.filter((provider) =>
      provider.actionCodes.includes(primary.actionCode)
    );

    const enriched = await Promise.all(
      eligible.map(async (provider) => this.enrichProviderTrust(provider))
    );

    const ranked = this.deps.matching.getBestMatches(
      {
        actionId: primary.actionCode,
        budget: request.budget ?? undefined,
      },
      enriched.map((provider) => ({
        providerId: provider.providerId,
        trustScore: provider.trustScore,
        availableNow: provider.availableNow,
        distanceKm: provider.distanceKm,
        priceEstimate: provider.priceEstimate,
        completedContractsForAction: provider.completedContractsForAction,
      })),
      5
    );

    const matches = ranked.map((score) => {
      const provider = enriched.find((entry) => entry.providerId === score.providerId)!;
      const frame = classifyProviderLiveFrame(provider.trustScore);
      return {
        providerId: provider.providerId,
        providerUserId: provider.providerUserId,
        displayName: provider.displayName,
        matchScore: score.totalScore,
        trustScore: provider.trustScore,
        liveFrameLabel: frame.label,
        liveFrameTier: frame.tier,
        availableNow: provider.availableNow,
        completedContracts: provider.completedContracts,
        averageRating: provider.averageRating,
        explanation: buildMatchExplanation(
          provider.displayName,
          score.totalScore,
          provider.trustScore,
          frame.label
        ),
      };
    });

    return toMatchingSummaryView(
      buildMatchingSummary({
        request,
        primaryActionCode: primary.actionCode,
        actionName: primary.actionName,
        totalCandidates: eligible.length,
        matches,
      })
    );
  }

  private buildSummaryForRequest(request: CustomerRequest) {
    const suggestions = suggestMatchingActions(request.requestText);
    return buildRequestSummary(request, suggestions);
  }

  private async enrichProviderTrust(
    provider: MatchableProviderRecord
  ): Promise<MatchableProviderRecord> {
    const profile = await this.deps.trustScore.buildTrustProfile(
      provider.providerId,
      provider.providerUserId
    );

    if (!profile) return provider;

    return {
      ...provider,
      trustScore: profile.trustScore,
      completedContracts: profile.completedContracts,
      averageRating: profile.averageRating,
      completedContractsForAction: Math.max(
        provider.completedContractsForAction,
        profile.completedContracts
      ),
    };
  }

  private async requireOwnedRequest(userId: string, requestId: string): Promise<CustomerRequest> {
    const request = await this.repository.findById(this.deps.db.pool, requestId);
    if (!request || request.customerUserId !== userId) {
      throw notFound();
    }
    return request;
  }

  private assertValidRequestText(requestText: string): void {
    if (!requestText || requestText.trim().length < 10) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "matching",
          detail: "request_text must be at least 10 characters",
        })
      );
    }
  }
}

export function createRequestIntelligenceService(
  deps: RequestIntelligenceServiceDependencies
): RequestIntelligenceService {
  return new RequestIntelligenceService(deps);
}

export function createRequestExperienceModule(
  db: DbPool,
  deps?: {
    trustScore?: TrustScoreService;
  }
) {
  const trustScore = deps?.trustScore ?? createTrustModule(db).trustScore;
  const matching = createMatchingService();
  const requestIntelligence = createRequestIntelligenceService({
    db,
    matching,
    trustScore,
  });

  return {
    requestIntelligence,
  };
}

export type RequestExperienceModule = ReturnType<typeof createRequestExperienceModule>;
