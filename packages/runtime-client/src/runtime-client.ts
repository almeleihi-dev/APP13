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

export interface ActionScreenResponse {
  screen: AnActRuntimeScreenView;
}

export interface ActionReturnResponse {
  transition: Record<string, unknown>;
  screen: AnActRuntimeScreenView;
  next_mode: string;
}

export interface ActionTransitionAdvanceResponse {
  transition: Record<string, unknown>;
  screen: AnActRuntimeScreenView;
  complete?: boolean;
  mode?: string;
}

/** Action type from the backend catalog (GET /v1/action-types). */
export interface ActionTypeOption {
  actionCode: string;
  actionName: string;
  domain: string;
  templateId?: string;
}

/** Body accepted by POST /v1/actions (the only structured fields persisted). */
export interface CreateActionInput {
  action_type_code: string;
  title: string;
  description?: string;
}

/**
 * A persisted contract as returned by the backend contract engine
 * (GET /v1/contracts/:id and POST /v1/actions/:id/contract/generate).
 * Snake_case — mirrors toContractResponse() on the server. Read-only here.
 */
export interface ContractView {
  id: string;
  action_id: string;
  contract_number: string;
  status: string;
  template_id: string | null;
  document_hash: string | null;
  customer_id: string | null;
  provider_id: string | null;
  activated_at: string | null;
  complaint_window_ends_at: string | null;
  tekrr_snapshot: Record<string, unknown> | null;
}

/** A persisted contract party (GET /v1/contracts/:id/parties). */
export interface ContractPartyView {
  party_role: string;
  accepted_at: string | null;
  declined_at: string | null;
}

export class RuntimeClient {
  readonly auth: AuthClient;
  private readonly http: HttpClient;

  constructor(config: RuntimeClientConfig) {
    this.auth = new AuthClient({
      baseUrl: config.baseUrl,
      fetch: config.fetch,
      storage: config.authStorage,
    });
    this.http = new HttpClient({
      ...config,
      getAccessToken: () => config.getAccessToken?.() ?? this.auth.getAccessToken(),
      onRefresh: async () => {
        try {
          await this.auth.refresh();
          return true;
        } catch {
          return false;
        }
      },
      onRefreshFailure: () => {
        this.auth.logout();
        config.onRefreshFailure?.();
      },
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

  async loadActionHome(generatedAt?: string): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/action-experience/home", { generated_at: generatedAt });
  }

  async loadContractPreview(generatedAt?: string): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/action-experience/contract", {
      generated_at: generatedAt,
    });
  }

  async loadActiveAction(generatedAt?: string): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/action-experience/active", { generated_at: generatedAt });
  }

  async loadProgress(generatedAt?: string): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/action-experience/progress", { generated_at: generatedAt });
  }

  async loadCompletion(generatedAt?: string): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/action-experience/completion", { generated_at: generatedAt });
  }

  async continueContract(generatedAt?: string): Promise<ActionScreenResponse> {
    return this.http.post<ActionScreenResponse>("/action-experience/contract/continue", { generated_at: generatedAt });
  }

  async completeAction(generatedAt?: string): Promise<ActionScreenResponse> {
    return this.http.post<ActionScreenResponse>("/action-experience/complete", { generated_at: generatedAt });
  }

  async startReturnTransition(generatedAt?: string): Promise<ActionReturnResponse> {
    return this.http.post<ActionReturnResponse>("/action-experience/return", { generated_at: generatedAt });
  }

  async advanceActionTransition(progress: number, generatedAt?: string): Promise<ActionTransitionAdvanceResponse> {
    return this.http.post<ActionTransitionAdvanceResponse>("/action-experience/transition/advance", {
      progress,
      generated_at: generatedAt,
    });
  }

  async relay(payload: RelayPayload): Promise<
    | RuntimeExperienceEnvelope
    | ScreenRelayResponse
    | NeedSearchResponse
    | NeedContinueResponse
    | NeedTransitionResponse
    | ActionScreenResponse
    | ActionReturnResponse
    | ActionTransitionAdvanceResponse
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

  // --- Phase 8: MVP Evolution transport (no business logic) ---

  async getMe(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/v1/me");
  }

  async updateProvider(
    providerId: string,
    body: { display_name?: string; bio?: string; business_name?: string }
  ): Promise<Record<string, unknown>> {
    return this.http.patch<Record<string, unknown>>(`/v1/providers/${providerId}`, body);
  }

  // --- Wave 0 / Production Candidate: real action creation transport ---

  /** GET /v1/action-types — the fixed backend action-type catalog. */
  async listActionTypes(): Promise<ActionTypeOption[]> {
    return this.http.get<ActionTypeOption[]>("/v1/action-types");
  }

  /** POST /v1/actions — persist a real action (type + title + description only). */
  async createAction(input: CreateActionInput): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/v1/actions", { ...input });
  }

  /** POST /v1/auth/verify-email/request — 202, no body. Used for the email gate. */
  async requestEmailVerification(): Promise<void> {
    await this.http.post<void>("/v1/auth/verify-email/request", {});
  }

  // --- Production Candidate Phase 3: real contract transport (read-mostly) ---

  /**
   * POST /v1/actions/:actionId/contract/generate — generate (or return the
   * existing) persisted contract for an action. Idempotent server-side: returns
   * the same contract on repeat. Requires a provider assigned to the action
   * (server throws 422 otherwise). Returns the persisted contract record.
   */
  async generateContract(actionId: string): Promise<ContractView> {
    return this.http.post<ContractView>(`/v1/actions/${actionId}/contract/generate`, {});
  }

  /** GET /v1/contracts/:contractId — read a persisted contract. */
  async getContract(contractId: string): Promise<ContractView> {
    return this.http.get<ContractView>(`/v1/contracts/${contractId}`);
  }

  /** GET /v1/contracts/:contractId/parties — read persisted contract parties. */
  async getContractParties(contractId: string): Promise<ContractPartyView[]> {
    return this.http.get<ContractPartyView[]>(`/v1/contracts/${contractId}/parties`);
  }

  async getOnboardingOverview(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/living-onboarding");
  }

  async getOnboardingSteps(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/living-onboarding/steps");
  }

  async getOnboardingStep(stepId: string): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`/living-onboarding/steps/${stepId}`);
  }

  async submitOnboardingStep(stepId: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`/living-onboarding/steps/${stepId}`, body);
  }

  async completeOnboarding(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/living-onboarding/complete", {});
  }

  async getProfessionalPassport(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/professional-passport");
  }

  async getOnboardingPassport(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/living-onboarding/passport");
  }

  async getAiNeedSummary(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/ai-guidance-experience/summary");
  }

  async getAiActionCompanion(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/ai-execution-companion-experience/summary");
  }

  async getAiContractRecommendation(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/contract-intelligence/recommendation");
  }

  async getExecutiveDashboard(): Promise<{ screen: AnActRuntimeScreenView; dashboard: Record<string, unknown> }> {
    return this.http.get<{ screen: AnActRuntimeScreenView; dashboard: Record<string, unknown> }>(
      "/runtime-executive/dashboard"
    );
  }

  async loadNeedEmptyState(): Promise<AnActRuntimeScreenView> {
    return this.http.get<AnActRuntimeScreenView>("/need-experience/screen/empty-state");
  }

  // --- Phase 9: Strategic partner demo transport (no business logic) ---

  async getRuntimeDemo(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/runtime-demo");
  }

  async getDemoScenarios(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/runtime-demo/scenarios");
  }

  async startDemo(scenarioId?: string): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/runtime-demo/start", { scenario_id: scenarioId });
  }

  async nextDemoStep(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/runtime-demo/next", {});
  }

  async previousDemoStep(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/runtime-demo/previous", {});
  }

  async pauseDemo(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/runtime-demo/pause", {});
  }

  async resumeDemo(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/runtime-demo/resume", {});
  }

  async restartDemo(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/runtime-demo/restart", {});
  }

  async stopDemo(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>("/runtime-demo/stop", {});
  }

  async getKnowledgeBankSummary(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/knowledge-bank/summary");
  }

  async getExecutiveExperienceSummary(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/executive-experience/summary");
  }

  async getExecutiveExperienceInvestor(): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>("/executive-experience/investor");
  }

  async getRuntimeExecutiveInsights(): Promise<{ screen: AnActRuntimeScreenView; insights: Record<string, unknown> }> {
    return this.http.get<{ screen: AnActRuntimeScreenView; insights: Record<string, unknown> }>(
      "/runtime-executive/insights"
    );
  }

  async getRuntimeExecutiveSummary(): Promise<{ screen: AnActRuntimeScreenView; summary: Record<string, unknown> }> {
    return this.http.get<{ screen: AnActRuntimeScreenView; summary: Record<string, unknown> }>(
      "/runtime-executive/summary"
    );
  }
}

export function createRuntimeClient(config: RuntimeClientConfig): RuntimeClient {
  return new RuntimeClient(config);
}
