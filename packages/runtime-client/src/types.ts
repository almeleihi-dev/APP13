import type { AnActRuntimeScreenView } from "@an-act/runtime-core";

export interface AuthTokens {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
}

export interface RuntimeClientConfig {
  baseUrl: string;
  fetch?: typeof fetch;
  getAccessToken?: () => string | null;
  /** Returns true when tokens were refreshed and the caller may retry. */
  onRefresh?: () => Promise<boolean>;
  /** Called when refresh fails — clear session and redirect to login. */
  onRefreshFailure?: () => void;
  authStorage?: import("./auth-client.js").AuthStorage;
}

export interface RuntimeProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
}

export class RuntimeClientError extends Error {
  constructor(
    message: string,
    readonly problem?: RuntimeProblemDetails,
    readonly status?: number
  ) {
    super(message);
    this.name = "RuntimeClientError";
  }
}

export interface NeedExperienceEnvelope {
  version: string;
  current_screen: string;
  mode: "need" | "action" | "transition";
  screen: AnActRuntimeScreenView;
  navigation: Record<string, unknown>;
  search?: Record<string, unknown>;
  request_draft?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  flow?: unknown[];
  generated_at: string;
  runtime_experience: true;
}

export interface ActionExperienceEnvelope {
  version: string;
  current_screen: string;
  mode: "need" | "action" | "transition";
  screen: AnActRuntimeScreenView;
  navigation: Record<string, unknown>;
  generated_at: string;
  runtime_experience: true;
  transition?: Record<string, unknown>;
}

export type RuntimeExperienceEnvelope = NeedExperienceEnvelope | ActionExperienceEnvelope;

export interface RelayPayload {
  actionId?: string;
  route?: string;
  screenId: string;
  body?: Record<string, unknown>;
}

export interface ScreenRelayResponse {
  screen: AnActRuntimeScreenView;
}
