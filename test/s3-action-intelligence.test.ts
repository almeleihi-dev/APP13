import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ACTION_CATALOG,
  calculateActionConfidence,
  createActionIntelligenceService,
  getCatalogActionByCode,
  listCatalogActionsByCategory,
} from "../src/action-intelligence/module.js";

const FIXED_TIME = new Date("2026-06-19T15:00:00.000Z");

describe("S3.7 Action Intelligence", () => {
  const intelligence = createActionIntelligenceService();

  it("extracts contractable actions from provider profile text", () => {
    const actions = intelligence.extractActionsFromProviderProfile({
      providerId: "provider-1",
      sourceReference: "profile-1",
      profession: "Software Developer",
      skills: ["typescript", "deployment", "testing", "documentation"],
      certifications: ["AWS Certified Developer"],
      yearsExperience: 6,
      completedContracts: 4,
      previousActionCodes: ["technology.code"],
      profileText: "Builds web applications, writes tests, deploys releases, documents APIs",
    });

    assert.ok(actions.some((action) => action.actionCode === "technology.code"));
    assert.ok(actions.some((action) => action.actionCode === "technology.test"));
    assert.ok(actions.some((action) => action.actionCode === "technology.deploy"));
    assert.ok(actions.every((action) => action.confidence >= 0 && action.confidence <= 100));
  });

  it("decomposes a website task into ordered actions", () => {
    const decomposition = intelligence.decomposeTask("Build company website");

    assert.deepEqual(
      decomposition.actions.map((action) => action.actionCode),
      ["engineering.design", "technology.code", "technology.test", "technology.deploy"]
    );
    assert.deepEqual(
      decomposition.actions.map((action) => action.sequenceOrder),
      [1, 2, 3, 4]
    );
  });

  it("scores confidence from experience, contracts, certifications, and history", () => {
    const baseline = calculateActionConfidence({
      keywordMatchStrength: 0.8,
      yearsExperience: 1,
      completedContracts: 0,
      certifications: [],
      previousActionCodes: [],
      actionCode: "technology.code",
    });
    const enriched = calculateActionConfidence({
      keywordMatchStrength: 0.8,
      yearsExperience: 8,
      completedContracts: 5,
      certifications: ["PMP", "AWS"],
      previousActionCodes: ["technology.code"],
      actionCode: "technology.code",
    });

    assert.ok(enriched > baseline);
    assert.ok(enriched >= 95);
  });

  it("looks up catalog actions by category and code", () => {
    const legalActions = listCatalogActionsByCategory("legal");
    assert.equal(legalActions.length, 5);
    assert.equal(getCatalogActionByCode("finance.audit")?.actionName, "Finance — Audit");
    assert.equal(ACTION_CATALOG.length, 25);
  });

  it("builds deterministic action profiles and matching signals", () => {
    const extracted = intelligence.extractActionsFromExperience({
      providerId: "provider-2",
      sourceReference: "exp-1",
      roleTitle: "HR Manager",
      experienceText: "Recruit candidates, interview applicants, onboard new hires, train teams",
      yearsExperience: 5,
      completedContracts: 3,
    });

    const profile = intelligence.buildActionProfile({
      providerId: "provider-2",
      sourceType: "experience",
      sourceReference: "exp-1",
      actions: extracted,
      generatedAt: FIXED_TIME,
    });

    const duplicate = intelligence.buildActionProfile({
      providerId: "provider-2",
      sourceType: "experience",
      sourceReference: "exp-1",
      actions: extracted,
      generatedAt: FIXED_TIME,
    });

    assert.deepEqual(profile, duplicate);
    assert.ok(profile.actions.some((action) => action.actionCode === "hr.recruit"));

    const signals = intelligence.toMatchingSignals(profile);
    assert.equal(signals.providerId, "provider-2");
    assert.ok(signals.actionCodes.includes("hr.recruit"));
    assert.ok(signals.actionConfidences["hr.recruit"] > 0);
    assert.ok(signals.averageConfidence > 0);
  });
});
