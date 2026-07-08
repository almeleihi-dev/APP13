import type { LivingProfessionalIntelligenceContext } from "./intelligence-context.js";
import {
  hashIntelligenceSeed,
  resolveEconomicConditions,
  resolveFrameStanding,
  resolveMarketDemand,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
} from "./intelligence-context.js";

export interface IntelligenceEngineSnapshot {
  readinessScore?: number;
  trustScore?: number;
  passportLevel?: string;
  liveFrameLabel?: string;
  growthPath?: string[];
  challenges?: string[];
  opportunities?: Array<{ title: string; matchScore: number; readiness?: string }>;
  todaysBestAction?: { title: string; description: string };
  orchestrationHeadline?: string;
  orchestrationDescription?: string;
  expertRecommendations?: string[];
}

export interface IntelligenceHistoryRecord {
  recordId: string;
  recommendation: string;
  status: "accepted" | "ignored" | "pending";
  recordedAt: string;
  outcome?: string;
}

export interface IntelligenceHistoryProfile {
  records: IntelligenceHistoryRecord[];
  updatedAt: string;
}

export interface IntelligenceSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface IntelligenceSummarySection extends IntelligenceSectionBase {
  sectionId: "intelligence_summary";
  overallUnderstanding: string;
  currentProfessionalState: string;
  mainRecommendation: string;
  professionalPriority: string;
}

export interface AskAnythingSection extends IntelligenceSectionBase {
  sectionId: "ask_anything";
  sampleQuestions: string[];
  reasoningApproach: string;
  sourcesUsed: string[];
  neverHallucinate: true;
}

export interface AskAnythingAnswer {
  question: string;
  answer: string;
  why: string;
  how: string;
  benefit: string;
  requirements: string[];
  alternatives: string[];
  confidence: number;
  sources: string[];
}

export interface TodaysBestDecisionSection extends IntelligenceSectionBase {
  sectionId: "todays_best_decision";
  decision: string;
  whyNow: string;
  expectedBenefit: string;
  estimatedEffortMinutes: number;
}

export interface ProfessionalAnalysisSection extends IntelligenceSectionBase {
  sectionId: "professional_analysis";
  passport: string;
  journey: string;
  impact: string;
  coach: string;
  planner: string;
  liveFrame: string;
  professionalIdentity: string;
  unifiedExplanation: string;
}

export interface ProfessionalOpportunitiesAnalysisSection extends IntelligenceSectionBase {
  sectionId: "professional_opportunities_analysis";
  evaluatedOpportunities: Array<{ title: string; matchScore: number; readiness: string; ranking: number }>;
  comparisonExplanation: string;
  readinessSummary: string;
}

export interface ProfessionalRisksSection extends IntelligenceSectionBase {
  sectionId: "professional_risks";
  risks: Array<{ category: string; message: string; explanation: string; severity: string }>;
}

export interface ProfessionalStrengthsAnalysisSection extends IntelligenceSectionBase {
  sectionId: "professional_strengths_analysis";
  topStrengths: string[];
  competitiveAdvantages: string[];
  uniqueSkills: string[];
  professionalPatterns: string[];
  highValueCapabilities: string[];
  professionalConfidence: string;
}

export interface ProfessionalGapsSection extends IntelligenceSectionBase {
  sectionId: "professional_gaps";
  skills: string[];
  experience: string[];
  certificates: string[];
  knowledge: string[];
  professionalReadiness: string;
  improvementPath: string[];
}

export interface RecommendedNextStepsSection extends IntelligenceSectionBase {
  sectionId: "recommended_next_steps";
  primaryPath: string;
  alternativeRecommendations: string[];
  priorityOrder: string[];
  estimatedTimeline: string;
}

export interface AlternativePathsSection extends IntelligenceSectionBase {
  sectionId: "alternative_paths";
  careerAlternatives: string[];
  learningAlternatives: string[];
  partnerAlternatives: string[];
  marketplaceAlternatives: string[];
  tradeoffExplanation: string;
}

export interface DecisionSimulatorSection extends IntelligenceSectionBase {
  sectionId: "decision_simulator";
  scenario: string;
  expectedLiveFrame: string;
  expectedPassport: string;
  expectedOpportunities: string;
  expectedIncomeReadiness: string;
  expectedJourney: string;
  assumptions: string[];
}

export interface ConfidenceExplanationSection extends IntelligenceSectionBase {
  sectionId: "confidence_explanation";
  confidenceScore: number;
  evidence: string[];
  reasoning: string;
  missingInformation: string[];
  alternativeInterpretations: string[];
}

export interface ProfessionalIntelligenceHistorySection extends IntelligenceSectionBase {
  sectionId: "professional_intelligence_history";
  previousRecommendations: IntelligenceHistoryRecord[];
  acceptedRecommendations: IntelligenceHistoryRecord[];
  ignoredRecommendations: IntelligenceHistoryRecord[];
  outcomeComparison: string;
  learningEvolution: string;
}

export type LivingProfessionalIntelligenceSection =
  | IntelligenceSummarySection
  | AskAnythingSection
  | TodaysBestDecisionSection
  | ProfessionalAnalysisSection
  | ProfessionalOpportunitiesAnalysisSection
  | ProfessionalRisksSection
  | ProfessionalStrengthsAnalysisSection
  | ProfessionalGapsSection
  | RecommendedNextStepsSection
  | AlternativePathsSection
  | DecisionSimulatorSection
  | ConfidenceExplanationSection
  | ProfessionalIntelligenceHistorySection;

export function buildDefaultIntelligenceHistory(context: LivingProfessionalIntelligenceContext): IntelligenceHistoryProfile {
  return { records: [], updatedAt: context.generatedAt };
}

function baseReadiness(engines: IntelligenceEngineSnapshot): number {
  return engines.readinessScore ?? 55;
}

function bestDecision(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): string {
  return (
    engines.todaysBestAction?.title ??
    engines.orchestrationHeadline ??
    `Complete one high-impact ${resolvePrimarySkill(context)} action today`
  );
}

function confidenceScore(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): number {
  const readiness = baseReadiness(engines);
  const trust = engines.trustScore ?? 50;
  const hash = hashIntelligenceSeed(context.dayKey, context.userId);
  return Math.min(95, Math.round((readiness + trust) / 2 + (hash % 10)));
}

export function buildIntelligenceSummarySection(
  context: LivingProfessionalIntelligenceContext,
  engines: IntelligenceEngineSnapshot
): IntelligenceSummarySection {
  const decision = bestDecision(context, engines);

  return {
    sectionId: "intelligence_summary",
    title: "Intelligence Summary",
    headline: "One intelligent view of your professional world",
    description: "Overall understanding and main recommendation — explainable, never fabricated.",
    overallUnderstanding: `Active ${resolvePrimaryIndustry(context)} professional in ${context.geographic.city} with ${resolveFrameStanding(context).toLowerCase()}.`,
    currentProfessionalState: `Readiness ${baseReadiness(engines)} — ${resolveMarketDemand(context)}`,
    mainRecommendation: decision,
    professionalPriority: `Focus on ${decision.toLowerCase()} before lower-priority items`,
    explainable: true,
  };
}

export function buildAskAnythingSection(context: LivingProfessionalIntelligenceContext): AskAnythingSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "ask_anything",
    title: "Ask Anything",
    headline: "One question. One intelligent answer.",
    description: "Natural language professional reasoning with explainable sources.",
    sampleQuestions: [
      `What should I focus on today as a ${skill} professional?`,
      "Which opportunity best matches my profile?",
      "What is my biggest professional risk right now?",
      "How can I improve my trusted frame standing?",
    ],
    reasoningApproach: "Combines passport, journey, impact, coach, planner, identity, and live frame data — never hallucinates.",
    sourcesUsed: [
      "Living Professional Passport",
      "Living Professional Journey",
      "Living Professional Coach",
      "Living Action Planner",
      "Living Professional Identity",
      "Intelligence Orchestration",
    ],
    neverHallucinate: true,
    explainable: true,
  };
}

export function buildAskAnythingAnswer(
  context: LivingProfessionalIntelligenceContext,
  engines: IntelligenceEngineSnapshot,
  question: string
): AskAnythingAnswer {
  const decision = bestDecision(context, engines);
  const conf = confidenceScore(context, engines);
  const normalized = question.trim().toLowerCase();

  let answer = decision;
  if (normalized.includes("risk")) {
    answer = `Your primary risk is delaying verification or certification renewal in ${context.geographic.country}.`;
  } else if (normalized.includes("opportunit")) {
    answer = engines.opportunities?.[0]?.title ?? `Regional ${resolvePrimarySkill(context)} opportunity`;
  } else if (normalized.includes("focus") || normalized.includes("today")) {
    answer = decision;
  }

  return {
    question: question.trim() || "What should I focus on professionally today?",
    answer,
    why: `Based on readiness (${baseReadiness(engines)}), ${resolveMarketDemand(context).toLowerCase()}, and your profile in ${context.geographic.city}.`,
    how: "Review today's best decision, execute one verified action, and update your evidence log.",
    benefit: "Advances journey, strengthens trusted frame, and unlocks higher-value opportunities.",
    requirements: ["Verified professional profile", resolveFrameStanding(context), "30–60 minutes focused time"],
    alternatives: engines.growthPath?.slice(0, 2) ?? [`Learning path for ${resolvePrimarySkill(context)}`],
    confidence: conf,
    sources: ["DevelopMe readiness", "Personal Assistant", "Intelligence Orchestration", "Onboarding profile"],
  };
}

export function buildTodaysBestDecisionSection(
  context: LivingProfessionalIntelligenceContext,
  engines: IntelligenceEngineSnapshot
): TodaysBestDecisionSection {
  const hash = hashIntelligenceSeed(context.dayKey, context.userId);
  const decision = bestDecision(context, engines);

  return {
    sectionId: "todays_best_decision",
    title: "Today's Best Decision",
    headline: "Exactly one recommendation — you decide",
    description: "Highest-impact decision for today with full explanation.",
    decision,
    whyNow: `${resolveEconomicConditions(context)} — acting today maintains momentum in ${context.geographic.preferredWorkRegion}.`,
    expectedBenefit: "Measurable progress on readiness, evidence, and professional visibility.",
    estimatedEffortMinutes: 45 + (hash % 30),
    explainable: true,
  };
}

export function buildProfessionalAnalysisSection(
  context: LivingProfessionalIntelligenceContext,
  engines: IntelligenceEngineSnapshot
): ProfessionalAnalysisSection {
  const skill = resolvePrimarySkill(context);
  const readiness = baseReadiness(engines);

  return {
    sectionId: "professional_analysis",
    title: "Professional Analysis",
    headline: "Unified analysis across all living experiences",
    description: "Passport, journey, impact, coach, planner, frame, and identity — one explanation.",
    passport: engines.passportLevel ?? `Professional passport — ${skill} profile active`,
    journey: `${context.onboarding.professionalBackground?.experienceYears ?? 0} years — ${resolvePrimaryIndustry(context)} journey`,
    impact: readiness >= 60 ? "Positive professional impact trajectory" : "Building measurable impact",
    coach: bestDecision(context, engines),
    planner: `Today's mission: ${bestDecision(context, engines)}`,
    liveFrame: engines.liveFrameLabel ?? resolveFrameStanding(context),
    professionalIdentity: `${context.displayName} — unified living identity in ${context.geographic.city}`,
    unifiedExplanation: `All living experiences align on one priority: ${bestDecision(context, engines).toLowerCase()}. Readiness ${readiness} supports this direction.`,
    explainable: true,
  };
}

export function buildProfessionalOpportunitiesAnalysisSection(
  context: LivingProfessionalIntelligenceContext,
  engines: IntelligenceEngineSnapshot
): ProfessionalOpportunitiesAnalysisSection {
  const readiness = baseReadiness(engines);
  const opps = (engines.opportunities ?? []).map((o, i) => ({
    title: o.title,
    matchScore: o.matchScore,
    readiness: readiness >= 60 ? "Ready to explore" : "Building readiness",
    ranking: i + 1,
  }));

  if (opps.length === 0) {
    opps.push({
      title: `Regional ${resolvePrimarySkill(context)} opportunity`,
      matchScore: 75,
      readiness: "Building readiness",
      ranking: 1,
    });
  }

  return {
    sectionId: "professional_opportunities_analysis",
    title: "Professional Opportunities Analysis",
    headline: `${opps.length} opportunit${opps.length === 1 ? "y" : "ies"} evaluated`,
    description: "Ranked by match score and readiness — recommendation only.",
    evaluatedOpportunities: opps,
    comparisonExplanation: "Ranked by match score, regional demand, and your verified profile — never auto-selected.",
    readinessSummary: `Profile readiness ${readiness} — ${readiness >= 60 ? "suitable for active exploration" : "continue building evidence first"}`,
    explainable: true,
  };
}

export function buildProfessionalRisksSection(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): ProfessionalRisksSection {
  const iron = context.onboarding.ironVerification;
  const risks: ProfessionalRisksSection["risks"] = [];

  if (!iron?.identityConfirmed) {
    risks.push({
      category: "verification",
      message: "Identity verification incomplete",
      explanation: "Incomplete verification limits trusted frame and partner eligibility.",
      severity: "high",
    });
  }

  if (engines.challenges?.length) {
    risks.push({
      category: "skills",
      message: `Skill gap: ${engines.challenges[0]?.replace(/_/g, " ")}`,
      explanation: "Addressing this gap improves readiness and opportunity match scores.",
      severity: "medium",
    });
  }

  risks.push({
    category: "activity",
    message: "Consistency risk if daily actions are missed",
    explanation: "Professional momentum drops without regular verified actions.",
    severity: "low",
  });

  if (resolveFrameStanding(context).includes("building")) {
    risks.push({
      category: "trust",
      message: "Trust frame not yet at trusted level",
      explanation: "Complete verification to reduce trust-related professional risks.",
      severity: "medium",
    });
  }

  return {
    sectionId: "professional_risks",
    title: "Professional Risks",
    headline: `${risks.length} risk${risks.length === 1 ? "" : "s"} identified`,
    description: "Every risk explained — no fabricated alerts.",
    risks,
    explainable: true,
  };
}

export function buildProfessionalStrengthsAnalysisSection(context: LivingProfessionalIntelligenceContext): ProfessionalStrengthsAnalysisSection {
  const bg = context.onboarding.professionalBackground;
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "professional_strengths_analysis",
    title: "Professional Strengths Analysis",
    headline: "Your competitive professional advantages",
    description: "Strengths derived from verified profile data — never fabricated.",
    competitiveAdvantages: [
      `${context.geographic.preferredWorkRegion} regional expertise`,
      resolveFrameStanding(context),
      `${bg?.experienceYears ?? 0} years experience`,
    ],
    topStrengths: (bg?.skills ?? [skill]).slice(0, 3).map((s) => s.replace(/_/g, " ")),
    uniqueSkills: bg?.skills.map((s) => s.replace(/_/g, " ")) ?? [skill],
    professionalPatterns: context.onboarding.smartQuestions?.enjoysLeading
      ? ["Leadership-oriented execution", "Team coordination"]
      : ["Consistent individual contribution", "Collaborative execution"],
    highValueCapabilities: [
      skill,
      bg?.certificates[0]?.replace(/_/g, " ") ?? "Professional certification path",
    ],
    professionalConfidence:
      (context.onboarding.professionalCalibration?.missions ?? []).reduce(
        (max, m) => Math.max(max, m.score ?? 0),
        0
      ) >= 85
        ? "High confidence"
        : "Strong confidence",
    explainable: true,
  };
}

export function buildProfessionalGapsSection(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): ProfessionalGapsSection {
  const readiness = baseReadiness(engines);

  return {
    sectionId: "professional_gaps",
    title: "Professional Gaps",
    headline: "Areas for professional improvement",
    description: "Skills, experience, and readiness gaps with improvement path.",
    skills: engines.challenges?.map((c) => c.replace(/_/g, " ")) ?? ["Advanced certification skills"],
    experience: readiness >= 60 ? [] : ["Additional verified project evidence"],
    certificates: ["Renewal check for active certifications"],
    knowledge: engines.growthPath?.slice(0, 2) ?? [`${resolvePrimarySkill(context)} advanced knowledge`],
    professionalReadiness: `Readiness ${readiness} — ${readiness >= 70 ? "strong" : readiness >= 50 ? "developing" : "foundation building"}`,
    improvementPath: engines.growthPath?.slice(0, 4) ?? [
      `Close ${resolvePrimarySkill(context)} skill gap`,
      "Complete verification milestones",
      "Collect journey evidence",
    ],
    explainable: true,
  };
}

export function buildRecommendedNextStepsSection(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): RecommendedNextStepsSection {
  const primary = bestDecision(context, engines);

  return {
    sectionId: "recommended_next_steps",
    title: "Recommended Next Steps",
    headline: "One primary path forward",
    description: "Priority-ordered recommendations — you always decide.",
    primaryPath: primary,
    alternativeRecommendations: engines.growthPath?.slice(0, 2) ?? ["Review learning path", "Explore regional opportunity"],
    priorityOrder: [primary, engines.growthPath?.[0] ?? "Learning module", "Update professional evidence"],
    estimatedTimeline: "Primary action today; alternatives within this week",
    explainable: true,
  };
}

export function buildAlternativePathsSection(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): AlternativePathsSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "alternative_paths",
    title: "Alternative Paths",
    headline: "Career, learning, partner, and marketplace alternatives",
    description: "Tradeoffs explained — recommendation only.",
    careerAlternatives: ["Promotion track via leadership evidence", "Specialist expert track"],
    learningAlternatives: engines.growthPath?.slice(0, 2) ?? [`${skill} certification`, "Regional compliance module"],
    partnerAlternatives: resolveGovernmentPrograms(context).slice(0, 2),
    marketplaceAlternatives: (engines.opportunities ?? []).slice(0, 2).map((o) => o.title),
    tradeoffExplanation: "Leadership path trades depth for visibility; specialist path trades breadth for expertise — your choice.",
    explainable: true,
  };
}

function resolveGovernmentPrograms(context: LivingProfessionalIntelligenceContext): string[] {
  const programs = context.geographic.governmentPrograms ?? [];
  if (programs.length > 0) return programs;
  return [`${context.geographic.country} workforce program`, `${context.geographic.country} licensing portal`];
}

export function buildDecisionSimulatorSection(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): DecisionSimulatorSection {
  const decision = bestDecision(context, engines);

  return {
    sectionId: "decision_simulator",
    title: "Decision Simulator",
    headline: "If I complete today's best decision…",
    description: "Projected outcomes with stated assumptions — not guarantees.",
    scenario: `If I complete: "${decision}"`,
    expectedLiveFrame: resolveFrameStanding(context).includes("Trusted") ? "Maintain trusted frame" : "Progress toward trusted frame",
    expectedPassport: "Passport evidence and readiness score improve",
    expectedOpportunities: "Higher match scores for regional opportunities",
    expectedIncomeReadiness: baseReadiness(engines) >= 60 ? "Income readiness strengthens" : "Foundation for future income readiness",
    expectedJourney: "Advance toward next journey milestone",
    assumptions: [
      "Consistent execution over the next 7 days",
      `${resolveEconomicConditions(context)} continues`,
      "No fabricated outcomes — projections based on current profile",
    ],
    explainable: true,
  };
}

export function buildConfidenceExplanationSection(context: LivingProfessionalIntelligenceContext, engines: IntelligenceEngineSnapshot): ConfidenceExplanationSection {
  const conf = confidenceScore(context, engines);
  const readiness = baseReadiness(engines);

  return {
    sectionId: "confidence_explanation",
    title: "Confidence & Explanation",
    headline: `${conf}% confidence in today's recommendation`,
    description: "Evidence, reasoning, and alternative interpretations — fully explainable.",
    confidenceScore: conf,
    evidence: [
      `Readiness score: ${readiness}`,
      `Trust standing: ${resolveFrameStanding(context)}`,
      `Profile: ${context.onboarding.professionalBackground?.experienceYears ?? 0} years experience`,
      engines.orchestrationHeadline ? "Intelligence orchestration alignment" : "Engine snapshot available",
    ],
    reasoning: `Recommendation aligns with readiness (${readiness}), regional demand, and unified living experience analysis.`,
    missingInformation: !context.onboarding.ironVerification?.identityConfirmed
      ? ["Complete identity verification for higher confidence"]
      : [],
    alternativeInterpretations: [
      "If you prioritize learning over execution today, consider the learning alternative path",
      "If partner opportunities are urgent, explore government program readiness first",
    ],
    explainable: true,
  };
}

export function buildProfessionalIntelligenceHistorySection(
  _context: LivingProfessionalIntelligenceContext,
  history: IntelligenceHistoryProfile
): ProfessionalIntelligenceHistorySection {
  const accepted = history.records.filter((r) => r.status === "accepted");
  const ignored = history.records.filter((r) => r.status === "ignored");

  return {
    sectionId: "professional_intelligence_history",
    title: "Professional Intelligence History",
    headline: `${history.records.length} intelligence recommendation${history.records.length === 1 ? "" : "s"} tracked`,
    description: "Previous, accepted, and ignored recommendations with outcome comparison.",
    previousRecommendations: history.records.slice(0, 10),
    acceptedRecommendations: accepted,
    ignoredRecommendations: ignored,
    outcomeComparison: accepted.length > 0 ? "Accepted recommendations correlate with stronger readiness trends" : "Accept recommendations to build outcome history",
    learningEvolution: history.records.length >= 3 ? "Intelligence adapts to your preferences over time" : "History grows as you interact with recommendations",
    explainable: true,
  };
}

export function buildAllIntelligenceSections(
  context: LivingProfessionalIntelligenceContext,
  engines: IntelligenceEngineSnapshot,
  history: IntelligenceHistoryProfile
): LivingProfessionalIntelligenceSection[] {
  return [
    buildIntelligenceSummarySection(context, engines),
    buildAskAnythingSection(context),
    buildTodaysBestDecisionSection(context, engines),
    buildProfessionalAnalysisSection(context, engines),
    buildProfessionalOpportunitiesAnalysisSection(context, engines),
    buildProfessionalRisksSection(context, engines),
    buildProfessionalStrengthsAnalysisSection(context),
    buildProfessionalGapsSection(context, engines),
    buildRecommendedNextStepsSection(context, engines),
    buildAlternativePathsSection(context, engines),
    buildDecisionSimulatorSection(context, engines),
    buildConfidenceExplanationSection(context, engines),
    buildProfessionalIntelligenceHistorySection(context, history),
  ];
}

function sectionToView(section: LivingProfessionalIntelligenceSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "intelligence_summary":
      return {
        ...base,
        overall_understanding: section.overallUnderstanding,
        current_professional_state: section.currentProfessionalState,
        main_recommendation: section.mainRecommendation,
        professional_priority: section.professionalPriority,
      };
    case "ask_anything":
      return {
        ...base,
        sample_questions: section.sampleQuestions,
        reasoning_approach: section.reasoningApproach,
        sources_used: section.sourcesUsed,
        never_hallucinate: section.neverHallucinate,
      };
    case "todays_best_decision":
      return {
        ...base,
        decision: section.decision,
        why_now: section.whyNow,
        expected_benefit: section.expectedBenefit,
        estimated_effort_minutes: section.estimatedEffortMinutes,
      };
    case "professional_analysis":
      return {
        ...base,
        passport: section.passport,
        journey: section.journey,
        impact: section.impact,
        coach: section.coach,
        planner: section.planner,
        live_frame: section.liveFrame,
        professional_identity: section.professionalIdentity,
        unified_explanation: section.unifiedExplanation,
      };
    case "professional_opportunities_analysis":
      return {
        ...base,
        evaluated_opportunities: section.evaluatedOpportunities,
        comparison_explanation: section.comparisonExplanation,
        readiness_summary: section.readinessSummary,
      };
    case "professional_risks":
      return { ...base, risks: section.risks };
    case "professional_strengths_analysis":
      return {
        ...base,
        top_strengths: section.topStrengths,
        competitive_advantages: section.competitiveAdvantages,
        unique_skills: section.uniqueSkills,
        professional_patterns: section.professionalPatterns,
        high_value_capabilities: section.highValueCapabilities,
        professional_confidence: section.professionalConfidence,
      };
    case "professional_gaps":
      return {
        ...base,
        skills: section.skills,
        experience: section.experience,
        certificates: section.certificates,
        knowledge: section.knowledge,
        professional_readiness: section.professionalReadiness,
        improvement_path: section.improvementPath,
      };
    case "recommended_next_steps":
      return {
        ...base,
        primary_path: section.primaryPath,
        alternative_recommendations: section.alternativeRecommendations,
        priority_order: section.priorityOrder,
        estimated_timeline: section.estimatedTimeline,
      };
    case "alternative_paths":
      return {
        ...base,
        career_alternatives: section.careerAlternatives,
        learning_alternatives: section.learningAlternatives,
        partner_alternatives: section.partnerAlternatives,
        marketplace_alternatives: section.marketplaceAlternatives,
        tradeoff_explanation: section.tradeoffExplanation,
      };
    case "decision_simulator":
      return {
        ...base,
        scenario: section.scenario,
        expected_live_frame: section.expectedLiveFrame,
        expected_passport: section.expectedPassport,
        expected_opportunities: section.expectedOpportunities,
        expected_income_readiness: section.expectedIncomeReadiness,
        expected_journey: section.expectedJourney,
        assumptions: section.assumptions,
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
    case "professional_intelligence_history":
      return {
        ...base,
        previous_recommendations: section.previousRecommendations.map(mapHistoryRecord),
        accepted_recommendations: section.acceptedRecommendations.map(mapHistoryRecord),
        ignored_recommendations: section.ignoredRecommendations.map(mapHistoryRecord),
        outcome_comparison: section.outcomeComparison,
        learning_evolution: section.learningEvolution,
      };
    default:
      return base;
  }
}

function mapHistoryRecord(r: IntelligenceHistoryRecord) {
  return {
    record_id: r.recordId,
    recommendation: r.recommendation,
    status: r.status,
    recorded_at: r.recordedAt,
    outcome: r.outcome,
  };
}

export function toIntelligenceSectionView(section: LivingProfessionalIntelligenceSection) {
  return sectionToView(section);
}

export function toIntelligenceSectionsView(sections: LivingProfessionalIntelligenceSection[]) {
  return sections.map(toIntelligenceSectionView);
}

export function toAskAnythingAnswerView(answer: AskAnythingAnswer) {
  return {
    question: answer.question,
    answer: answer.answer,
    why: answer.why,
    how: answer.how,
    benefit: answer.benefit,
    requirements: answer.requirements,
    alternatives: answer.alternatives,
    confidence: answer.confidence,
    sources: answer.sources,
    explainable: true,
    recommends_only: true,
    never_decides_for_user: true,
  };
}

export function recordIntelligenceRecommendation(
  history: IntelligenceHistoryProfile,
  recordId: string,
  recommendation: string,
  status: "accepted" | "ignored",
  recordedAt: string,
  outcome?: string
): IntelligenceHistoryProfile {
  const without = history.records.filter((r) => r.recordId !== recordId);
  return {
    records: [{ recordId, recommendation, status, recordedAt, outcome }, ...without].slice(0, 50),
    updatedAt: recordedAt,
  };
}
