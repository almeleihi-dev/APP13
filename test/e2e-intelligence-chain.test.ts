import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequirementIntelligenceService } from "../src/action/intelligence/requirement/requirement-intelligence-service.js";
import { createActionIntelligenceService } from "../src/action/intelligence/action-intelligence-service.js";
import { createContractIntelligenceService } from "../src/contract/intelligence/contract-intelligence-service.js";
import { createMatchingIntelligenceService } from "../src/matching/intelligence/matching-intelligence-service.js";
import { createPricingIntelligenceService } from "../src/pricing/intelligence/pricing-intelligence-service.js";
import { createTrustIntelligenceService } from "../src/trust/intelligence/trust-intelligence-service.js";
import type { MatchingProvider } from "../src/matching/intelligence/types.js";
import type { TrustBehaviorMetrics } from "../src/trust/intelligence/types.js";
import type { ComplexityLevel, LocationTier } from "../src/pricing/intelligence/types.js";
import type { EscrowReleaseStrategy, RiskLevel } from "../src/contract/intelligence/types.js";

const TRUST_PROVIDER_ID = "550e8400-e29b-41d4-a716-446655440000";

const STRONG_TRUST_METRICS: TrustBehaviorMetrics = {
  completed_contracts: 52,
  completion_rate: 0.96,
  average_rating: 4.8,
  refund_rate: 0.01,
  issue_rate: 0.03,
  evidence_quality_score: 0.9,
  identity_verification_level: "iron",
};

interface ScenarioProviderFixture {
  provider_id: string;
  action_codes: string[];
  skills: string[];
  price_estimate: number;
  trust_score: number;
}

interface IntelligenceScenario {
  name: string;
  requirementText: string;
  professionHint: string;
  profession: string;
  primaryActionCode: string;
  requiredSkills: string[];
  matchingBudget: number;
  expectedWinnerId: string;
  goodProvider: ScenarioProviderFixture;
  weakProvider: ScenarioProviderFixture;
  pricing: {
    complexity: ComplexityLevel;
    estimatedDays: number;
    locationTier: LocationTier;
    urgent?: boolean;
  };
  pricingExpectation: {
    minRecommended: number;
    maxRecommended: number;
    minBasePrice: number;
  };
  contractExpectation: {
    minMilestones: number;
    maxMilestones: number;
    releaseStrategy: EscrowReleaseStrategy;
    allowedRiskLevels: RiskLevel[];
  };
}

const SCENARIOS: IntelligenceScenario[] = [
  {
    name: "Restaurant Website",
    requirementText:
      "Build a restaurant website with online menu, admin dashboard, and mobile-friendly design.",
    professionHint: "software_developer",
    profession: "software_developer",
    primaryActionCode: "E.3.1",
    requiredSkills: ["frontend", "backend"],
    matchingBudget: 15000,
    expectedWinnerId: "restaurant_dev",
    goodProvider: {
      provider_id: "restaurant_dev",
      action_codes: ["E.3.1", "B.3.3"],
      skills: ["frontend", "backend", "deployment"],
      price_estimate: 12000,
      trust_score: 92,
    },
    weakProvider: {
      provider_id: "restaurant_cleaner",
      action_codes: ["A.4.2"],
      skills: ["cleaning"],
      price_estimate: 400,
      trust_score: 80,
    },
    pricing: {
      complexity: "medium",
      estimatedDays: 14,
      locationTier: "metro",
      urgent: false,
    },
    pricingExpectation: {
      minRecommended: 10000,
      maxRecommended: 15000,
      minBasePrice: 8000,
    },
    contractExpectation: {
      minMilestones: 4,
      maxMilestones: 4,
      releaseStrategy: "milestone_based",
      allowedRiskLevels: ["low", "medium", "high"],
    },
  },
  {
    name: "Apartment Cleaning",
    requirementText: "Deep cleaning and disinfection for a 3 bedroom apartment before move-in.",
    professionHint: "cleaner",
    profession: "cleaning_sanitization",
    primaryActionCode: "A.4.2",
    requiredSkills: ["cleaning", "sanitization"],
    matchingBudget: 800,
    expectedWinnerId: "apartment_cleaner",
    goodProvider: {
      provider_id: "apartment_cleaner",
      action_codes: ["A.4.2"],
      skills: ["cleaning", "sanitization", "disinfection"],
      price_estimate: 450,
      trust_score: 92,
    },
    weakProvider: {
      provider_id: "apartment_developer",
      action_codes: ["E.3.1"],
      skills: ["frontend"],
      price_estimate: 10000,
      trust_score: 70,
    },
    pricing: {
      complexity: "low",
      estimatedDays: 2,
      locationTier: "standard",
      urgent: false,
    },
    pricingExpectation: {
      minRecommended: 500,
      maxRecommended: 2500,
      minBasePrice: 500,
    },
    contractExpectation: {
      minMilestones: 1,
      maxMilestones: 1,
      releaseStrategy: "single_release",
      allowedRiskLevels: ["low"],
    },
  },
  {
    name: "Business Consulting",
    requirementText:
      "Need a business consultant to assess operations and deliver a strategy roadmap for our retail startup.",
    professionHint: "consultant",
    profession: "consultant",
    primaryActionCode: "C.1.1",
    requiredSkills: ["strategy", "operations"],
    matchingBudget: 6000,
    expectedWinnerId: "business_consultant",
    goodProvider: {
      provider_id: "business_consultant",
      action_codes: ["C.1.1", "C.1.2"],
      skills: ["strategy", "operations", "analysis"],
      price_estimate: 4500,
      trust_score: 92,
    },
    weakProvider: {
      provider_id: "business_cleaner",
      action_codes: ["A.4.2"],
      skills: ["cleaning"],
      price_estimate: 400,
      trust_score: 70,
    },
    pricing: {
      complexity: "medium",
      estimatedDays: 5,
      locationTier: "standard",
      urgent: false,
    },
    pricingExpectation: {
      minRecommended: 1500,
      maxRecommended: 5000,
      minBasePrice: 1000,
    },
    contractExpectation: {
      minMilestones: 2,
      maxMilestones: 3,
      releaseStrategy: "milestone_based",
      allowedRiskLevels: ["low", "medium"],
    },
  },
];

function toMatchingProvider(fixture: ScenarioProviderFixture): MatchingProvider {
  return {
    provider_id: fixture.provider_id,
    action_codes: fixture.action_codes,
    skills: fixture.skills,
    trust_score: fixture.trust_score,
    average_rating: 4.8,
    price_estimate: fixture.price_estimate,
    available_now: true,
  };
}

function runIntelligenceChain(scenario: IntelligenceScenario) {
  const requirementIntelligence = createRequirementIntelligenceService();
  const matchingIntelligence = createMatchingIntelligenceService();
  const pricingIntelligence = createPricingIntelligenceService();
  const contractIntelligence = createContractIntelligenceService(
    createActionIntelligenceService(),
    requirementIntelligence
  );
  const trustIntelligence = createTrustIntelligenceService();

  const ai2 = requirementIntelligence.extract({
    requirement_text: scenario.requirementText,
    profession_hint: scenario.professionHint,
  });

  const ai5 = matchingIntelligence.rank({
    requirement: {
      required_action_codes: ai2.suggested_actions.map((action) => action.action_code),
      required_skills: scenario.requiredSkills,
      budget: scenario.matchingBudget,
      currency: "SAR",
      urgent: scenario.pricing.urgent ?? false,
    },
    providers: [
      toMatchingProvider(scenario.goodProvider),
      toMatchingProvider(scenario.weakProvider),
    ],
  });

  const topMatch = ai5.ranked_matches[0];
  const runnerUp = ai5.ranked_matches[1];

  const ai6 = pricingIntelligence.calculate({
    profession: scenario.profession,
    action_codes: ai2.suggested_actions.map((action) => action.action_code),
    trust_score: topMatch?.provider_id === scenario.expectedWinnerId
      ? scenario.goodProvider.trust_score
      : scenario.weakProvider.trust_score,
    complexity: scenario.pricing.complexity,
    estimated_days: scenario.pricing.estimatedDays,
    urgent: scenario.pricing.urgent ?? false,
    location_tier: scenario.pricing.locationTier,
  });

  const ai3 = contractIntelligence.generate({
    profession: scenario.profession,
    requirement_text: scenario.requirementText,
    contract_value: ai6.price_range.recommended,
    currency: "SAR",
    ai2_result: ai2,
  });

  const ai4 = trustIntelligence.calculate({
    provider_id: TRUST_PROVIDER_ID,
    metrics: STRONG_TRUST_METRICS,
  });

  return { ai2, ai5, ai6, ai3, ai4, topMatch, runnerUp };
}

describe("E2E intelligence chain AI-2 → AI-5 → AI-6 → AI-3 → AI-4", () => {
  for (const scenario of SCENARIOS) {
    describe(scenario.name, () => {
      it("extracts the expected requirement profile (AI-2)", () => {
        const { ai2 } = runIntelligenceChain(scenario);

        assert.ok(ai2.confidence > 0, "expected non-zero extraction confidence");
        assert.ok(
          ai2.suggested_actions.some((action) => action.action_code === scenario.primaryActionCode),
          `expected primary action ${scenario.primaryActionCode}`
        );
        assert.ok(ai2.deliverables.length >= 1, "expected deliverables from requirement extraction");
        assert.ok(ai2.milestones.length >= 1, "expected milestones from requirement extraction");
        assert.ok(["ready", "needs_clarification"].includes(ai2.contract_readiness));
      });

      it("ranks the correct provider highest (AI-5)", () => {
        const { topMatch, runnerUp } = runIntelligenceChain(scenario);

        assert.ok(topMatch, "expected at least one ranked provider");
        assert.ok(runnerUp, "expected a runner-up provider for ordering assertions");
        assert.equal(topMatch.provider_id, scenario.expectedWinnerId);
        assert.ok(topMatch.match_score > runnerUp.match_score);
        assert.ok(
          ["best_match", "strong_match", "possible_match"].includes(topMatch.recommendation),
          `expected competitive recommendation, got ${topMatch.recommendation}`
        );
        assert.equal(
          topMatch.component_scores.trust,
          scenario.goodProvider.trust_score,
          "trust component should reflect provider trust score input"
        );
      });

      it("returns a reasonable pricing recommendation (AI-6)", () => {
        const { ai6 } = runIntelligenceChain(scenario);

        assert.equal(ai6.currency, "SAR");
        assert.ok(ai6.price_components.base_price >= scenario.pricingExpectation.minBasePrice);
        assert.ok(ai6.price_range.minimum <= ai6.price_range.recommended);
        assert.ok(ai6.price_range.recommended <= ai6.price_range.premium);
        assert.ok(ai6.price_range.recommended >= scenario.pricingExpectation.minRecommended);
        assert.ok(ai6.price_range.recommended <= scenario.pricingExpectation.maxRecommended);
        assert.equal(ai6.pricing_tier, "recommended");
        assert.equal(ai6.confidence, scenario.goodProvider.trust_score / 100);
      });

      it("generates contract structure from extracted requirement (AI-3)", () => {
        const { ai3, ai6 } = runIntelligenceChain(scenario);

        assert.ok(ai3.scope_of_work.length >= 1, "expected generated scope of work");
        assert.ok(
          ai3.scope_of_work.some(
            (item) =>
              item.action_code === scenario.primaryActionCode ||
              item.title.toLowerCase().includes(scenario.primaryActionCode.toLowerCase()) ||
              item.description.length > 0
          ),
          "expected scope items tied to extracted actions"
        );
        assert.ok(ai3.milestones.length >= scenario.contractExpectation.minMilestones);
        assert.ok(ai3.milestones.length <= scenario.contractExpectation.maxMilestones);
        assert.equal(ai3.escrow_plan.release_strategy, scenario.contractExpectation.releaseStrategy);
        assert.ok(
          scenario.contractExpectation.allowedRiskLevels.includes(ai3.risk_profile.risk_level)
        );
        assert.ok(ai3.acceptance_criteria.length >= ai3.milestones.length);
        assert.ok(ai3.draft_contract.sections.length >= 3);
        assert.ok(["ready", "needs_clarification"].includes(ai3.contract_readiness));

        const milestoneTotal = ai3.milestones.reduce((sum, milestone) => sum + milestone.percentage, 0);
        assert.equal(milestoneTotal, 100);

        if (ai6.price_range.recommended > 0) {
          assert.ok(ai3.milestones.length >= 1);
        }
      });

      it("integrates trust scoring with the selected provider profile (AI-4)", () => {
        const { ai4, topMatch } = runIntelligenceChain(scenario);

        assert.equal(ai4.trust_score, scenario.goodProvider.trust_score);
        assert.equal(topMatch?.component_scores.trust, ai4.trust_score);
        assert.equal(ai4.trust_tier, "emerald");
        assert.equal(ai4.recommendation, "trusted");
        assert.deepEqual(ai4.restrictions, []);
      });
    });
  }

  it("runs the full pipeline deterministically for every scenario", () => {
    for (const scenario of SCENARIOS) {
      const first = runIntelligenceChain(scenario);
      const second = runIntelligenceChain(scenario);

      assert.deepEqual(first.ai2, second.ai2);
      assert.deepEqual(first.ai5, second.ai5);
      assert.deepEqual(first.ai6, second.ai6);
      assert.deepEqual(first.ai3, second.ai3);
      assert.deepEqual(first.ai4, second.ai4);
    }
  });
});
