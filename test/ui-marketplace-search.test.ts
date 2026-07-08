import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  analyzeMarketplaceSearch,
  buildMarketplaceWorkflowPayload,
  createMarketplaceSearchPageModel,
  renderMarketplaceSearchPage,
  validateMarketplaceSearch,
} from "../src/ui/pages/marketplace-search.js";
import {
  MVP_DEMO_PROVIDERS,
  MVP_MARKETPLACE_SEARCH,
} from "../src/ui/marketplace/marketplace-payload.js";
import { MarketplaceClient, MarketplaceClientError } from "../src/ui/marketplace/marketplace-client.js";

describe("P3 marketplace search page", () => {
  it("defines the marketplace search form model", () => {
    const model = createMarketplaceSearchPageModel();

    assert.equal(model.page_id, "marketplace-search");
    assert.equal(model.submit_label, "Analyze & Find Providers");
    assert.ok(model.fields.some((field) => field.name === "request_text" && field.required));
    assert.ok(model.fields.some((field) => field.name === "category"));
  });

  it("renders the marketplace search page markup", () => {
    const html = renderMarketplaceSearchPage(createMarketplaceSearchPageModel());

    assert.match(html, /Analyze & Find Providers/);
    assert.match(html, /data-page="marketplace-search"/);
    assert.match(html, /name="request_text"/);
    assert.match(html, /name="category"/);
  });

  it("validates required request text", () => {
    const result = validateMarketplaceSearch({ request_text: "   " });

    assert.equal(result.valid, false);
    assert.equal(result.errors[0]?.field, "request_text");
  });

  it("validates optional numeric fields", () => {
    const result = validateMarketplaceSearch({
      request_text: "Need a website",
      budget: -1,
      preferred_days: 0,
    });

    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.field === "budget"));
    assert.ok(result.errors.some((error) => error.field === "preferred_days"));
  });

  it("builds workflow payload with category mapped to profession", () => {
    const payload = buildMarketplaceWorkflowPayload(MVP_MARKETPLACE_SEARCH);

    assert.equal(payload.requirement_text, MVP_MARKETPLACE_SEARCH.request_text);
    assert.equal(payload.customer_budget, 15000);
    assert.equal(payload.customer_days, 14);
    assert.equal(payload.profession, "software_developer");
    assert.ok(payload.providers.length >= 1);
  });

  it("executes marketplace analysis through the workflow integration layer", async () => {
    const workflowService = createWorkflowIntelligenceService();
    const result = await analyzeMarketplaceSearch(MVP_MARKETPLACE_SEARCH, {
      baseUrl: "http://localhost:3000",
      executor: (payload) => Promise.resolve(workflowService.analyze(payload)),
    });

    assert.equal(result.workflow.workflow_status, "ready");
    assert.equal(result.view.request_summary.fields[0]?.value, "software_developer");
    assert.equal(result.view.top_provider.fields[1]?.value, "software_developer");
    assert.equal(result.view.pricing.summary, "13,500 SAR");
    assert.equal(result.view.pricing.fields[1]?.value, "12,500 SAR");
    assert.equal(result.view.marketplace_match.fields[2]?.value, "1");
    assert.ok(result.view.provider_cards.length >= 1);
  });

  it("surfaces HTTP errors from the marketplace client", async () => {
    const client = new MarketplaceClient({
      baseUrl: "http://localhost:3000",
      fetchImpl: async () =>
        ({
          ok: false,
          status: 401,
          json: async () => ({ code: "UNAUTHORIZED", detail: "Authentication required" }),
        }) as Response,
    });

    await assert.rejects(
      () => client.analyzeAndFindProviders(MVP_MARKETPLACE_SEARCH),
      (error) => error instanceof MarketplaceClientError && error.status === 401
    );
  });
});
