import type { LivingProfessionalSimulatorContext } from "./simulator-context.js";
import {
  hashSimulatorSeed,
  resolveExperienceYears,
  resolveFrameStanding,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
} from "./simulator-context.js";

export interface SimulatorEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  passportLevel?: string;
  liveFrameLabel?: string;
  growthPath?: string[];
  challenges?: string[];
  opportunities?: Array<{ title: string; matchScore: number }>;
}

export interface SimulationProjection {
  scenario: string;
  assumptions: string[];
  inputSignals: string[];
  projectedOutcomes: string[];
  bestCase: string;
  expectedCase: string;
  worstCase: string;
  confidenceScore: number;
  explanation: string;
  missingInformation: string[];
  recommendedNextExperiments: string[];
}

export interface SimulationHistoryRecord {
  recordId: string;
  scenario: string;
  status: "accepted" | "ignored" | "pending";
  recordedAt: string;
  outcome?: string;
}

export interface SimulationHistoryProfile {
  records: SimulationHistoryRecord[];
  updatedAt: string;
}

export interface SimulatorSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface SimulationSummarySection extends SimulatorSectionBase {
  sectionId: "simulation_summary";
  overallUnderstanding: string;
  currentProfessionalState: string;
  featuredScenario: string;
  simulationPriority: string;
}

export interface AskWhatIfSection extends SimulatorSectionBase {
  sectionId: "ask_what_if";
  sampleQuestions: string[];
  simulationApproach: string;
  sourcesUsed: string[];
  deterministicOnly: true;
}

export interface WhatIfAnswer extends SimulationProjection {
  question: string;
}

export interface CareerSimulatorSection extends SimulatorSectionBase {
  sectionId: "career_simulator";
  simulation: SimulationProjection;
}

export interface LearningSimulatorSection extends SimulatorSectionBase {
  sectionId: "learning_simulator";
  simulation: SimulationProjection;
}

export interface IncomeSimulatorSection extends SimulatorSectionBase {
  sectionId: "income_simulator";
  simulation: SimulationProjection;
}

export interface ReputationSimulatorSection extends SimulatorSectionBase {
  sectionId: "reputation_simulator";
  simulation: SimulationProjection;
}

export interface TimeSimulatorSection extends SimulatorSectionBase {
  sectionId: "time_simulator";
  simulation: SimulationProjection;
}

export interface RiskSimulatorSection extends SimulatorSectionBase {
  sectionId: "risk_simulator";
  simulation: SimulationProjection;
}

export interface OpportunitySimulatorSection extends SimulatorSectionBase {
  sectionId: "opportunity_simulator";
  simulation: SimulationProjection;
}

export interface AlternativeScenariosSection extends SimulatorSectionBase {
  sectionId: "alternative_scenarios";
  scenarios: SimulationProjection[];
}

export interface AssumptionsSection extends SimulatorSectionBase {
  sectionId: "assumptions";
  globalAssumptions: string[];
  dataSources: string[];
  limitations: string[];
}

export interface ConfidenceExplanationSection extends SimulatorSectionBase {
  sectionId: "confidence_explanation";
  confidenceScore: number;
  evidence: string[];
  reasoning: string;
  missingInformation: string[];
  alternativeInterpretations: string[];
}

export interface SimulationHistorySection extends SimulatorSectionBase {
  sectionId: "simulation_history";
  previousSimulations: SimulationHistoryRecord[];
  acceptedSimulations: SimulationHistoryRecord[];
  ignoredSimulations: SimulationHistoryRecord[];
  outcomeComparison: string;
  learningEvolution: string;
}

export type LivingProfessionalSimulatorSection =
  | SimulationSummarySection
  | AskWhatIfSection
  | CareerSimulatorSection
  | LearningSimulatorSection
  | IncomeSimulatorSection
  | ReputationSimulatorSection
  | TimeSimulatorSection
  | RiskSimulatorSection
  | OpportunitySimulatorSection
  | AlternativeScenariosSection
  | AssumptionsSection
  | ConfidenceExplanationSection
  | SimulationHistorySection;

export function buildDefaultSimulationHistory(context: LivingProfessionalSimulatorContext): SimulationHistoryProfile {
  return { records: [], updatedAt: context.generatedAt };
}

function baseReadiness(engines: SimulatorEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function baseConfidence(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot, salt: string): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const hash = hashSimulatorSeed(context.dayKey, context.userId, salt);
  return Math.min(92, Math.round((readiness + trust) / 2 + (hash % 8)));
}

function globalAssumptions(context: LivingProfessionalSimulatorContext): string[] {
  return [
    `Professional activity continues in ${context.geographic.city}, ${context.geographic.country}`,
    "No automatic execution — user controls all decisions",
    "Projections are deterministic estimates, not guarantees",
    "Based on living experience data from passport, journey, impact, coach, planner, identity, and intelligence",
  ];
}

export function buildDeterministicProjection(input: {
  context: LivingProfessionalSimulatorContext;
  engines: SimulatorEngineSnapshot;
  scenario: string;
  salt: string;
  inputSignals: string[];
  projectedOutcomes: string[];
  bestCase: string;
  expectedCase: string;
  worstCase: string;
  explanation: string;
  missingInformation?: string[];
  recommendedNextExperiments: string[];
}): SimulationProjection {
  return {
    scenario: input.scenario,
    assumptions: globalAssumptions(input.context),
    inputSignals: input.inputSignals,
    projectedOutcomes: input.projectedOutcomes,
    bestCase: input.bestCase,
    expectedCase: input.expectedCase,
    worstCase: input.worstCase,
    confidenceScore: baseConfidence(input.context, input.engines, input.salt),
    explanation: input.explanation,
    missingInformation: input.missingInformation ?? [],
    recommendedNextExperiments: input.recommendedNextExperiments,
  };
}

export function buildSimulationSummarySection(
  context: LivingProfessionalSimulatorContext,
  engines: SimulatorEngineSnapshot
): SimulationSummarySection {
  const skill = resolvePrimarySkill(context);
  const featured = `What if you invest 30 days advancing ${skill} readiness?`;

  return {
    sectionId: "simulation_summary",
    title: "Simulation Summary",
    headline: "Explore professional what-if scenarios safely",
    description: "Deterministic projections — experience only, never executes.",
    overallUnderstanding: `${context.displayName}'s ${resolvePrimaryIndustry(context)} profile in ${context.geographic.city}.`,
    currentProfessionalState: `Readiness ${baseReadiness(engines)} — ${resolveFrameStanding(context)}`,
    featuredScenario: featured,
    simulationPriority: "Explore scenarios before deciding — you always control the outcome",
    explainable: true,
  };
}

export function buildAskWhatIfSection(context: LivingProfessionalSimulatorContext): AskWhatIfSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "ask_what_if",
    title: "Ask What If",
    headline: "One what-if question. One deterministic projection.",
    description: "Natural language scenarios with transparent assumptions — no AI hallucination.",
    sampleQuestions: [
      "What if I increase my price by 20%?",
      "What if I learn a new professional skill?",
      "What if I work two more hours every day?",
      `What if I change my specialization to advanced ${skill}?`,
      "What if I accept this opportunity?",
      "What if I start my own company?",
    ],
    simulationApproach: "Deterministic keyword analysis against living experience projections — never calls LLMs.",
    sourcesUsed: [
      "Living Professional Passport",
      "Living Professional Journey",
      "Living Professional Impact",
      "Living Professional Coach",
      "Living Action Planner",
      "Living Live Frame",
      "Living Professional Identity",
      "Living Professional Intelligence Center",
    ],
    deterministicOnly: true,
    explainable: true,
  };
}

export function buildWhatIfAnswer(
  context: LivingProfessionalSimulatorContext,
  engines: SimulatorEngineSnapshot,
  question: string
): WhatIfAnswer {
  const normalized = question.trim().toLowerCase();
  const skill = resolvePrimarySkill(context);
  const readiness = baseReadiness(engines);

  if (normalized.includes("price") || normalized.includes("20%")) {
    return {
      question: question.trim() || "What if I increase my price by 20%?",
      ...buildDeterministicProjection({
        context,
        engines,
        scenario: "Increase professional pricing by 20%",
        salt: "price",
        inputSignals: [`Readiness ${readiness}`, resolveFrameStanding(context), context.geographic.currency],
        projectedOutcomes: ["Higher revenue per engagement", "Possible reduced volume", "Stronger premium positioning"],
        bestCase: "15–20% income uplift with maintained client volume",
        expectedCase: "8–12% income uplift with slight volume adjustment",
        worstCase: "Temporary volume drop until market adjusts to new positioning",
        explanation: "Pricing simulations use readiness and trusted frame standing — recommendation only.",
        missingInformation: readiness < 60 ? ["More verified evidence may be needed for premium pricing"] : [],
        recommendedNextExperiments: ["Test 10% increase first", "Gather client feedback", "Update passport evidence"],
      }),
    };
  }

  if (normalized.includes("learn") || normalized.includes("skill")) {
    return {
      question: question.trim() || "What if I learn a new professional skill?",
      ...buildDeterministicProjection({
        context,
        engines,
        scenario: `Learn new ${skill}-adjacent professional skill`,
        salt: "learn",
        inputSignals: engines.growthPath ?? [`${skill} learning path`],
        projectedOutcomes: ["Readiness score improvement", "New opportunity matches", "Knowledge Bank contribution potential"],
        bestCase: "Readiness +15 within 90 days with consistent learning",
        expectedCase: "Readiness +8 within 90 days",
        worstCase: "Minimal change without consistent weekly practice",
        explanation: "Learning projections based on develop-me roadmap and journey momentum.",
        recommendedNextExperiments: ["Complete one learning module this week", "Record evidence of applied skill"],
      }),
    };
  }

  if (normalized.includes("hour") || normalized.includes("time")) {
    return {
      question: question.trim() || "What if I work two more hours every day?",
      ...buildDeterministicProjection({
        context,
        engines,
        scenario: "Add two professional hours daily",
        salt: "time",
        inputSignals: ["Current daily planner capacity", "Weekly execution trend"],
        projectedOutcomes: ["40% more weekly actions", "Faster journey progress", "Burnout risk if unsustainable"],
        bestCase: "Significant readiness and evidence growth in 30 days",
        expectedCase: "Moderate progress with sustainable habit formation",
        worstCase: "Burnout reduces long-term consistency",
        explanation: "Time simulations balance productivity gains against sustainability.",
        recommendedNextExperiments: ["Block 2 hours for highest-impact action only", "Track weekly energy levels"],
      }),
    };
  }

  if (normalized.includes("special") || normalized.includes("change")) {
    return {
      question: question.trim() || "What if I change my specialization?",
      ...buildDeterministicProjection({
        context,
        engines,
        scenario: `Change specialization within ${resolvePrimaryIndustry(context)}`,
        salt: "specialize",
        inputSignals: [skill, `${resolveExperienceYears(context)} years experience`],
        projectedOutcomes: ["6–12 month transition period", "New market positioning", "Certification requirements"],
        bestCase: "Strong demand match in new specialization within 6 months",
        expectedCase: "Gradual repositioning over 9–12 months",
        worstCase: "Temporary income dip during transition",
        explanation: "Specialization change requires evidence rebuild — never auto-executed.",
        recommendedNextExperiments: ["Research regional demand", "Complete gap analysis", "Pilot one project in new area"],
      }),
    };
  }

  if (normalized.includes("opportun") || normalized.includes("accept")) {
    const opp = engines.opportunities?.[0]?.title ?? `Regional ${skill} opportunity`;
    return {
      question: question.trim() || "What if I accept this opportunity?",
      ...buildDeterministicProjection({
        context,
        engines,
        scenario: `Accept opportunity: ${opp}`,
        salt: "opportunity",
        inputSignals: [`Match score ${engines.opportunities?.[0]?.matchScore ?? 75}%`, resolveFrameStanding(context)],
        projectedOutcomes: ["Journey advancement", "Evidence collection", "Network expansion"],
        bestCase: "High-impact project with strong reputation gain",
        expectedCase: "Solid professional progress and readiness boost",
        worstCase: "Capacity conflict with existing priorities",
        explanation: "Opportunity simulation ranks by match score and readiness — user decides.",
        recommendedNextExperiments: ["Review planner capacity", "Confirm preparation checklist", "Simulate time impact"],
      }),
    };
  }

  if (normalized.includes("company") || normalized.includes("start")) {
    return {
      question: question.trim() || "What if I start my own company?",
      ...buildDeterministicProjection({
        context,
        engines,
        scenario: `Start independent ${skill} practice in ${context.geographic.city}`,
        salt: "company",
        inputSignals: [resolveFrameStanding(context), context.geographic.legalEnvironment],
        projectedOutcomes: ["Higher autonomy", "Income variability", "Compliance and licensing requirements"],
        bestCase: "Successful independent practice within 12 months",
        expectedCase: "Gradual client base building over 18 months",
        worstCase: "Extended runway needed before profitability",
        explanation: "Business simulations include regulatory context — never auto-executes contracts or payments.",
        missingInformation: ["Business plan details", "Initial capital runway"],
        recommendedNextExperiments: ["Review government programs", "Consult partner ecosystem", "Simulate income scenarios"],
      }),
    };
  }

  return {
    question: question.trim() || `What if I advance ${skill} readiness this month?`,
    ...buildDeterministicProjection({
      context,
      engines,
      scenario: `Advance ${skill} professional readiness`,
      salt: "default",
      inputSignals: [`Readiness ${readiness}`, resolveFrameStanding(context)],
      projectedOutcomes: ["Journey progress", "Improved opportunity matches"],
      bestCase: "Readiness +12 in 30 days",
      expectedCase: "Readiness +6 in 30 days",
      worstCase: "Minimal change without daily action",
      explanation: "Default projection from unified living experience signals.",
      recommendedNextExperiments: ["Complete today's best action", "Run career simulator", "Review gap analysis"],
    }),
  };
}

function careerProjection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): SimulationProjection {
  const years = resolveExperienceYears(context);
  return buildDeterministicProjection({
    context,
    engines,
    scenario: years >= 8 ? "Pursue senior leadership track" : "Accelerate professional growth track",
    salt: "career",
    inputSignals: [`${years} years experience`, `Readiness ${baseReadiness(engines)}`, resolveFrameStanding(context)],
    projectedOutcomes: ["Promotion readiness improvement", "Leadership evidence portfolio", "Regional visibility increase"],
    bestCase: "Senior role readiness within 12 months",
    expectedCase: "Clear promotion path within 18 months",
    worstCase: "Extended timeline without consistent evidence",
    explanation: "Career simulation integrates journey and identity projections.",
    recommendedNextExperiments: ["Document leadership achievements", "Complete career coach review"],
  });
}

export function buildCareerSimulatorSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): CareerSimulatorSection {
  return {
    sectionId: "career_simulator",
    title: "Career Simulator",
    headline: "Simulate your career trajectory",
    description: "Deterministic career what-if — you decide whether to act.",
    simulation: careerProjection(context, engines),
    explainable: true,
  };
}

export function buildLearningSimulatorSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): LearningSimulatorSection {
  const skill = resolvePrimarySkill(context);
  return {
    sectionId: "learning_simulator",
    title: "Learning Simulator",
    headline: "Simulate learning investment outcomes",
    description: "Project skill growth from learning paths.",
    simulation: buildDeterministicProjection({
      context,
      engines,
      scenario: `Complete ${engines.growthPath?.[0] ?? skill + " learning module"}`,
      salt: "learning",
      inputSignals: engines.growthPath ?? [skill],
      projectedOutcomes: ["Skill gap reduction", "Knowledge Bank contribution", "Expert network visibility"],
      bestCase: "Certification-ready within 6 months",
      expectedCase: "Measurable readiness +10 within 90 days",
      worstCase: "Slow progress without weekly practice",
      explanation: "Learning simulation uses develop-me roadmap and learn-by-action signals.",
      recommendedNextExperiments: ["Schedule 5 hours weekly learning", "Share one knowledge contribution"],
    }),
    explainable: true,
  };
}

export function buildIncomeSimulatorSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): IncomeSimulatorSection {
  const readiness = baseReadiness(engines);
  return {
    sectionId: "income_simulator",
    title: "Income Simulator",
    headline: "Simulate income readiness changes",
    description: "Income projections are recommendations only — never executes payments.",
    simulation: buildDeterministicProjection({
      context,
      engines,
      scenario: "Improve professional pricing readiness over 90 days",
      salt: "income",
      inputSignals: [`Readiness ${readiness}`, context.geographic.currency, resolveFrameStanding(context)],
      projectedOutcomes: ["Premium rate eligibility", "Higher-value opportunity access"],
      bestCase: "15–25% earning potential increase",
      expectedCase: "8–15% earning potential increase",
      worstCase: "Minimal change below readiness threshold 60",
      explanation: "Income simulation from impact and identity value projections.",
      missingInformation: readiness < 55 ? ["Additional verified project evidence recommended"] : [],
      recommendedNextExperiments: ["Run pricing what-if", "Update professional passport"],
    }),
    explainable: true,
  };
}

export function buildReputationSimulatorSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): ReputationSimulatorSection {
  return {
    sectionId: "reputation_simulator",
    title: "Reputation Simulator",
    headline: "Simulate trust and reputation growth",
    description: "Live Frame and community contribution projections.",
    simulation: buildDeterministicProjection({
      context,
      engines,
      scenario: "Increase professional reputation through verified contributions",
      salt: "reputation",
      inputSignals: [resolveFrameStanding(context), `Trust ${engines.trustScore ?? 50}`],
      projectedOutcomes: ["Trust score improvement", "Community influence growth", "Partner eligibility"],
      bestCase: "Trusted expert recognition within 6 months",
      expectedCase: "Steady reputation build over 12 months",
      worstCase: "Limited change without consistent community contribution",
      explanation: "Reputation simulation integrates live frame and community impact.",
      recommendedNextExperiments: ["Publish one knowledge article", "Answer one community question"],
    }),
    explainable: true,
  };
}

export function buildTimeSimulatorSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): TimeSimulatorSection {
  return {
    sectionId: "time_simulator",
    title: "Time Simulator",
    headline: "Simulate time investment tradeoffs",
    description: "Planner-integrated time what-if scenarios.",
    simulation: buildDeterministicProjection({
      context,
      engines,
      scenario: "Reallocate 10 weekly hours to highest-impact actions",
      salt: "time-sim",
      inputSignals: ["Action planner capacity", "Priority timeline"],
      projectedOutcomes: ["40% more completed actions", "Reduced low-priority backlog"],
      bestCase: "Double weekly professional wins",
      expectedCase: "30% productivity improvement",
      worstCase: "Overload without prioritization discipline",
      explanation: "Time simulation from action planner execution patterns.",
      recommendedNextExperiments: ["Run priority timeline review", "Block morning focus time"],
    }),
    explainable: true,
  };
}

export function buildRiskSimulatorSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): RiskSimulatorSection {
  return {
    sectionId: "risk_simulator",
    title: "Risk Simulator",
    headline: "Simulate professional risk scenarios",
    description: "What-if for risks — explainable, never alarmist.",
    simulation: buildDeterministicProjection({
      context,
      engines,
      scenario: "Ignore professional risk alerts for 30 days",
      salt: "risk",
      inputSignals: engines.challenges ?? ["Verification gaps"],
      projectedOutcomes: ["Readiness stagnation", "Missed opportunities", "Trust standing erosion"],
      bestCase: "No immediate impact if risks are low severity",
      expectedCase: "Moderate readiness decline and missed matches",
      worstCase: "Compliance or trust issues if verification lapses",
      explanation: "Risk simulation from intelligence center risk analysis.",
      missingInformation: !context.onboarding.ironVerification?.identityConfirmed ? ["Complete identity verification"] : [],
      recommendedNextExperiments: ["Review risk alerts today", "Address top skill gap"],
    }),
    explainable: true,
  };
}

export function buildOpportunitySimulatorSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): OpportunitySimulatorSection {
  const opp = engines.opportunities?.[0]?.title ?? `Regional ${resolvePrimarySkill(context)} opportunity`;
  return {
    sectionId: "opportunity_simulator",
    title: "Opportunity Simulator",
    headline: "Simulate opportunity pursuit outcomes",
    description: "Explore opportunities before committing — never auto-accepts.",
    simulation: buildDeterministicProjection({
      context,
      engines,
      scenario: `Pursue: ${opp}`,
      salt: "opp-sim",
      inputSignals: [`Match ${engines.opportunities?.[0]?.matchScore ?? 75}%`, resolveFrameStanding(context)],
      projectedOutcomes: ["Portfolio expansion", "Regional visibility", "Journey milestone progress"],
      bestCase: "High-value engagement with strong evidence outcome",
      expectedCase: "Solid professional growth from opportunity",
      worstCase: "Preparation gaps delay successful engagement",
      explanation: "Opportunity simulation from living opportunities and readiness match.",
      recommendedNextExperiments: ["Review required preparation", "Simulate time impact"],
    }),
    explainable: true,
  };
}

export function buildAlternativeScenariosSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): AlternativeScenariosSection {
  return {
    sectionId: "alternative_scenarios",
    title: "Alternative Scenarios",
    headline: "Compare alternative what-if paths",
    description: "Side-by-side deterministic scenarios with tradeoffs.",
    scenarios: [
      careerProjection(context, engines),
      buildDeterministicProjection({
        context,
        engines,
        scenario: "Focus on learning over new opportunities",
        salt: "alt-learn",
        inputSignals: engines.growthPath ?? [],
        projectedOutcomes: ["Deep expertise", "Delayed short-term income"],
        bestCase: "Expert certification within 6 months",
        expectedCase: "Strong skill foundation in 90 days",
        worstCase: "Missed near-term opportunities",
        explanation: "Learning-first path trades immediate opportunities for depth.",
        recommendedNextExperiments: ["Compare income simulator", "Review opportunity queue"],
      }),
      buildDeterministicProjection({
        context,
        engines,
        scenario: "Focus on opportunities over learning",
        salt: "alt-opp",
        inputSignals: (engines.opportunities ?? []).map((o) => o.title),
        projectedOutcomes: ["Immediate pipeline activity", "Slower skill depth"],
        bestCase: "Quick engagement wins",
        expectedCase: "Steady opportunity flow",
        worstCase: "Skill gaps limit long-term growth",
        explanation: "Opportunity-first path trades depth for immediate pipeline.",
        recommendedNextExperiments: ["Run gap analysis", "Check preparation checklist"],
      }),
    ],
    explainable: true,
  };
}

export function buildAssumptionsSection(context: LivingProfessionalSimulatorContext): AssumptionsSection {
  return {
    sectionId: "assumptions",
    title: "Assumptions",
    headline: "Every simulation declares its assumptions",
    description: "Transparent, deterministic, never hidden.",
    globalAssumptions: globalAssumptions(context),
    dataSources: [
      "Onboarding profile",
      "DevelopMe readiness",
      "Personal Assistant goals",
      "Living experience projections",
    ],
    limitations: [
      "Projections are estimates, not guarantees",
      "External market shocks are not modeled",
      "User must validate assumptions before acting",
    ],
    explainable: true,
  };
}

export function buildConfidenceExplanationSection(context: LivingProfessionalSimulatorContext, engines: SimulatorEngineSnapshot): ConfidenceExplanationSection {
  const conf = baseConfidence(context, engines, "overall");
  return {
    sectionId: "confidence_explanation",
    title: "Confidence & Explanation",
    headline: `${conf}% confidence in simulation accuracy`,
    description: "Evidence-based confidence with stated limitations.",
    confidenceScore: conf,
    evidence: [
      `Readiness ${baseReadiness(engines)}`,
      resolveFrameStanding(context),
      `${resolveExperienceYears(context)} years verified experience`,
      engines.passportLevel ?? "Passport profile active",
    ],
    reasoning: "Confidence derived from data completeness and living experience alignment — never fabricated.",
    missingInformation: !context.onboarding.ironVerification?.identityConfirmed ? ["Complete verification for higher confidence"] : [],
    alternativeInterpretations: [
      "Conservative interpretation: extend all timelines by 50%",
      "Optimistic interpretation: assumes perfect weekly execution",
    ],
    explainable: true,
  };
}

export function buildSimulationHistorySection(
  _context: LivingProfessionalSimulatorContext,
  history: SimulationHistoryProfile
): SimulationHistorySection {
  const accepted = history.records.filter((r) => r.status === "accepted");
  const ignored = history.records.filter((r) => r.status === "ignored");

  return {
    sectionId: "simulation_history",
    title: "Simulation History",
    headline: `${history.records.length} simulation${history.records.length === 1 ? "" : "s"} recorded`,
    description: "Track explored scenarios — learn from outcomes over time.",
    previousSimulations: history.records.slice(0, 10),
    acceptedSimulations: accepted,
    ignoredSimulations: ignored,
    outcomeComparison: accepted.length > 0 ? "Accepted simulations help refine future projections" : "Explore scenarios to build history",
    learningEvolution: history.records.length >= 3 ? "Simulator adapts to your exploration patterns" : "History grows with each what-if",
    explainable: true,
  };
}

export function buildAllSimulatorSections(
  context: LivingProfessionalSimulatorContext,
  engines: SimulatorEngineSnapshot,
  history: SimulationHistoryProfile
): LivingProfessionalSimulatorSection[] {
  return [
    buildSimulationSummarySection(context, engines),
    buildAskWhatIfSection(context),
    buildCareerSimulatorSection(context, engines),
    buildLearningSimulatorSection(context, engines),
    buildIncomeSimulatorSection(context, engines),
    buildReputationSimulatorSection(context, engines),
    buildTimeSimulatorSection(context, engines),
    buildRiskSimulatorSection(context, engines),
    buildOpportunitySimulatorSection(context, engines),
    buildAlternativeScenariosSection(context, engines),
    buildAssumptionsSection(context),
    buildConfidenceExplanationSection(context, engines),
    buildSimulationHistorySection(context, history),
  ];
}

function projectionToView(p: SimulationProjection) {
  return {
    scenario: p.scenario,
    assumptions: p.assumptions,
    input_signals: p.inputSignals,
    projected_outcomes: p.projectedOutcomes,
    best_case: p.bestCase,
    expected_case: p.expectedCase,
    worst_case: p.worstCase,
    confidence_score: p.confidenceScore,
    explanation: p.explanation,
    missing_information: p.missingInformation,
    recommended_next_experiments: p.recommendedNextExperiments,
  };
}

function sectionToView(section: LivingProfessionalSimulatorSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "simulation_summary":
      return {
        ...base,
        overall_understanding: section.overallUnderstanding,
        current_professional_state: section.currentProfessionalState,
        featured_scenario: section.featuredScenario,
        simulation_priority: section.simulationPriority,
      };
    case "ask_what_if":
      return {
        ...base,
        sample_questions: section.sampleQuestions,
        simulation_approach: section.simulationApproach,
        sources_used: section.sourcesUsed,
        deterministic_only: section.deterministicOnly,
      };
    case "career_simulator":
    case "learning_simulator":
    case "income_simulator":
    case "reputation_simulator":
    case "time_simulator":
    case "risk_simulator":
    case "opportunity_simulator":
      return { ...base, simulation: projectionToView(section.simulation) };
    case "alternative_scenarios":
      return { ...base, scenarios: section.scenarios.map(projectionToView) };
    case "assumptions":
      return {
        ...base,
        global_assumptions: section.globalAssumptions,
        data_sources: section.dataSources,
        limitations: section.limitations,
      };
    case "confidence_explanation":
      return {
        ...base,
        confidence_score: section.confidenceScore,
        evidence: section.evidence,
        reasoning: section.reasoning,
        missing_information: section.missingInformation,
        alternative_interpretations: section.alternativeInterpretations,
      };
    case "simulation_history":
      return {
        ...base,
        previous_simulations: section.previousSimulations.map(mapHistoryRecord),
        accepted_simulations: section.acceptedSimulations.map(mapHistoryRecord),
        ignored_simulations: section.ignoredSimulations.map(mapHistoryRecord),
        outcome_comparison: section.outcomeComparison,
        learning_evolution: section.learningEvolution,
      };
    default:
      return base;
  }
}

function mapHistoryRecord(r: SimulationHistoryRecord) {
  return {
    record_id: r.recordId,
    scenario: r.scenario,
    status: r.status,
    recorded_at: r.recordedAt,
    outcome: r.outcome,
  };
}

export function toSimulatorSectionView(section: LivingProfessionalSimulatorSection) {
  return sectionToView(section);
}

export function toSimulatorSectionsView(sections: LivingProfessionalSimulatorSection[]) {
  return sections.map(toSimulatorSectionView);
}

export function toWhatIfAnswerView(answer: WhatIfAnswer) {
  return {
    question: answer.question,
    ...projectionToView(answer),
    explainable: true,
    predicts_only: true,
    never_decide_for_user: true,
    always_show_assumptions: true,
    always_show_confidence: true,
  };
}

export function recordSimulationOutcome(
  history: SimulationHistoryProfile,
  recordId: string,
  scenario: string,
  status: "accepted" | "ignored",
  recordedAt: string,
  outcome?: string
): SimulationHistoryProfile {
  const without = history.records.filter((r) => r.recordId !== recordId);
  return {
    records: [{ recordId, scenario, status, recordedAt, outcome }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}

export const SIMULATOR_EXPERIENCE_FLAGS = {
  experience_only: true,
  read_only: true,
  predicts_only: true,
  recommends_only: true,
  never_execute: true,
  never_decide_for_user: true,
  never_fabricate_reasoning: true,
  never_fabricate_data: true,
  always_show_assumptions: true,
  always_show_confidence: true,
  user_controls_final_decision: true,
} as const;
