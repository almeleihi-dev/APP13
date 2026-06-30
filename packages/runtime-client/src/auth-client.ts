import { RuntimeClientError, type RuntimeProblemDetails } from "./types.js";
import type { AuthTokens } from "./types.js";

export interface AuthStorage {
  getTokens(): AuthTokens | null;
  setTokens(tokens: AuthTokens): void;
  clear(): void;
}

export class MemoryAuthStorage implements AuthStorage {
  private tokens: AuthTokens | null = null;

  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
  }

  clear(): void {
    this.tokens = null;
  }
}

export class LocalStorageAuthStorage implements AuthStorage {
  constructor(private readonly key = "an-act-auth-tokens") {}

  getTokens(): AuthTokens | null {
    if (typeof localStorage === "undefined") {
      return null;
    }
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthTokens;
  }

  setTokens(tokens: AuthTokens): void {
    if (typeof localStorage === "undefined") {
      return;
    }
    localStorage.setItem(this.key, JSON.stringify(tokens));
  }

  clear(): void {
    if (typeof localStorage === "undefined") {
      return;
    }
    localStorage.removeItem(this.key);
  }
}

export interface AuthClientConfig {
  baseUrl: string;
  fetch?: typeof fetch;
  storage?: AuthStorage;
}

export interface RegisterCustomerInput {
  email: string;
  password: string;
  display_name: string;
}

export interface RegisterProviderInput {
  email: string;
  password: string;
  display_name: string;
  business_name: string;
  primary_trade: string;
}

export class AuthClient {
  private readonly fetchImpl: typeof fetch;
  private readonly storage: AuthStorage;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(private readonly config: AuthClientConfig) {
    this.fetchImpl = config.fetch ?? fetch;
    this.storage = config.storage ?? new MemoryAuthStorage();
  }

  getAccessToken(): string | null {
    return this.storage.getTokens()?.access_token ?? null;
  }

  getRefreshToken(): string | null {
    return this.storage.getTokens()?.refresh_token ?? null;
  }

  getStoredTokens(): AuthTokens | null {
    return this.storage.getTokens();
  }

  hasSession(): boolean {
    return Boolean(this.storage.getTokens()?.access_token);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    return this.requestTokens("/v1/auth/login", { email, password });
  }

  async registerCustomer(input: RegisterCustomerInput): Promise<AuthTokens> {
    return this.requestTokens("/v1/auth/register/customer", { ...input }, 201);
  }

  async registerProvider(input: RegisterProviderInput): Promise<AuthTokens> {
    return this.requestTokens("/v1/auth/register/provider", { ...input }, 201);
  }

  async refresh(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new RuntimeClientError("Session expired", { title: "Unauthorized", detail: "No refresh token" }, 401);
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.requestTokens("/v1/auth/token/refresh", { refresh_token: refreshToken })
      .catch((err) => {
        this.logout();
        throw err;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  async logoutServer(): Promise<void> {
    const token = this.getAccessToken();
    if (!token) {
      this.logout();
      return;
    }
    try {
      await this.fetchImpl(`${this.config.baseUrl}/v1/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Local session clear proceeds regardless of server reachability.
    } finally {
      this.logout();
    }
  }

  logout(): void {
    this.storage.clear();
  }

  private async requestTokens(
    path: string,
    body: Record<string, unknown>,
    successStatus = 200
  ): Promise<AuthTokens> {
    const response = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let problem: RuntimeProblemDetails | undefined;
      try {
        problem = (await response.json()) as RuntimeProblemDetails;
      } catch {
        problem = undefined;
      }
      throw new RuntimeClientError(
        problem?.detail ?? problem?.title ?? `HTTP ${response.status}`,
        problem,
        response.status
      );
    }

    if (response.status !== successStatus && response.status !== 200) {
      throw new RuntimeClientError(`Unexpected status ${response.status}`, undefined, response.status);
    }

    const tokens = (await response.json()) as AuthTokens;
    this.storage.setTokens(tokens);
    return tokens;
  }
}
