import {
  findPlatformSource,
  validatePlatformHomeRequest,
  validatePlatformOverviewRequest,
} from "./platform-payload.js";
import { buildPlatformHomeView } from "../pages/platform-home.js";
import { buildPlatformOverviewView } from "../pages/platform-overview.js";
import type {
  PlatformClientOptions,
  PlatformExperienceSource,
  PlatformHomeRequest,
  PlatformHomeResult,
  PlatformOverviewRequest,
  PlatformOverviewResult,
} from "./types.js";

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
  private readonly homeExecutor?: PlatformClientOptions["homeExecutor"];
  private readonly overviewExecutor?: PlatformClientOptions["overviewExecutor"];

  constructor(options: PlatformClientOptions = {}) {
    this.homeExecutor = options.homeExecutor;
    this.overviewExecutor = options.overviewExecutor;
  }

  async getPlatformHome(input: PlatformHomeRequest = {}): Promise<PlatformHomeResult> {
    const validation = validatePlatformHomeRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = await this.resolveSource(input, "home");
    return {
      source,
      view: buildPlatformHomeView(source),
    };
  }

  async getPlatformOverview(input: PlatformOverviewRequest = {}): Promise<PlatformOverviewResult> {
    const validation = validatePlatformOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = this.overviewExecutor
      ? await this.overviewExecutor({ platform_id: input.platform_id?.trim() })
      : await this.resolveSource(input, "overview");

    return {
      source,
      view: buildPlatformOverviewView(source),
    };
  }

  private async resolveSource(
    input: PlatformHomeRequest,
    mode: "home" | "overview"
  ): Promise<PlatformExperienceSource> {
    if (mode === "home" && this.homeExecutor) {
      return this.homeExecutor({ platform_id: input.platform_id?.trim() });
    }

    if (mode === "overview" && this.overviewExecutor) {
      return this.overviewExecutor({ platform_id: input.platform_id?.trim() });
    }

    return findPlatformSource(input.platform_id?.trim());
  }
}

export function createPlatformClient(options: PlatformClientOptions = {}): PlatformClient {
  return new PlatformClient(options);
}
