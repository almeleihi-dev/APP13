import {
  resolveFixtureByEscrowId,
  validateEscrowHistoryRequest,
  validateEscrowOverviewRequest,
} from "./escrow-payload.js";
import { buildEscrowHistoryView } from "../pages/escrow-history.js";
import { buildEscrowOverviewView } from "../pages/escrow-overview.js";
import type {
  EscrowClientOptions,
  EscrowExperienceSource,
  EscrowHistoryRequest,
  EscrowHistoryResult,
  EscrowOverviewRequest,
  EscrowOverviewResult,
} from "./types.js";

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
  private readonly overviewExecutor?: EscrowClientOptions["overviewExecutor"];
  private readonly historyExecutor?: EscrowClientOptions["historyExecutor"];

  constructor(options: EscrowClientOptions = {}) {
    this.overviewExecutor = options.overviewExecutor;
    this.historyExecutor = options.historyExecutor;
  }

  async getEscrowOverview(input: EscrowOverviewRequest): Promise<EscrowOverviewResult> {
    const validation = validateEscrowOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = await this.resolveSource(input, "overview");
    return {
      source,
      view: buildEscrowOverviewView(source),
    };
  }

  async getEscrowHistory(input: EscrowHistoryRequest): Promise<EscrowHistoryResult> {
    const validation = validateEscrowHistoryRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = await this.resolveSource(input, "history");
    return {
      source,
      view: buildEscrowHistoryView(source),
    };
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

  private async resolveSource(
    input: EscrowOverviewRequest,
    mode: "overview" | "history"
  ): Promise<EscrowExperienceSource> {
    if (mode === "history" && this.historyExecutor) {
      return this.historyExecutor({ escrow_id: input.escrow_id.trim() });
    }

    if (mode === "overview" && this.overviewExecutor) {
      return this.overviewExecutor({
        escrow_id: input.escrow_id.trim(),
        contract_id: input.contract_id?.trim(),
      });
    }

    const fixture = resolveFixtureByEscrowId(input.escrow_id.trim());
    if (fixture) {
      return fixture;
    }

    throw new EscrowClientError(404, `Escrow ${input.escrow_id} not found`);
  }
}

export function createEscrowClient(options: EscrowClientOptions = {}): EscrowClient {
  return new EscrowClient(options);
}
