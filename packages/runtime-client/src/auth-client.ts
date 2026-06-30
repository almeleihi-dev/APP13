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

export class AuthClient {
  private readonly fetchImpl: typeof fetch;
  private readonly storage: AuthStorage;

  constructor(private readonly config: AuthClientConfig) {
    this.fetchImpl = config.fetch ?? fetch;
    this.storage = config.storage ?? new MemoryAuthStorage();
  }

  getAccessToken(): string | null {
    return this.storage.getTokens()?.access_token ?? null;
  }

  getStoredTokens(): AuthTokens | null {
    return this.storage.getTokens();
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.fetchImpl(`${this.config.baseUrl}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    const tokens = (await response.json()) as AuthTokens;
    this.storage.setTokens(tokens);
    return tokens;
  }

  logout(): void {
    this.storage.clear();
  }
}
