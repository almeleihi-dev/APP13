import type { Queryable } from "../../../shared/db/index.js";
import type { ConversionStatus } from "../../../conversion/domain/match-contract-conversion.js";
import { discoveryRepository } from "../../../discovery/infrastructure/discovery-repository.js";
import {
  RequestRepository,
  requestRepository,
} from "../../../request-experience/infrastructure/request-repository.js";
import type {
  RequestMatchOfferRecord,
  RequestMatchProviderRecord,
  RequestMatchSnapshot,
} from "../domain/request-match-experience.js";
import { suggestMatchingActions, resolvePrimaryActionCode } from "../../../request-experience/domain/request.js";

export interface RequestMatchBaseSnapshot {
  request: RequestMatchSnapshot["request"];
  providers: RequestMatchProviderRecord[];
  offers: RequestMatchOfferRecord[];
  marketplaceProviderCount: number;
}

export class RequestMatchExperienceRepository {
  constructor(private readonly requests: RequestRepository = requestRepository) {}

  async loadBaseSnapshot(
    client: Queryable,
    requestId: string
  ): Promise<RequestMatchBaseSnapshot | null> {
    const request = await this.requests.findById(client, requestId);
    if (!request) return null;

    const suggestions = suggestMatchingActions(request.requestText);
    const primary = resolvePrimaryActionCode(suggestions);
    const [providers, offers, platformCounts] = await Promise.all([
      this.requests.listMatchableProviders(client),
      this.listOffersForRequest(client, requestId),
      discoveryRepository.listPublishedActionCounts(client),
    ]);

    const marketplaceProviderCount = primary
      ? (platformCounts.find((entry) => entry.actionCode === primary.actionCode)?.providerCount ??
        0)
      : 0;

    const enrichedProviders = await Promise.all(
      providers.map(async (provider) => ({
        providerId: provider.providerId,
        providerUserId: provider.providerUserId,
        displayName: provider.displayName,
        actionCodes: provider.actionCodes,
        trustScore: provider.trustScore,
        availableNow: provider.availableNow,
        distanceKm: provider.distanceKm,
        priceEstimate: provider.priceEstimate,
        completedContractsForAction: provider.completedContractsForAction,
        completedContracts: provider.completedContracts,
        averageRating: provider.averageRating,
        publishedActionId: primary
          ? await this.findPublishedActionId(client, provider.providerId, primary.actionCode)
          : null,
      }))
    );

    return {
      request,
      providers: enrichedProviders,
      offers,
      marketplaceProviderCount,
    };
  }

  private async findPublishedActionId(
    client: Queryable,
    providerId: string,
    actionCode: string
  ): Promise<string | null> {
    const result = await client.query<{ id: string }>(
      `
        SELECT id
        FROM action.actions
        WHERE provider_id = $1
          AND action_code = $2
          AND status NOT IN ('draft', 'cancelled')
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1
      `,
      [providerId, actionCode]
    );

    return result.rows[0]?.id ?? null;
  }

  private async listOffersForRequest(
    client: Queryable,
    requestId: string
  ): Promise<RequestMatchOfferRecord[]> {
    const result = await client.query<{
      id: string;
      provider_id: string;
      provider_user_id: string;
      selected_action_id: string;
      selected_action_code: string;
      status: ConversionStatus;
      contract_id: string | null;
    }>(
      `
        SELECT
          id,
          provider_id,
          provider_user_id,
          selected_action_id,
          selected_action_code,
          status,
          contract_id
        FROM experience.match_contract_offers
        WHERE customer_request_id = $1
        ORDER BY updated_at DESC, created_at DESC
      `,
      [requestId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      providerId: row.provider_id,
      providerUserId: row.provider_user_id,
      selectedActionId: row.selected_action_id,
      selectedActionCode: row.selected_action_code,
      status: row.status,
      contractId: row.contract_id,
    }));
  }
}

export const requestMatchExperienceRepository = new RequestMatchExperienceRepository();
