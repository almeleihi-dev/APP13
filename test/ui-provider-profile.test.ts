import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProviderIntelligenceService } from "../src/provider/intelligence/index.js";
import {
  analyzeProviderProfile,
  createProviderProfilePageModel,
  renderProviderProfilePage,
  validateProviderProfile,
} from "../src/ui/pages/provider-profile.js";
import {
  MVP_DEMO_PROVIDER_PROFILE,
  buildProviderProfilePayload,
} from "../src/ui/provider/provider-payload.js";
import { ProviderClient, ProviderClientError } from "../src/ui/provider/provider-client.js";

describe("P2 provider profile page", () => {
  it("defines the provider profile form model", () => {
    const model = createProviderProfilePageModel();

    assert.equal(model.page_id, "provider-profile");
    assert.equal(model.submit_label, "Analyze Provider");
    assert.ok(model.fields.some((field) => field.name === "provider_id" && field.required));
    assert.ok(model.fields.some((field) => field.name === "location_tier"));
  });

  it("renders the provider profile page markup", () => {
    const html = renderProviderProfilePage(createProviderProfilePageModel());

    assert.match(html, /Analyze Provider/);
    assert.match(html, /data-page="provider-profile"/);
    assert.match(html, /name="provider_id"/);
    assert.match(html, /name="average_price"/);
  });

  it("validates required provider id and UUID format", () => {
    const missing = validateProviderProfile({ provider_id: "   " });
    assert.equal(missing.valid, false);
    assert.equal(missing.errors[0]?.field, "provider_id");

    const invalid = validateProviderProfile({ provider_id: "not-a-uuid" });
    assert.equal(invalid.valid, false);
    assert.match(invalid.errors[0]?.message ?? "", /valid UUID/);
  });

  it("validates numeric bounds for rates and rating", () => {
    const result = validateProviderProfile({
      provider_id: MVP_DEMO_PROVIDER_PROFILE.provider_id,
      rating: 6,
      completion_rate: 1.2,
      location_tier: "invalid" as "metro",
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.field === "rating"));
    assert.ok(result.errors.some((error) => error.field === "completion_rate"));
    assert.ok(result.errors.some((error) => error.field === "location_tier"));
  });

  it("builds provider payload without intelligence duplication", () => {
    const payload = buildProviderProfilePayload(MVP_DEMO_PROVIDER_PROFILE);

    assert.equal(payload.provider_id, MVP_DEMO_PROVIDER_PROFILE.provider_id);
    assert.equal(payload.profession, "software_developer");
    assert.deepEqual(payload.certifications, ["AWS Certified", "Scrum Master"]);
    assert.deepEqual(payload.licenses, ["Commercial Registration"]);
    assert.equal(payload.average_price, 12000);
    assert.equal(payload.location_tier, "metro");
  });

  it("executes provider analysis through the API integration layer", async () => {
    const providerService = createProviderIntelligenceService();
    const result = await analyzeProviderProfile(MVP_DEMO_PROVIDER_PROFILE, {
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(providerService.profile(payload)),
    });

    assert.equal(result.profile.capability_profile.level, "senior");
    assert.equal(result.profile.risk_profile, "low");
    assert.equal(result.view.identity.fields[0]?.value, "software_developer");
    assert.equal(result.view.capability.summary, "senior");
    assert.equal(result.view.pricing.summary, "12,000 SAR");
    assert.equal(result.view.availability.fields[0]?.value, "Yes");
  });

  it("surfaces HTTP errors from the provider client", async () => {
    const client = new ProviderClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        ({
          ok: false,
          status: 401,
          json: async () => ({ code: "UNAUTHORIZED", detail: "Authentication required" }),
        }) as Response,
    });

    await assert.rejects(
      () => client.analyzeProvider(MVP_DEMO_PROVIDER_PROFILE),
      (error) => error instanceof ProviderClientError && error.status === 401
    );
  });
});
