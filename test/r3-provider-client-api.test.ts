import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderIntelligenceService } from "../src/provider/intelligence/index.js";
import {
  MVP_DEMO_PROVIDER_PROFILE,
  buildProviderProfilePayload,
} from "../src/ui/provider/provider-payload.js";
import { ProviderClient, ProviderClientError } from "../src/ui/provider/provider-client.js";

function mockResponse(status: number, body: unknown, ok = status >= 200 && status < 300): Response {
  return {
    ok,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("R3 provider client API integration", () => {
  it("calls POST /ai/providers/profile through R1 and returns typed success result", async () => {
    const providerService = createProviderIntelligenceService();
    const payload = buildProviderProfilePayload(MVP_DEMO_PROVIDER_PROFILE);
    const expected = providerService.profile(payload);
    let requestedUrl = "";
    let method = "";

    const client = new ProviderClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async (url, init) => {
        requestedUrl = String(url);
        method = init?.method ?? "";
        return mockResponse(200, expected);
      },
    });

    const apiResult = await client.analyzeProviderWithApiResult(MVP_DEMO_PROVIDER_PROFILE);

    assert.equal(apiResult.response.success, true);
    assert.equal(apiResult.response.data?.capability_profile.level, "senior");
    assert.equal(apiResult.meta.method, "POST");
    assert.equal(apiResult.meta.path, "/ai/providers/profile");
    assert.match(requestedUrl, /\/ai\/providers\/profile$/);
    assert.equal(method, "POST");
  });

  it("maps validation failures through ApiResult without throwing", async () => {
    const client = new ProviderClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          422,
          {
            code: "VALIDATION_ERROR",
            message: "provider_id must be a valid UUID",
          },
          false
        ),
    });

    const result = await client.postProviderProfileWithApiResult(
      buildProviderProfilePayload(MVP_DEMO_PROVIDER_PROFILE)
    );

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "VALIDATION_ERROR");
    assert.equal(result.meta.status, 422);
  });

  it("maps unauthorized errors to ProviderClientError", async () => {
    const client = new ProviderClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        mockResponse(
          401,
          { code: "UNAUTHORIZED", detail: "Authentication required" },
          false
        ),
    });

    await assert.rejects(
      () => client.analyzeProvider(MVP_DEMO_PROVIDER_PROFILE),
      (error) =>
        error instanceof ProviderClientError &&
        error.status === 401 &&
        error.code === "UNAUTHORIZED"
    );
  });

  it("maps timeout errors through the R1 integration layer", async () => {
    const client = new ProviderClient({
      baseUrl: "http://localhost:3000",
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    });

    const result = await client.postProviderProfileWithApiResult(
      buildProviderProfilePayload(MVP_DEMO_PROVIDER_PROFILE)
    );

    assert.equal(result.response.success, false);
    assert.equal(result.response.error?.code, "TIMEOUT");
    assert.equal(result.meta.status, 408);
  });

  it("still supports executor mode for tests and demos", async () => {
    const providerService = createProviderIntelligenceService();
    const client = new ProviderClient({
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(providerService.profile(payload)),
    });

    const profile = await client.analyzeProvider(MVP_DEMO_PROVIDER_PROFILE);
    assert.equal(profile.capability_profile.level, "senior");
    assert.equal(profile.risk_profile, "low");
  });

  it("returns typed ApiResult in executor mode", async () => {
    const providerService = createProviderIntelligenceService();
    const client = new ProviderClient({
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(providerService.profile(payload)),
    });

    const result = await client.analyzeProviderWithApiResult(MVP_DEMO_PROVIDER_PROFILE);
    assert.equal(result.response.success, true);
    assert.equal(result.response.data?.identity_profile.profession, "software_developer");
  });
});

describe("R3 provider client fixture compatibility", () => {
  it("preserves demo fixture behavior through executor path", async () => {
    const providerService = createProviderIntelligenceService();
    const profile = await providerService.profile(buildProviderProfilePayload(MVP_DEMO_PROVIDER_PROFILE));

    assert.equal(profile.pricing_profile.pricing_position, "market");
    assert.equal(profile.availability_profile.available_now, true);
  });
});
