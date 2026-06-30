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

  async loadNeedScreen(screenId: string, query?: { generated_at?: string }): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>(`/need-experience/screen/${screenId}`, {
      generated_at: query?.generated_at,
    });
  }

  async relay(payload: RelayPayload): Promise<RuntimeExperienceEnvelope | ScreenRelayResponse> {
    if (payload.actionId) {
      const relay = resolveActionRelay({
        actionId: payload.actionId,
        screenId: payload.screenId,
        route: payload.route ?? "",
        payload: payload.body,
      });
      const path = relay.target.path;
      if (relay.target.method === "GET") {
        return this.http.get(path, {
          generated_at: payload.body?.generated_at as string | undefined,
        });
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

  async advanceTransition(progress: number, generatedAt?: string): Promise<NeedExperienceEnvelope> {
    return this.http.post<NeedExperienceEnvelope>("/need-experience/transition/advance", {
      progress,
      generated_at: generatedAt,
    });
  }
}

export function createRuntimeClient(config: RuntimeClientConfig): RuntimeClient {
  return new RuntimeClient(config);
}
