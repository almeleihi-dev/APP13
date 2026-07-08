import {
  findPlatformSource,
  validatePlatformHomeRequest,
  validatePlatformOverviewRequest,
} from "./platform-payload.js";
import { buildPlatformHomeView } from "../pages/platform-home.js";
import { buildPlatformOverviewView } from "../pages/platform-overview.js";
import {
  createPlatformApiTransport,
  createPlatformTransportClientError,
  createSyntheticGetResult,
  fetchPlatformHome,
  fetchPlatformOverview,
  unwrapPlatformExperienceSource,
  type PlatformExperienceApiResult,
} from "../shared/platform-api-transport.js";
import type {
  PlatformClientOptions,
  PlatformExperienceSource,
  PlatformHomeRequest,
  PlatformHomeResult,
  PlatformOverviewRequest,
  PlatformOverviewResult,
} from "./types.js";

export type { PlatformExperienceApiResult };

export class PlatformClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "PlatformClientError";
    this.status = status;
    this.code = code;
  }
}

export class PlatformClient {
  private readonly authToken?: string;
  private readonly apiEnabled: boolean;
  private readonly homeExecutor?: PlatformClientOptions["homeExecutor"];
  private readonly overviewExecutor?: PlatformClientOptions["overviewExecutor"];
  private readonly transport;

  constructor(options: PlatformClientOptions = {}) {
    this.authToken = options.authToken;
    this.apiEnabled = Boolean(options.baseUrl?.trim());
    this.homeExecutor = options.homeExecutor;
    this.overviewExecutor = options.overviewExecutor;
    this.transport = createPlatformApiTransport({
      baseUrl: options.baseUrl ?? "http://localhost:3000",
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async getPlatformHome(input: PlatformHomeRequest = {}): Promise<PlatformHomeResult> {
    const validation = validatePlatformHomeRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getPlatformHomeWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createPlatformTransportClientError(
        PlatformClientError,
        api,
        "Platform home not found"
      );
    }

    return this.projectHome(api.response.data);
  }

  async getPlatformOverview(input: PlatformOverviewRequest = {}): Promise<PlatformOverviewResult> {
    const validation = validatePlatformOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getPlatformOverviewWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createPlatformTransportClientError(
        PlatformClientError,
        api,
        "Platform overview not found"
      );
    }

    return this.projectOverview(api.response.data);
  }

  async getPlatformHomeWithApiResult(
    input: PlatformHomeRequest = {}
  ): Promise<PlatformExperienceApiResult> {
    const validation = validatePlatformHomeRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveHomeApiResult(input);
  }

  async getPlatformOverviewWithApiResult(
    input: PlatformOverviewRequest = {}
  ): Promise<PlatformExperienceApiResult> {
    const validation = validatePlatformOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveOverviewApiResult(input);
  }

  projectHome(source: PlatformExperienceSource): PlatformHomeResult {
    return {
      source,
      view: buildPlatformHomeView(source),
    };
  }

  projectOverview(source: PlatformExperienceSource): PlatformOverviewResult {
    return {
      source,
      view: buildPlatformOverviewView(source),
    };
  }

  private async resolveHomeApiResult(input: PlatformHomeRequest): Promise<PlatformExperienceApiResult> {
    const platformId = input.platform_id?.trim();
    const path = "/platform/home";

    if (this.homeExecutor) {
      const source = await this.homeExecutor({ platform_id: platformId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchPlatformHome(this.transport, {
        platformId,
        authToken: this.authToken,
      });
    }

    return createSyntheticGetResult(path, findPlatformSource(platformId));
  }

  private async resolveOverviewApiResult(
    input: PlatformOverviewRequest
  ): Promise<PlatformExperienceApiResult> {
    const platformId = input.platform_id?.trim();
    const path = "/platform/overview";

    if (this.overviewExecutor) {
      const source = await this.overviewExecutor({ platform_id: platformId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchPlatformOverview(this.transport, {
        platformId,
        authToken: this.authToken,
      });
    }

    return createSyntheticGetResult(path, findPlatformSource(platformId));
  }
}

export function createPlatformClient(options: PlatformClientOptions = {}): PlatformClient {
  return new PlatformClient(options);
}

export { unwrapPlatformExperienceSource };
