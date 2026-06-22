import type { Queryable } from "../../shared/db/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";
import type {
  ContractOffer,
  ContractDraftPreview,
  ConversionStatus,
  ProposedCommercialTerms,
} from "../domain/match-contract-conversion.js";
import { normalizeContractDraftPreview } from "../domain/match-contract-conversion.js";

interface OfferRow {
  id: string;
  customer_request_id: string;
  customer_user_id: string;
  customer_id: string;
  provider_id: string;
  provider_user_id: string;
  selected_action_id: string;
  selected_action_code: string;
  commercial_terms: ProposedCommercialTerms;
  draft_preview: ContractDraftPreview | null;
  status: ConversionStatus;
  contract_id: string | null;
  idempotency_key: string;
  created_at: Date;
  updated_at: Date;
}

export interface PublishedProviderAction {
  id: string;
  actionCode: string;
  actionName: string;
  providerId: string;
}

function mapOffer(row: OfferRow): ContractOffer {
  return {
    id: row.id,
    customerRequestId: row.customer_request_id,
    customerUserId: row.customer_user_id,
    customerId: row.customer_id,
    providerId: row.provider_id,
    providerUserId: row.provider_user_id,
    selectedActionId: row.selected_action_id,
    selectedActionCode: row.selected_action_code,
    commercialTerms: row.commercial_terms ?? {},
    status: row.status,
    contractId: row.contract_id,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class MatchContractConversionRepository {
  constructor(private readonly identityRepo: IdentityRepository = identityRepository) {}

  async findProviderByUserId(client: Queryable, userId: string) {
    return this.identityRepo.findProviderByUserId(client, userId);
  }

  async findPublishedActionForProvider(
    client: Queryable,
    actionId: string,
    providerId: string
  ): Promise<PublishedProviderAction | null> {
    const result = await client.query<{
      id: string;
      action_code: string;
      action_name: string;
      provider_id: string;
    }>(
      `
        SELECT id, action_code, action_name, provider_id
        FROM action.actions
        WHERE id = $1
          AND provider_id = $2
          AND status NOT IN ('draft', 'cancelled')
      `,
      [actionId, providerId]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      actionCode: row.action_code,
      actionName: row.action_name,
      providerId: row.provider_id,
    };
  }

  async findOfferById(client: Queryable, offerId: string): Promise<ContractOffer | null> {
    const result = await client.query<OfferRow>(
      `
        SELECT *
        FROM experience.match_contract_offers
        WHERE id = $1
      `,
      [offerId]
    );

    return result.rows[0] ? mapOffer(result.rows[0]) : null;
  }

  async findOfferByIdForUpdate(client: Queryable, offerId: string): Promise<ContractOffer | null> {
    const result = await client.query<OfferRow>(
      `
        SELECT *
        FROM experience.match_contract_offers
        WHERE id = $1
        FOR UPDATE
      `,
      [offerId]
    );

    return result.rows[0] ? mapOffer(result.rows[0]) : null;
  }

  async findOfferByIdempotencyKey(
    client: Queryable,
    idempotencyKey: string
  ): Promise<ContractOffer | null> {
    const result = await client.query<OfferRow>(
      `
        SELECT *
        FROM experience.match_contract_offers
        WHERE idempotency_key = $1
      `,
      [idempotencyKey]
    );

    return result.rows[0] ? mapOffer(result.rows[0]) : null;
  }

  async getDraftPreview(client: Queryable, offerId: string): Promise<ContractDraftPreview | null> {
    const result = await client.query<{ draft_preview: ContractDraftPreview | null }>(
      `
        SELECT draft_preview
        FROM experience.match_contract_offers
        WHERE id = $1
      `,
      [offerId]
    );

    return result.rows[0]?.draft_preview
      ? normalizeContractDraftPreview(
          result.rows[0].draft_preview as ContractDraftPreview & { generatedAt: Date | string }
        )
      : null;
  }

  async createOffer(
    client: Queryable,
    input: {
      customerRequestId: string;
      customerUserId: string;
      customerId: string;
      providerId: string;
      providerUserId: string;
      selectedActionId: string;
      selectedActionCode: string;
      commercialTerms: ProposedCommercialTerms;
      draftPreview: ContractDraftPreview;
      idempotencyKey: string;
    }
  ): Promise<{ offer: ContractOffer; created: boolean }> {
    const insert = await client.query<OfferRow>(
      `
        INSERT INTO experience.match_contract_offers (
          customer_request_id,
          customer_user_id,
          customer_id,
          provider_id,
          provider_user_id,
          selected_action_id,
          selected_action_code,
          commercial_terms,
          draft_preview,
          status,
          idempotency_key
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, 'offer_created', $10)
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING *
      `,
      [
        input.customerRequestId,
        input.customerUserId,
        input.customerId,
        input.providerId,
        input.providerUserId,
        input.selectedActionId,
        input.selectedActionCode,
        JSON.stringify(input.commercialTerms),
        JSON.stringify(input.draftPreview),
        input.idempotencyKey,
      ]
    );

    if (insert.rows[0]) {
      return { offer: mapOffer(insert.rows[0]), created: true };
    }

    const existing = await this.findOfferByIdempotencyKey(client, input.idempotencyKey);
    if (!existing) {
      throw new Error(`offer idempotency key missing after conflict: ${input.idempotencyKey}`);
    }

    return { offer: existing, created: false };
  }

  async updateStatus(
    client: Queryable,
    offerId: string,
    status: ConversionStatus,
    contractId?: string | null
  ): Promise<ContractOffer> {
    const result = await client.query<OfferRow>(
      `
        UPDATE experience.match_contract_offers
        SET
          status = $2,
          contract_id = COALESCE($3, contract_id),
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [offerId, status, contractId ?? null]
    );

    return mapOffer(result.rows[0]);
  }

  async saveDraftPreview(
    client: Queryable,
    offerId: string,
    draftPreview: ContractDraftPreview,
    status: ConversionStatus = "draft_previewed"
  ): Promise<ContractOffer> {
    const result = await client.query<OfferRow>(
      `
        UPDATE experience.match_contract_offers
        SET
          draft_preview = $2::jsonb,
          status = $3,
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
      [offerId, JSON.stringify(draftPreview), status]
    );

    return mapOffer(result.rows[0]);
  }
}

export const matchContractConversionRepository = new MatchContractConversionRepository();
