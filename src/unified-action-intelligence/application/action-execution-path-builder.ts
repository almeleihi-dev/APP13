import type { ActionExecutionPath } from "../domain/action-intent.js";
import type { ScenarioSeed } from "../domain/scenario-seeds.js";

const PRICE_BANDS: Record<
  ScenarioSeed["goal"]["category"],
  ActionExecutionPath["priceBandHint"]
> = {
  moving: { min: 80, max: 350, currency: "SAR", basis: "room volume and handler count" },
  cleaning: { min: 120, max: 450, currency: "SAR", basis: "apartment size and deep-clean scope" },
  delivery: { min: 25, max: 120, currency: "SAR", basis: "distance and urgency" },
  maintenance: { min: 75, max: 280, currency: "SAR", basis: "parts and licensed trade requirement" },
  professional_request: {
    min: 0,
    max: 0,
    currency: "SAR",
    basis: "preparation only — pricing deferred to provider matching",
  },
};

const TRUST_CONSIDERATIONS: Record<ScenarioSeed["goal"]["category"], string[]> = {
  moving: [
    "Confirm handler identity before property access.",
    "Document item condition with photos at intake.",
  ],
  cleaning: [
    "Verify supply safety and surface compatibility.",
    "Capture before/after photos for quality assurance.",
  ],
  delivery: [
    "Maintain chain-of-custody with proof of delivery.",
    "Verify recipient identity against request details.",
  ],
  maintenance: [
    "Confirm licensed trade when code or safety scope applies.",
    "Record test results and parts used for warranty traceability.",
  ],
  professional_request: [
    "Ensure scope clarity before provider matching.",
    "Set evidence expectations for milestone acceptance.",
  ],
};

export function buildExecutionPathForScenario(seed: ScenarioSeed): ActionExecutionPath {
  const phases = groupStepsIntoPhases(seed);

  return {
    pathId: `path-${seed.scenarioId}`,
    phases,
    contractReadiness: describeContractReadiness(seed),
    trustConsiderations: TRUST_CONSIDERATIONS[seed.goal.category],
    priceBandHint: PRICE_BANDS[seed.goal.category],
    executionNotes:
      "Read-only intelligence path — no contracts executed, payments created, or trust events recorded.",
  };
}

function groupStepsIntoPhases(seed: ScenarioSeed): ActionExecutionPath["phases"] {
  const phaseOrder = ["intake", "planning", "preparation", "execution", "verification", "closure"];
  const grouped = new Map<string, string[]>();

  for (const step of seed.steps) {
    const existing = grouped.get(step.phase) ?? [];
    existing.push(step.stepId);
    grouped.set(step.phase, existing);
  }

  return phaseOrder
    .filter((phase) => grouped.has(phase))
    .map((phase) => ({
      phase,
      stepIds: grouped.get(phase)!,
      gate: phaseGate(phase),
    }));
}

function phaseGate(phase: string): string {
  switch (phase) {
    case "intake":
      return "Goal and scope confirmed";
    case "planning":
      return "Resources and skills mapped";
    case "preparation":
      return "Worksite ready";
    case "execution":
      return "Actions in progress";
    case "verification":
      return "Outcome verified";
    case "closure":
      return "Intelligence summary complete";
    default:
      return "Phase checkpoint";
  }
}

function describeContractReadiness(seed: ScenarioSeed): string {
  if (seed.goal.category === "professional_request") {
    return "Request package ready for match-to-contract conversion — no contract created.";
  }
  return `Action decomposition supports contract drafting for ${seed.goal.category} — execution not initiated.`;
}

export class ActionExecutionPathBuilder {
  build(seed: ScenarioSeed): ActionExecutionPath {
    return buildExecutionPathForScenario(seed);
  }
}

export function createActionExecutionPathBuilder(): ActionExecutionPathBuilder {
  return new ActionExecutionPathBuilder();
}
