import {
  resolveFixtureByEscrowId,
  validateEscrowHistoryRequest,
  validateEscrowOverviewRequest,
} from "./escrow-payload.js";
import { buildEscrowHistoryView } from "../pages/escrow-history.js";
import { buildEscrowOverviewView } from "../pages/escrow-overview.js";
import {
  createEscrowApiTransport,
  createEscrowTransportClientError,
  createSyntheticGetResult,
  fetchEscrowHistory,
  fetchEscrowOverview,
  unwrapEscrowExperienceSource,
  type EscrowExperienceApiResult,
} from "../shared/escrow-api-transport.js";
import type {
  EscrowClientOptions,
  EscrowExperienceSource,
  EscrowHistoryRequest,
  EscrowHistoryResult,
  EscrowOverviewRequest,
  EscrowOverviewResult,
} from "./types.js";

export type { EscrowExperienceApiResult };

export class EscrowClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "EscrowClientError";
    this.status = status;
    this.code = code;
  }
}

export class EscrowClient {
  private readonly authToken?: string;
  private readonly apiEnabled: boolean;
  private readonly overviewExecutor?: EscrowClientOptions["overviewExecutor"];
  private readonly historyExecutor?: EscrowClientOptions["historyExecutor"];
  private readonly transport;

  constructor(options: EscrowClientOptions = {}) {
    this.authToken = options.authToken;
    this.apiEnabled = Boolean(options.baseUrl?.trim());
    this.overviewExecutor = options.overviewExecutor;
    this.historyExecutor = options.historyExecutor;
    this.transport = createEscrowApiTransport({
      baseUrl: options.baseUrl ?? "http://localhost:3000",
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async getEscrowOverview(input: EscrowOverviewRequest): Promise<EscrowOverviewResult> {
    const validation = validateEscrowOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getEscrowOverviewWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createEscrowTransportClientError(EscrowClientError, api, `Escrow ${input.escrow_id} not found`);
    }

    return this.projectOverview(api.response.data);
  }

  async getEscrowHistory(input: EscrowHistoryRequest): Promise<EscrowHistoryResult> {
    const validation = validateEscrowHistoryRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getEscrowHistoryWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createEscrowTransportClientError(EscrowClientError, api, `Escrow ${input.escrow_id} not found`);
    }

    return this.projectHistory(api.response.data);
  }

  async getEscrowOverviewWithApiResult(input: EscrowOverviewRequest): Promise<EscrowExperienceApiResult> {
    const validation = validateEscrowOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveOverviewApiResult(input);
  }

  async getEscrowHistoryWithApiResult(input: EscrowHistoryRequest): Promise<EscrowExperienceApiResult> {
    const validation = validateEscrowHistoryRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveHistoryApiResult(input);
  }

  projectOverview(source: EscrowExperienceSource): EscrowOverviewResult {
    return {
      source,
      view: buildEscrowOverviewView(source),
    };
  }

  projectHistory(source: EscrowExperienceSource): EscrowHistoryResult {
    return {
      source,
      view: buildEscrowHistoryView(source),
    };
  }

  private async resolveOverviewApiResult(input: EscrowOverviewRequest): Promise<EscrowExperienceApiResult> {
    const escrowId = input.escrow_id.trim();
    const path = `/escrow/${escrowId}`;

    if (this.overviewExecutor) {
      const source = await this.overviewExecutor({
        escrow_id: escrowId,
        contract_id: input.contract_id?.trim(),
      });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchEscrowOverview(escrowId, this.transport, {
        contractId: input.contract_id?.trim(),
        authToken: this.authToken,
      });
    }

    const fixture = resolveFixtureByEscrowId(escrowId);
    if (fixture) {
      return createSyntheticGetResult(path, fixture);
    }

    return {
      response: {
        success: false,
        error: { code: "NOT_FOUND", message: `Escrow ${escrowId} not found` },
      },
      meta: { status: 404, method: "GET", path, durationMs: 0 },
    };
  }

  private async resolveHistoryApiResult(input: EscrowHistoryRequest): Promise<EscrowExperienceApiResult> {
    const escrowId = input.escrow_id.trim();
    const path = `/escrow/${escrowId}/history`;

    if (this.historyExecutor) {
      const source = await this.historyExecutor({ escrow_id: escrowId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchEscrowHistory(escrowId, this.transport, this.authToken);
    }

    const fixture = resolveFixtureByEscrowId(escrowId);
    if (fixture) {
      return createSyntheticGetResult(path, fixture);
    }

    return {
      response: {
        success: false,
        error: { code: "NOT_FOUND", message: `Escrow ${escrowId} not found` },
      },
      meta: { status: 404, method: "GET", path, durationMs: 0 },
    };
  }
}

export function createEscrowClient(options: EscrowClientOptions = {}): EscrowClient {
  return new EscrowClient(options);
}

export { unwrapEscrowExperienceSource };
