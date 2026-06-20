import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createWorkflowIntelligenceService } from "../src/orchestrator/intelligence/index.js";
import {
  buildProviderCardView,
  buildProviderCardViews,
  renderProviderCard,
  renderProviderCards,
} from "../src/ui/pages/provider-card.js";
import { MVP_DEMO_PROVIDERS, MVP_MARKETPLACE_SEARCH } from "../src/ui/marketplace/marketplace-payload.js";

describe("P3 provider card component", () => {
  const workflow = createWorkflowIntelligenceService().analyze({
    requirement_text: MVP_MARKETPLACE_SEARCH.request_text,
    customer_budget: MVP_MARKETPLACE_SEARCH.budget,
    customer_days: MVP_MARKETPLACE_SEARCH.preferred_days,
    profession: MVP_MARKETPLACE_SEARCH.category,
    providers: MVP_DEMO_PROVIDERS,
  });

  it("builds provider card views from workflow and candidate data", () => {
    const cards = buildProviderCardViews(workflow, MVP_DEMO_PROVIDERS);

    assert.equal(cards.length, 2);
    assert.equal(cards[0]?.provider_id, "550e8400-e29b-41d4-a716-446655440001");
    assert.equal(cards[0]?.display_name, "frontend / backend");
    assert.equal(cards[0]?.trust_tier, "emerald");
    assert.equal(cards[0]?.live_frame_color, "emerald");
    assert.equal(cards[1]?.trust_tier, "—");
    assert.equal(cards[1]?.live_frame_color, "—");
  });

  it("builds a single provider card with ranking position", () => {
    const card = buildProviderCardView(
      workflow,
      "550e8400-e29b-41d4-a716-446655440002",
      2,
      MVP_DEMO_PROVIDERS
    );

    assert.equal(card.ranking_position, 2);
    assert.equal(card.provider_id, "550e8400-e29b-41d4-a716-446655440002");
    assert.equal(card.display_name, "cleaning / sanitization");
    assert.ok(["budget", "market", "premium", "—"].includes(card.price_position));
  });

  it("renders a provider card with required fields", () => {
    const card = buildProviderCardViews(workflow, MVP_DEMO_PROVIDERS)[0];
    assert.ok(card);
    const html = renderProviderCard(card);

    assert.match(html, /class="provider-card"/);
    assert.match(html, /Trust Score/);
    assert.match(html, /Trust Tier/);
    assert.match(html, /Live Frame/);
    assert.match(html, /Availability/);
    assert.match(html, /Price Position/);
    assert.match(html, /data-rank="1"/);
  });

  it("renders multiple provider cards and handles empty matches", () => {
    const cards = buildProviderCardViews(workflow, MVP_DEMO_PROVIDERS);
    const html = renderProviderCards(cards);

    assert.match(html, /data-section="provider-cards"/);
    assert.match(html, /550e8400-e29b-41d4-a716-446655440001/);
    assert.match(html, /550e8400-e29b-41d4-a716-446655440002/);

    const emptyHtml = renderProviderCards([]);
    assert.match(emptyHtml, /No providers matched/);
  });
});
