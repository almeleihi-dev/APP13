export type ApiEnvironment = "local" | "test";

export interface ApiConfig {
  baseUrl: string;
  timeoutMs: number;
  retryCount: number;
  environment: ApiEnvironment;
}

export const LOCAL_API_CONFIG: ApiConfig = {
  baseUrl: "http://localhost:3000",
  timeoutMs: 30_000,
  retryCount: 0,
  environment: "local",
};

export const TEST_API_CONFIG: ApiConfig = {
  baseUrl: "http://127.0.0.1:0",
  timeoutMs: 5_000,
  retryCount: 0,
  environment: "test",
};

const CONFIG_BY_ENVIRONMENT: Record<ApiEnvironment, ApiConfig> = {
  local: LOCAL_API_CONFIG,
  test: TEST_API_CONFIG,
};

export function resolveApiConfig(environment: ApiEnvironment): ApiConfig {
  return { ...CONFIG_BY_ENVIRONMENT[environment] };
}

export function createApiConfig(
  environment: ApiEnvironment,
  overrides: Partial<Omit<ApiConfig, "environment">> = {}
): ApiConfig {
  return {
    ...resolveApiConfig(environment),
    ...overrides,
    environment,
  };
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}
