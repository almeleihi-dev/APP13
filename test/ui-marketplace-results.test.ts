import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  buildMarketplaceResultsView,
  createMarketplaceResultsPageModel,
  renderMarketplaceResultsPage,
  renderResponseCard,
} from "../src/ui/pages/marketplace-results.js";
import { MVP_DEMO_PROVIDERS, MVP_MARKETPLACE_SEARCH } from "../src/ui/marketplace/marketplace-payload.js";

describe("P3 marketplace results page", () => {
  const workflow = createWorkflowIntelligenceService().analyze({
    requirement_text: MVP_MARKETPLACE_SEARCH.request_text,
    customer_budget: MVP_MARKETPLACE_SEARCH.budget,
    customer_days: MVP_MARKETPLACE_SEARCH.preferred_days,
    profession: MVP_MARKETPLACE_SEARCH.category,
    providers: MVP_DEMO_PROVIDERS,
  });

  it("projects workflow response into marketplace cards only", () => {
    const view = buildMarketplaceResultsView(workflow, MVP_MARKETPLACE_SEARCH, MVP_DEMO_PROVIDERS);

    assert.equal(view.workflow_status, "ready");
    assert.equal(view.request_summary.id, "request-summary");
    assert.equal(view.top_provider.id, "top-provider");
    assert.equal(view.pricing.id, "pricing");
    assert.equal(view.negotiation.id, "negotiation");
    assert.equal(view.contract.id, "contract");
    assert.equal(view.marketplace_match.id, "marketplace-match");

    assert.equal(view.request_summary.fields[1]?.value, workflow.requirement.contract_readiness);
    assert.equal(view.top_provider.fields[2]?.value, "92");
    assert.equal(view.top_provider.fields[3]?.value, "emerald");
    assert.equal(view.pricing.fields[0]?.value, formatCurrency(workflow.pricing?.price_range.minimum));
    assert.equal(view.negotiation.summary, "negotiable");
    assert.equal(view.contract.fields[1]?.value, "milestone_based");
    assert.equal(view.marketplace_match.fields[0]?.value, "best_match");
  });

  it("includes provider cards for all ranked matches", () => {
    const view = buildMarketplaceResultsView(workflow, MVP_MARKETPLACE_SEARCH, MVP_DEMO_PROVIDERS);

    assert.equal(view.provider_cards.length, workflow.matching.ranked_matches.length);
    assert.equal(view.provider_cards[0]?.ranking_position, 1);
    assert.equal(view.provider_cards[0]?.trust_tier, "emerald");
    assert.equal(view.provider_cards[0]?.live_frame_color, "emerald");
    assert.ok(view.provider_cards[0]?.price_position.length >= 1);
  });

  it("handles no-provider workflow state without throwing", () => {
    const emptyWorkflow = createWorkflowIntelligenceService().analyze({
      requirement_text: MVP_MARKETPLACE_SEARCH.request_text,
      providers: [],
    });
    const view = buildMarketplaceResultsView(emptyWorkflow, MVP_MARKETPLACE_SEARCH, []);

    assert.equal(view.workflow_status, "no_provider_match");
    assert.equal(view.top_provider.summary, "No provider selected");
    assert.equal(view.provider_cards.length, 0);
    assert.equal(view.marketplace_match.fields[2]?.value, "—");
  });

  it("renders reusable response card markup", () => {
    const view = buildMarketplaceResultsView(workflow, MVP_MARKETPLACE_SEARCH, MVP_DEMO_PROVIDERS);
    const html = renderResponseCard(view.pricing);

    assert.match(html, /data-card="pricing"/);
    assert.match(html, /Minimum/);
    assert.match(html, /Premium/);
  });

  it("renders marketplace results page markup with all sections", () => {
    const model = createMarketplaceResultsPageModel(
      workflow,
      MVP_MARKETPLACE_SEARCH,
      MVP_DEMO_PROVIDERS
    );
    const html = renderMarketplaceResultsPage(model);

    assert.match(html, /data-page="marketplace-results"/);
    assert.match(html, /data-card="request-summary"/);
    assert.match(html, /data-card="top-provider"/);
    assert.match(html, /data-card="pricing"/);
    assert.match(html, /data-card="negotiation"/);
    assert.match(html, /data-card="contract"/);
    assert.match(html, /data-card="marketplace-match"/);
    assert.match(html, /data-section="provider-cards"/);
    assert.match(html, /data-provider-id="550e8400-e29b-41d4-a716-446655440001"/);
  });
});

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return `${value.toLocaleString("en-US")} SAR`;
}
