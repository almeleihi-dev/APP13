import { resolveActionRelay, resolveRouteRelay } from "@an-act/runtime-core";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { AuthClient } from "./auth-client.js";
import { HttpClient } from "./http-client.js";
import type {
  ActionExperienceEnvelope,
  NeedExperienceEnvelope,
  RelayPayload,
  RuntimeClientConfig,
  RuntimeExperienceEnvelope,
  ScreenRelayResponse,
} from "./types.js";

export interface NeedSearchResponse {
  search: Record<string, unknown>;
  screen: AnActRuntimeScreenView;
  opportunity_count: number;
}

export interface NeedContinueResponse {
  transition: Record<string, unknown>;
  screen: AnActRuntimeScreenView;
  next_mode: string;
}

export interface NeedTransitionResponse {
  transition: Record<string, unknown>;
  screen: AnActRuntimeScreenView;
  complete?: boolean;
  mode?: string;
}

export class RuntimeClient {
  readonly auth: AuthClient;
  private readonly http: HttpClient;

  constructor(config: RuntimeClientConfig) {
    this.auth = new AuthClient({
      baseUrl: config.baseUrl,
      fetch: config.fetch,
    });
    this.http = new HttpClient({
      ...config,
      getAccessToken: () => config.getAccessToken?.() ?? this.auth.getAccessToken(),
    });
  }

  async loadNeedExperience(query?: { generated_at?: string; reduced_motion?: boolean }): Promise<NeedExperienceEnvelope> {
    return this.http.get<NeedExperienceEnvelope>("/need-experience", {
      generated_at: query?.generated_at,
      reduced_motion: query?.reduced_motion ? "true" : undefined,
    });
  }

  async loadActionExperience(query?: { generated_at?: string }): Promise<ActionExperienceEnvelope> {
    return this.http.get<ActionExperienceEnvelope>("/action-experience", {
      generated_at: query?.generated_at,
    });
  }

  async loadNeedScreen(screenId: string, query?: Record<string, string | undefined>): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>(`/need-experience/screen/${screenId}`, query);
  }

  async performSearch(body: { keyword?: string; category?: string; generated_at?: string }): Promise<NeedSearchResponse> {
    return this.http.post<NeedSearchResponse>("/need-experience/search", body);
  }

  async selectOpportunity(opportunityId: string, generatedAt?: string): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/need-experience/request", {
      opportunity_id: opportunityId,
      generated_at: generatedAt,
    });
  }

  async continueRequest(body: {
    location?: string;
    schedule?: string;
    notes?: string;
    generated_at?: string;
  }): Promise<NeedContinueResponse> {
    return this.http.post<NeedContinueResponse>("/need-experience/request/continue", body);
  }

  async enterActionExperience(body?: {
    generated_at?: string;
    need_handoff?: Record<string, unknown>;
  }): Promise<ActionExperienceEnvelope> {
    return this.http.post<ActionExperienceEnvelope>("/action-experience/enter", body);
  }

  async loadContractPreview(generatedAt?: string): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/action-experience/contract", {
      generated_at: generatedAt,
    });
  }

  async relay(payload: RelayPayload): Promise<
    RuntimeExperienceEnvelope | ScreenRelayResponse | NeedSearchResponse | NeedContinueResponse | NeedTransitionResponse
  > {
    if (payload.actionId) {
      const relay = resolveActionRelay({
        actionId: payload.actionId,
        screenId: payload.screenId,
        route: payload.route ?? "",
        payload: payload.body,
      });
      const path = relay.target.path;
      const query = payload.body as Record<string, string | undefined> | undefined;
      if (relay.target.method === "GET") {
        return this.http.get(path, query);
      }
      return this.http.post(path, payload.body);
    }

    if (payload.route) {
      const target = resolveRouteRelay(payload.route);
      const path = target.path;
      if (target.method === "GET") {
        const screen = await this.http.get<AnActRuntimeScreenView>(path, payload.body as Record<string, string>);
        return { screen };
      }
      return this.http.post(path, payload.body);
    }

    throw new Error("Relay payload requires actionId or route");
  }

  async advanceTransition(progress: number, generatedAt?: string): Promise<NeedTransitionResponse> {
    return this.http.post<NeedTransitionResponse>("/need-experience/transition/advance", {
      progress,
      generated_at: generatedAt,
    });
  }
}

export function createRuntimeClient(config: RuntimeClientConfig): RuntimeClient {
  return new RuntimeClient(config);
}
