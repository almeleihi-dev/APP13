import type { ScenarioId } from "./action-intelligence-schema.js";
import type {
  ActionDecomposition,
  ActionGoal,
  ActionResource,
  ActionRiskSignal,
  ActionSkillRequirement,
  ActionStep,
} from "./action-intent.js";

export interface ScenarioSeed {
  scenarioId: ScenarioId;
  goal: ActionGoal;
  steps: ActionStep[];
  resources: ActionResource[];
  skills: ActionSkillRequirement[];
  timeBand: ActionDecomposition["timeBand"];
  riskSignals: ActionRiskSignal[];
  keywords: string[];
  sampleIntents: string[];
}

export const SCENARIO_SEEDS: ScenarioSeed[] = [
  {
    scenarioId: "moving_a_room",
    goal: {
      goalId: "goal-moving-room",
      label: "Move a room's contents safely",
      description:
        "Relocate furniture, boxes, and belongings from one room to another with minimal damage and clear access paths.",
      category: "moving",
      scenarioId: "moving_a_room",
    },
    steps: [
      {
        stepId: "move-1",
        order: 1,
        title: "Assess room layout and items",
        description: "Inventory large furniture, fragile items, and doorway constraints.",
        phase: "intake",
        estimatedMinutes: { min: 15, max: 30 },
      },
      {
        stepId: "move-2",
        order: 2,
        title: "Prepare protection and pathways",
        description: "Cover floors, pad corners, and clear hallways for safe transit.",
        phase: "planning",
        estimatedMinutes: { min: 20, max: 40 },
      },
      {
        stepId: "move-3",
        order: 3,
        title: "Disassemble oversized items",
        description: "Remove legs, shelves, or modular parts that block narrow passages.",
        phase: "preparation",
        estimatedMinutes: { min: 30, max: 60 },
      },
      {
        stepId: "move-4",
        order: 4,
        title: "Move items in priority order",
        description: "Transport boxes first, then medium furniture, then heavy pieces with two handlers.",
        phase: "execution",
        estimatedMinutes: { min: 60, max: 180 },
      },
      {
        stepId: "move-5",
        order: 5,
        title: "Reassemble and verify placement",
        description: "Reinstall parts, confirm stable placement, and remove debris.",
        phase: "closure",
        estimatedMinutes: { min: 20, max: 45 },
      },
    ],
    resources: [
      { resourceId: "res-dolly", name: "Furniture dolly", type: "tool", required: true },
      { resourceId: "res-pads", name: "Moving pads and straps", type: "material", required: true },
      { resourceId: "res-gloves", name: "Work gloves", type: "tool", required: false },
      { resourceId: "res-helpers", name: "Second handler for heavy items", type: "personnel", required: true },
    ],
    skills: [
      {
        skillId: "skill-lifting",
        name: "Safe manual handling",
        level: "entry",
        rationale: "Prevents injury when moving heavy furniture.",
      },
      {
        skillId: "skill-spatial",
        name: "Spatial planning",
        level: "professional",
        rationale: "Optimizes item order and pathway use.",
      },
    ],
    timeBand: {
      minHours: 2,
      maxHours: 6,
      summary: "Typical room move completes in 2–6 hours depending on volume and access.",
    },
    riskSignals: [
      {
        signalId: "risk-back-injury",
        category: "physical",
        severity: "medium",
        description: "Heavy lifting without proper technique or assistance.",
        mitigationHint: "Use two-person lift protocol and equipment for items over 25 kg.",
      },
      {
        signalId: "risk-property-damage",
        category: "property",
        severity: "medium",
        description: "Walls, door frames, or flooring may be scratched during transit.",
        mitigationHint: "Pad corners and use floor runners before moving large pieces.",
      },
    ],
    keywords: ["move", "moving", "relocate", "room", "furniture", "shift"],
    sampleIntents: ["I need to move everything from the guest room to the garage."],
  },
  {
    scenarioId: "cleaning_an_apartment",
    goal: {
      goalId: "goal-clean-apartment",
      label: "Clean an apartment thoroughly",
      description:
        "Perform a structured apartment cleaning covering kitchen, bathroom, living areas, and floors.",
      category: "cleaning",
      scenarioId: "cleaning_an_apartment",
    },
    steps: [
      {
        stepId: "clean-1",
        order: 1,
        title: "Walk-through and supply check",
        description: "Identify priority zones, stains, and confirm cleaning supplies are available.",
        phase: "intake",
        estimatedMinutes: { min: 10, max: 20 },
      },
      {
        stepId: "clean-2",
        order: 2,
        title: "Declutter surfaces",
        description: "Clear counters, tables, and floors to expose all cleanable surfaces.",
        phase: "preparation",
        estimatedMinutes: { min: 20, max: 40 },
      },
      {
        stepId: "clean-3",
        order: 3,
        title: "Deep clean kitchen and bathroom",
        description: "Sanitize sinks, appliances, toilet, shower, and high-touch fixtures.",
        phase: "execution",
        estimatedMinutes: { min: 60, max: 120 },
      },
      {
        stepId: "clean-4",
        order: 4,
        title: "Dust and wipe living areas",
        description: "Dust surfaces, wipe switches, and clean mirrors and windows as needed.",
        phase: "execution",
        estimatedMinutes: { min: 45, max: 90 },
      },
      {
        stepId: "clean-5",
        order: 5,
        title: "Vacuum and mop all floors",
        description: "Finish with floor care working from far rooms toward the exit.",
        phase: "closure",
        estimatedMinutes: { min: 30, max: 60 },
      },
    ],
    resources: [
      { resourceId: "res-vacuum", name: "Vacuum cleaner", type: "tool", required: true },
      { resourceId: "res-mop", name: "Mop and bucket", type: "tool", required: true },
      { resourceId: "res-chemicals", name: "Approved cleaning agents", type: "material", required: true },
      { resourceId: "res-apartment", name: "Apartment access", type: "space", required: true },
    ],
    skills: [
      {
        skillId: "skill-sanitation",
        name: "Sanitation procedures",
        level: "professional",
        rationale: "Ensures hygienic kitchen and bathroom results.",
      },
      {
        skillId: "skill-surface",
        name: "Surface-safe cleaning",
        level: "entry",
        rationale: "Avoids damage to finishes and materials.",
      },
    ],
    timeBand: {
      minHours: 3,
      maxHours: 8,
      summary: "Full apartment cleaning typically requires 3–8 hours by size and condition.",
    },
    riskSignals: [
      {
        signalId: "risk-chemical",
        category: "health",
        severity: "low",
        description: "Improper mixing or use of cleaning chemicals.",
        mitigationHint: "Follow label instructions and ventilate work areas.",
      },
      {
        signalId: "risk-missed-areas",
        category: "quality",
        severity: "medium",
        description: "High-traffic zones may be under-cleaned without a checklist.",
        mitigationHint: "Use room-by-room checklist before sign-off.",
      },
    ],
    keywords: ["clean", "cleaning", "apartment", "housekeeping", "sanitize", "deep clean"],
    sampleIntents: ["I want a full cleaning of my two-bedroom apartment before guests arrive."],
  },
  {
    scenarioId: "delivering_a_document",
    goal: {
      goalId: "goal-deliver-document",
      label: "Deliver a document securely",
      description:
        "Transport an important document from origin to recipient with chain-of-custody awareness.",
      category: "delivery",
      scenarioId: "delivering_a_document",
    },
    steps: [
      {
        stepId: "deliver-1",
        order: 1,
        title: "Verify document and recipient details",
        description: "Confirm document identity, recipient name, address, and delivery window.",
        phase: "intake",
        estimatedMinutes: { min: 5, max: 15 },
      },
      {
        stepId: "deliver-2",
        order: 2,
        title: "Prepare sealed packaging",
        description: "Place document in tamper-evident envelope or folder.",
        phase: "preparation",
        estimatedMinutes: { min: 5, max: 10 },
      },
      {
        stepId: "deliver-3",
        order: 3,
        title: "Plan route and timing",
        description: "Select fastest reliable route accounting for traffic and recipient hours.",
        phase: "planning",
        estimatedMinutes: { min: 5, max: 15 },
      },
      {
        stepId: "deliver-4",
        order: 4,
        title: "Transport document",
        description: "Carry document securely to destination without exposure to weather or loss.",
        phase: "execution",
        estimatedMinutes: { min: 20, max: 90 },
      },
      {
        stepId: "deliver-5",
        order: 5,
        title: "Obtain proof of delivery",
        description: "Collect signature, photo, or timestamp confirmation from recipient.",
        phase: "closure",
        estimatedMinutes: { min: 5, max: 15 },
      },
    ],
    resources: [
      { resourceId: "res-envelope", name: "Tamper-evident envelope", type: "material", required: true },
      { resourceId: "res-document", name: "Document packet", type: "document", required: true },
      { resourceId: "res-transport", name: "Bike, car, or courier bag", type: "vehicle", required: true },
    ],
    skills: [
      {
        skillId: "skill-custody",
        name: "Chain-of-custody handling",
        level: "professional",
        rationale: "Maintains document integrity during transit.",
      },
      {
        skillId: "skill-navigation",
        name: "Local navigation",
        level: "entry",
        rationale: "Ensures on-time arrival at the correct address.",
      },
    ],
    timeBand: {
      minHours: 0.5,
      maxHours: 3,
      summary: "Document delivery usually completes within 30 minutes to 3 hours.",
    },
    riskSignals: [
      {
        signalId: "risk-loss",
        category: "custody",
        severity: "high",
        description: "Document may be lost or delivered to wrong recipient.",
        mitigationHint: "Verify recipient ID and capture proof of delivery.",
      },
      {
        signalId: "risk-delay",
        category: "timing",
        severity: "medium",
        description: "Late delivery may miss deadline or business window.",
        mitigationHint: "Confirm delivery window at intake and buffer travel time.",
      },
    ],
    keywords: ["deliver", "delivery", "document", "courier", "drop off", "hand deliver"],
    sampleIntents: ["Please deliver this signed contract to the client office downtown."],
  },
  {
    scenarioId: "fixing_small_home_issue",
    goal: {
      goalId: "goal-fix-home-issue",
      label: "Fix a small home maintenance issue",
      description:
        "Diagnose and repair a minor household problem such as a leak, loose fixture, or tripped breaker.",
      category: "maintenance",
      scenarioId: "fixing_small_home_issue",
    },
    steps: [
      {
        stepId: "fix-1",
        order: 1,
        title: "Identify the issue safely",
        description: "Inspect symptoms, isolate utilities if needed, and confirm scope is minor.",
        phase: "intake",
        estimatedMinutes: { min: 10, max: 25 },
      },
      {
        stepId: "fix-2",
        order: 2,
        title: "Gather tools and parts",
        description: "Collect basic tools and compatible replacement parts before starting work.",
        phase: "preparation",
        estimatedMinutes: { min: 10, max: 30 },
      },
      {
        stepId: "fix-3",
        order: 3,
        title: "Apply targeted repair",
        description: "Tighten, replace, seal, or reset the affected component.",
        phase: "execution",
        estimatedMinutes: { min: 30, max: 90 },
      },
      {
        stepId: "fix-4",
        order: 4,
        title: "Test and verify fix",
        description: "Run water, power, or mechanical test to confirm issue is resolved.",
        phase: "verification",
        estimatedMinutes: { min: 10, max: 20 },
      },
      {
        stepId: "fix-5",
        order: 5,
        title: "Document work performed",
        description: "Note parts used, test results, and any follow-up recommendations.",
        phase: "closure",
        estimatedMinutes: { min: 5, max: 15 },
      },
    ],
    resources: [
      { resourceId: "res-toolkit", name: "Basic hand tool kit", type: "tool", required: true },
      { resourceId: "res-parts", name: "Replacement washers or fittings", type: "material", required: false },
      { resourceId: "res-shutoff", name: "Utility shutoff access", type: "space", required: true },
    ],
    skills: [
      {
        skillId: "skill-diagnosis",
        name: "Basic home diagnostics",
        level: "professional",
        rationale: "Confirms issue is within minor repair scope.",
      },
      {
        skillId: "skill-safety",
        name: "Utility safety awareness",
        level: "professional",
        rationale: "Prevents hazards when working near water or electrical systems.",
      },
    ],
    timeBand: {
      minHours: 1,
      maxHours: 3,
      summary: "Small home fixes typically take 1–3 hours including diagnosis.",
    },
    riskSignals: [
      {
        signalId: "risk-scope-creep",
        category: "scope",
        severity: "medium",
        description: "Issue may be deeper than a minor fix and require licensed trade.",
        mitigationHint: "Escalate to specialist if structural or code-level work is detected.",
      },
      {
        signalId: "risk-injury",
        category: "physical",
        severity: "medium",
        description: "Working with tools or utilities without proper precautions.",
        mitigationHint: "Shut off utilities and use insulated tools where applicable.",
      },
    ],
    keywords: ["fix", "repair", "leak", "broken", "maintenance", "handyman", "faucet", "issue"],
    sampleIntents: ["The kitchen faucet is dripping and I need someone to fix it."],
  },
  {
    scenarioId: "preparing_professional_service_request",
    goal: {
      goalId: "goal-professional-request",
      label: "Prepare a professional service request",
      description:
        "Structure a clear, match-ready service request with scope, constraints, and success criteria.",
      category: "professional_request",
      scenarioId: "preparing_professional_service_request",
    },
    steps: [
      {
        stepId: "req-1",
        order: 1,
        title: "Capture service intent",
        description: "Record what outcome the customer needs and why it matters.",
        phase: "intake",
        estimatedMinutes: { min: 10, max: 20 },
      },
      {
        stepId: "req-2",
        order: 2,
        title: "Define scope and boundaries",
        description: "List included tasks, exclusions, location, and access constraints.",
        phase: "planning",
        estimatedMinutes: { min: 15, max: 30 },
      },
      {
        stepId: "req-3",
        order: 3,
        title: "Identify required skills and credentials",
        description: "Map provider qualifications, licenses, and experience level needed.",
        phase: "planning",
        estimatedMinutes: { min: 10, max: 20 },
      },
      {
        stepId: "req-4",
        order: 4,
        title: "Estimate time and budget band",
        description: "Provide realistic duration and price range for provider matching.",
        phase: "planning",
        estimatedMinutes: { min: 10, max: 25 },
      },
      {
        stepId: "req-5",
        order: 5,
        title: "Draft match-ready request package",
        description: "Assemble structured request with milestones, evidence, and trust expectations.",
        phase: "closure",
        estimatedMinutes: { min: 15, max: 30 },
      },
    ],
    resources: [
      { resourceId: "res-brief", name: "Service brief template", type: "document", required: true },
      { resourceId: "res-site-info", name: "Site access and location details", type: "document", required: true },
      { resourceId: "res-coordinator", name: "Request coordinator", type: "personnel", required: false },
    ],
    skills: [
      {
        skillId: "skill-scoping",
        name: "Service scoping",
        level: "professional",
        rationale: "Produces unambiguous scope for provider matching.",
      },
      {
        skillId: "skill-communication",
        name: "Requirements communication",
        level: "professional",
        rationale: "Ensures providers understand expectations and constraints.",
      },
    ],
    timeBand: {
      minHours: 1,
      maxHours: 2,
      summary: "Professional request preparation typically takes 1–2 hours.",
    },
    riskSignals: [
      {
        signalId: "risk-ambiguous-scope",
        category: "quality",
        severity: "high",
        description: "Vague scope leads to mismatched providers and disputes.",
        mitigationHint: "Require explicit inclusions, exclusions, and success criteria.",
      },
      {
        signalId: "risk-unrealistic-budget",
        category: "commercial",
        severity: "medium",
        description: "Budget band may not align with required skill level.",
        mitigationHint: "Cross-check price band against skill and time estimates.",
      },
    ],
    keywords: [
      "service request",
      "professional",
      "hire",
      "provider",
      "request",
      "scope",
      "brief",
    ],
    sampleIntents: [
      "I need help preparing a detailed request to hire an electrician for panel upgrade.",
    ],
  },
];

export function getScenarioSeed(scenarioId: ScenarioId): ScenarioSeed {
  const seed = SCENARIO_SEEDS.find((entry) => entry.scenarioId === scenarioId);
  if (!seed) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  return seed;
}

export function listScenarioSeeds(): ScenarioSeed[] {
  return [...SCENARIO_SEEDS];
}
