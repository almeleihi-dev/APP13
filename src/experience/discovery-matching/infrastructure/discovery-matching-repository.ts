import type { Queryable } from "../../../shared/db/index.js";
import { discoveryRepository } from "../../../discovery/infrastructure/discovery-repository.js";
import {
  RequestRepository,
  requestRepository,
} from "../../../request-experience/infrastructure/request-repository.js";
import {
  deriveRequirementFromQuery,
  deriveRequirementFromRequest,
  type DiscoveryMatchProviderRecord,
  type DiscoveryMatchQuery,
  type DiscoveryMatchRequestRecord,
  type DiscoveryMatchingSnapshot,
} from "../domain/discovery-matching.js";
import {
  resolvePrimaryActionCode,
  suggestMatchingActions,
} from "../../../request-experience/domain/request.js";

export class DiscoveryMatchingRepository {
  constructor(
    private readonly requests: RequestRepository = requestRepository
  ) {}

  async loadSnapshot(
    client: Queryable,
    query: DiscoveryMatchQuery = {}
  ): Promise<DiscoveryMatchingSnapshot> {
    const [providers, requests] = await Promise.all([
      this.listProviders(client),
      this.listRequests(client),
    ]);

    const suggestions = query.text ? suggestMatchingActions(query.text) : [];
    const primary = resolvePrimaryActionCode(suggestions);
    const requirement = deriveRequirementFromQuery({ query, suggestions });

    return {
      query,
      providers,
      requests,
      requirement,
      suggestions,
      primaryActionCode: primary?.actionCode ?? null,
      primaryActionName: primary?.actionName ?? null,
    };
  }

  async loadRequestSnapshot(
    client: Queryable,
    requestId: string
  ): Promise<{
    request: DiscoveryMatchRequestRecord;
    providers: DiscoveryMatchProviderRecord[];
    requirement: DiscoveryMatchingSnapshot["requirement"];
  } | null> {
    const request = await this.requests.findById(client, requestId);
    if (!request) return null;

    const suggestions = suggestMatchingActions(request.requestText);
    const providers = await this.listProviders(client);
    const requirement = deriveRequirementFromRequest({
      request: {
        requestId: request.id,
        customerUserId: request.customerUserId,
        requestText: request.requestText,
        status: request.status,
        budget: request.budget,
        preferredDays: request.preferredDays,
      },
      suggestions,
    });

    return {
      request: {
        requestId: request.id,
        customerUserId: request.customerUserId,
        requestText: request.requestText,
        status: request.status,
        budget: request.budget,
        preferredDays: request.preferredDays,
      },
      providers,
      requirement,
    };
  }

  async loadProviderSnapshot(
    client: Queryable,
    providerUserId: string
  ): Promise<{
    provider: DiscoveryMatchProviderRecord;
    requests: DiscoveryMatchRequestRecord[];
  } | null> {
    const providers = await this.listProviders(client);
    const provider = providers.find((entry) => entry.providerUserId === providerUserId);
    if (!provider) return null;

    const requests = await this.listRequests(client);
    return { provider, requests };
  }

  private async listProviders(client: Queryable): Promise<DiscoveryMatchProviderRecord[]> {
    const rows = await discoveryRepository.listDiscoverableProviders(client);
    return rows.map((row) => ({
      providerId: row.providerId,
      providerUserId: row.providerUserId,
      displayName: row.displayName,
      actionCodes: row.actionCodes,
      trustScore: row.trustScore,
      availableNow: row.availableNow,
      activeContracts: row.activeContracts,
      distanceKm: row.distanceKm,
      priceEstimate: row.priceEstimate,
      completedContracts: row.completedContracts,
      averageRating: row.averageRating,
    }));
  }

  private async listRequests(client: Queryable): Promise<DiscoveryMatchRequestRecord[]> {
    const result = await client.query<{
      id: string;
      customer_user_id: string;
      request_text: string;
      status: string;
      budget_minor: number | null;
      preferred_days: number | null;
    }>(
      `
        SELECT
          id,
          customer_user_id,
          request_text,
          status,
          budget_minor,
          preferred_days
        FROM experience.customer_requests
        WHERE status IN ('open', 'matched')
        ORDER BY created_at DESC
      `
    );

    return result.rows.map((row) => ({
      requestId: row.id,
      customerUserId: row.customer_user_id,
      requestText: row.request_text,
      status: row.status,
      budget: row.budget_minor,
      preferredDays: row.preferred_days,
    }));
  }
}

export const discoveryMatchingRepository = new DiscoveryMatchingRepository();
