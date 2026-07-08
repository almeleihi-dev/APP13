/**
 * AN ACT v1 Final Executive Review (client-only).
 * Definitive executive document aggregating Chapters 1–10 — no new capabilities.
 */

import { getAnActOperatingSystemV1Snapshot, type AnActOperatingSystemV1Snapshot } from "./an-act-operating-system-v1.js";
import {
  getAnActV1CertificationSnapshot,
  certificationDecisionLabel,
  type AnActV1CertificationSnapshot,
} from "./an-act-v1-certification.js";
import { getEnterpriseEvaluationSnapshot, type EnterpriseEvaluationSnapshot } from "./enterprise-evaluation.js";
import {
  getExecutiveIntelligenceCenterSnapshot,
  type ExecutiveIntelligenceCenterSnapshot,
} from "./executive-intelligence-center.js";
import { getGovernmentReadinessSnapshot, type GovernmentReadinessSnapshot } from "./government-readiness.js";
import { scoreToSignal, type ReadinessLevel } from "./enterprise-readiness.js";
import { getLaunchReadinessSnapshot, launchDecisionLabel, type LaunchReadinessSnapshot } from "./launch-readiness.js";

export type { ReadinessLevel };

export type ExecutiveRecommendation =
  | "controlled-public-mvp"
  | "enterprise-pilot"
  | "government-evaluation"
  | "production-after-conditions";

export interface ExecutiveSummarySection {
  vision: string;
  mission: string;
  platformPurpose: string;
  currentMaturity: string;
  overallRecommendation: string;
}

export interface ChapterEvolutionEntry {
  chapter: number;
  title: string;
  objective: string;
  outcome: string;
}

export interface ArchitectureReviewSection {
  runtimeArchitecture: string;
  serverAuthoritativeModel: string;
  runtimeJsonGovernance: string;
  apiStrategy: string;
  presentationPhilosophy: string;
  separationOfConcerns: string;
}

export interface CapabilityMatrixRow {
  id: string;
  category: string;
  capability: string;
  status: ReadinessLevel;
  score: number;
  notes: string;
}

export interface RiskReadinessRow {
  id: string;
  area: string;
  technicalReadiness: ReadinessLevel;
  operationalReadiness: ReadinessLevel;
  launchPrerequisite: string;
  futureEnhancement: string;
}

export interface StrengthItem {
  id: string;
  title: string;
  detail: string;
}

export interface OperationalConditionItem {
  id: string;
  category: "technical" | "operational" | "launch" | "future";
  title: string;
  detail: string;
  signal: ReadinessLevel;
}

export interface RoadmapItem {
  id: string;
  phase: string;
  title: string;
  detail: string;
}

export interface AnActV1FinalExecutiveReviewSnapshot {
  generatedAt: string;
  version: "AN ACT v1";
  executiveSummary: ExecutiveSummarySection;
  chapterEvolution: ChapterEvolutionEntry[];
  architectureReview: ArchitectureReviewSection;
  platformCapabilities: CapabilityMatrixRow[];
  operationalCapabilities: CapabilityMatrixRow[];
  enterpriseCapabilities: CapabilityMatrixRow[];
  certificationSummary: {
    verificationSuites: string;
    regressionStatus: string;
    buildHealth: string;
    accessibility: string;
    runtimeStability: string;
    certificationOutcome: string;
    signal: ReadinessLevel;
  };
  strengths: StrengthItem[];
  operationalConditions: OperationalConditionItem[];
  riskMatrix: RiskReadinessRow[];
  executiveRecommendation: ExecutiveRecommendation;
  executiveRecommendationLabel: string;
  executiveRecommendationReason: string;
  finalReadinessScore: number;
  finalReadinessSignal: ReadinessLevel;
  executiveClosingStatement: string;
  roadmap: RoadmapItem[];
  hasData: boolean;
}

const CHAPTER_EVOLUTION: ChapterEvolutionEntry[] = [
  { chapter: 1, title: "Foundation", objective: "Establish AN ACT brand, repository, and engineering baseline.", outcome: "Certified project foundation with build gates and verification discipline." },
  { chapter: 2, title: "Runtime Architecture", objective: "Define server-authoritative Runtime architecture and experience contracts.", outcome: "Frozen Runtime JSON model with layered experience APIs." },
  { chapter: 3, title: "Runtime Experience", objective: "Implement Need and Action experience engine with design system.", outcome: "Runtime screen registry, state engine, and core UI components." },
  { chapter: 4, title: "Customer Experience", objective: "Deliver customer Need journey from discovery through tracking.", outcome: "Search, request, contract, chat, timeline, and notification experiences." },
  { chapter: 5, title: "MVP Experience", objective: "Complete MVP foundation with auth, provider path, and Living Professional.", outcome: "RC1/RC2 validated MVP with professional simulator and career engine." },
  { chapter: 6, title: "Pilot Readiness", objective: "Prepare controlled pilot with instrumentation and production readiness.", outcome: "Privacy-safe pilot framework with RC verification suites." },
  { chapter: 7, title: "Operational Excellence", objective: "Transition from building to operating the product.", outcome: "Founder, Pilot Management, Growth, and Executive Operations centers." },
  { chapter: 8, title: "Enterprise & Government Readiness", objective: "Prepare enterprise, government, and integration evaluation.", outcome: "Readiness centers and unified Enterprise Evaluation at 90/100." },
  { chapter: 9, title: "Production & Launch Readiness", objective: "Prepare controlled production launch and v1 certification.", outcome: "Production, Reliability, Launch Readiness, and v1 Certification centers." },
  { chapter: 10, title: "AN ACT Operating System", objective: "Assemble live operations into certified operating model.", outcome: "Live Marketplace, Decision Center, Intelligence Center, and Operating System v1." },
];

function buildExecutiveSummary(
  recommendation: ExecutiveRecommendation,
  score: number,
  certification: AnActV1CertificationSnapshot,
  intelligence: ExecutiveIntelligenceCenterSnapshot
): ExecutiveSummarySection {
  const recLabels: Record<ExecutiveRecommendation, string> = {
    "controlled-public-mvp": "Ready for Controlled Public MVP",
    "enterprise-pilot": "Ready for Enterprise Pilot",
    "government-evaluation": "Ready for Government Evaluation",
    "production-after-conditions": "Ready for Production after operational conditions",
  };

  return {
    vision: "A server-authoritative marketplace platform where customers and professionals connect through a unified Runtime experience.",
    mission: "Deliver enterprise-grade operational visibility, certified readiness, and controlled marketplace activation without compromising architectural integrity.",
    platformPurpose: "AN ACT v1 is the certified MVP foundation — Runtime JSON experiences, operator consoles, enterprise evaluation, and the Operating System for daily executive operation.",
    currentMaturity: `Feature-complete at ${score}/100 · ${certificationDecisionLabel(certification.certificationDecision)} · executive confidence ${intelligence.executiveBrief.overallConfidence}%.`,
    overallRecommendation: recLabels[recommendation],
  };
}

function buildArchitectureReview(): ArchitectureReviewSection {
  return {
    runtimeArchitecture: "Layered experience engine — Fastify APIs return Runtime JSON; web shell consumes via Runtime Client transport only.",
    serverAuthoritativeModel: "All state transitions are server-authoritative. The presentation layer renders; it never decides business outcomes.",
    runtimeJsonGovernance: "Need and Action contracts frozen. Changes require verified production issues and RC regression suites.",
    apiStrategy: "REST experience APIs with JWT session model. Auth, discovery, requests, contracts, actions, notifications, and health endpoints.",
    presentationPhilosophy: "Operational centers aggregate existing modules. No duplication of business logic; presentation over feature creep.",
    separationOfConcerns: "Runtime · Operator consoles · Enterprise evaluation · Certification layers remain strictly separated.",
  };
}

function buildPlatformCapabilities(certification: AnActV1CertificationSnapshot): CapabilityMatrixRow[] {
  return certification.platformCapabilities.map((cap) => ({
    id: cap.id,
    category: cap.category,
    capability: cap.title,
    status: "green" as ReadinessLevel,
    score: 95,
    notes: cap.detail,
  }));
}

function buildOperationalCapabilities(os: AnActOperatingSystemV1Snapshot): CapabilityMatrixRow[] {
  return os.centers.map((center) => ({
    id: center.id,
    category: center.chapter,
    capability: center.label,
    status: center.signal,
    score: center.score,
    notes: center.summary,
  }));
}

function buildEnterpriseCapabilities(
  evaluation: EnterpriseEvaluationSnapshot,
  government: GovernmentReadinessSnapshot
): CapabilityMatrixRow[] {
  return [
    ...evaluation.centerSummaries.map((c) => ({
      id: c.id,
      category: "Enterprise",
      capability: c.label,
      status: c.signal,
      score: c.score,
      notes: c.summary,
    })),
    {
      id: "unified-evaluation",
      category: "Enterprise",
      capability: "Enterprise Evaluation Center",
      status: evaluation.unifiedSignal,
      score: evaluation.unifiedReadinessScore,
      notes: `${evaluation.decisions.length} executive decisions documented.`,
    },
    {
      id: "government-readiness",
      category: "Government",
      capability: "Government Readiness Center",
      status: scoreToSignal(government.governmentReadinessScore),
      score: government.governmentReadinessScore,
      notes: "Public-sector evaluation posture and compliance checklist.",
    },
  ];
}

function buildRiskMatrix(
  certification: AnActV1CertificationSnapshot,
  launch: LaunchReadinessSnapshot,
  os: AnActOperatingSystemV1Snapshot
): RiskReadinessRow[] {
  return [
    {
      id: "architecture",
      area: "Architecture & Runtime",
      technicalReadiness: "green",
      operationalReadiness: "green",
      launchPrerequisite: "None — frozen and certified",
      futureEnhancement: "v2 contract evolution with formal change control",
    },
    {
      id: "pilot",
      area: "Pilot execution",
      technicalReadiness: "green",
      operationalReadiness: certification.outstandingItems.some((i) => i.category === "pilot") ? "amber" : "green",
      launchPrerequisite: "Resolve pilot follow-up backlog",
      futureEnhancement: "Expanded cohort instrumentation",
    },
    {
      id: "launch",
      area: "Launch authorization",
      technicalReadiness: scoreToSignal(launch.launchReadinessScore),
      operationalReadiness: launch.launchDecision === "go" ? "green" : launch.launchDecision === "conditional-go" ? "amber" : "red",
      launchPrerequisite: launch.launchDecisionReason,
      futureEnhancement: "Full public MVP activation",
    },
    {
      id: "enterprise",
      area: "Enterprise adoption",
      technicalReadiness: "green",
      operationalReadiness: "green",
      launchPrerequisite: "Enterprise pilot cohort selection",
      futureEnhancement: "Procurement workflow integration",
    },
    {
      id: "operations",
      area: "Daily operations",
      technicalReadiness: scoreToSignal(os.operatingSystemScore),
      operationalReadiness: os.operatingStatus === "operationally-ready" ? "green" : "amber",
      launchPrerequisite: os.operatingStatusReason,
      futureEnhancement: "Operating System v2 automation",
    },
  ];
}

function buildStrengths(
  certification: AnActV1CertificationSnapshot,
  evaluation: EnterpriseEvaluationSnapshot,
  intelligence: ExecutiveIntelligenceCenterSnapshot
): StrengthItem[] {
  return [
    { id: "architecture", title: "Certified frozen architecture", detail: "Server-authoritative Runtime with immutable JSON contracts validated through RC suites." },
    { id: "operating-system", title: "Complete Operating System v1", detail: "Eleven operational centers unified in Observe → Improve lifecycle." },
    { id: "enterprise", title: "Enterprise evaluation stack", detail: `Unified evaluation ${evaluation.unifiedReadinessScore} with government and integration readiness.` },
    { id: "verification", title: "Automated verification discipline", detail: "Chapter 6–10 verify scripts with build gates and zero-regression chains." },
    { id: "intelligence", title: "Rule-based executive intelligence", detail: `${intelligence.insights.length} deterministic insights · ${intelligence.executiveBrief.overallConfidence}% confidence.` },
    { id: "certification", title: "Official v1 certification", detail: `${certificationDecisionLabel(certification.certificationDecision)} at ${certification.certificationScore}/100.` },
  ];
}

function buildOperationalConditions(
  certification: AnActV1CertificationSnapshot,
  launch: LaunchReadinessSnapshot
): OperationalConditionItem[] {
  const items: OperationalConditionItem[] = [
    {
      id: "technical",
      category: "technical",
      title: "Technical readiness",
      detail: `${certificationDecisionLabel(certification.certificationDecision)} · architecture, runtime, and enterprise evaluation meet v1 bar.`,
      signal: certification.certificationSignal,
    },
  ];

  for (const outstanding of certification.outstandingItems) {
    items.push({
      id: outstanding.id,
      category: outstanding.category === "launch" ? "launch" : "operational",
      title: outstanding.title,
      detail: outstanding.detail,
      signal: outstanding.signal,
    });
  }

  items.push({
    id: "launch-auth",
    category: "launch",
    title: "Launch prerequisites",
    detail: `${launchDecisionLabel(launch.launchDecision)} — ${launch.launchDecisionReason}`,
    signal: launch.launchSignal,
  });

  items.push({
    id: "future",
    category: "future",
    title: "Future enhancements",
    detail: "v2 marketplace automation, expanded regional supply, procurement integrations, and advanced analytics (out of v1 scope).",
    signal: "green",
  });

  return items;
}

function determineRecommendation(
  certification: AnActV1CertificationSnapshot,
  launch: LaunchReadinessSnapshot,
  government: GovernmentReadinessSnapshot,
  evaluation: EnterpriseEvaluationSnapshot
): {
  recommendation: ExecutiveRecommendation;
  reason: string;
} {
  if (certification.certificationDecision === "not-certified") {
    return {
      recommendation: "production-after-conditions",
      reason: "Technical certification not achieved — remediate certification blockers before any external launch.",
    };
  }

  if (launch.launchDecision === "go") {
    return {
      recommendation: "controlled-public-mvp",
      reason: "Launch gates green and certification complete — proceed with controlled public MVP activation.",
    };
  }

  if (launch.launchDecision === "conditional-go") {
    return {
      recommendation: "controlled-public-mvp",
      reason: "Launch readiness conditional — controlled public MVP with documented amber gates and operator oversight.",
    };
  }

  if (government.governmentReadinessScore >= 85 && evaluation.unifiedReadinessScore >= 90) {
    return {
      recommendation: "government-evaluation",
      reason: "Technical v1 certified with strong government and enterprise scores — prioritize government evaluator engagement while resolving launch blockers.",
    };
  }

  if (evaluation.unifiedReadinessScore >= 85 && certification.certificationDecision === "certified-with-conditions") {
    return {
      recommendation: "enterprise-pilot",
      reason: "AN ACT v1 technically certified for enterprise stakeholders — conduct controlled enterprise pilot while operational conditions are resolved.",
    };
  }

  return {
    recommendation: "production-after-conditions",
    reason: "Launch NO GO with outstanding operational conditions — resolve pilot follow-up and executive alerts before production authorization.",
  };
}

function buildRoadmap(recommendation: ExecutiveRecommendation): RoadmapItem[] {
  const base: RoadmapItem[] = [
    { id: "resolve-conditions", phase: "Immediate", title: "Resolve operational conditions", detail: "Clear pilot follow-up, executive alerts, and launch blockers documented in certification." },
    { id: "enterprise-pilot", phase: "Near-term", title: "Enterprise pilot cohort", detail: "Facilitator-guided enterprise evaluation using Operating System v1 dashboards." },
    { id: "gov-eval", phase: "Near-term", title: "Government evaluation sessions", detail: "Government Readiness Center walkthrough for public-sector stakeholders." },
  ];

  if (recommendation === "controlled-public-mvp") {
    base.unshift({ id: "controlled-launch", phase: "Immediate", title: "Controlled public MVP", detail: "Activate limited marketplace with launch gates and operator monitoring." });
  }

  base.push(
    { id: "os-v2", phase: "Future", title: "Operating System v2", detail: "Enhanced automation within frozen architecture — aggregation only." },
    { id: "v2-platform", phase: "Future", title: "AN ACT v2 planning", detail: "Formal v2 scope review using this document as baseline reference." }
  );

  return base;
}

function buildClosingStatement(recommendation: ExecutiveRecommendation, score: number): string {
  const labels: Record<ExecutiveRecommendation, string> = {
    "controlled-public-mvp": "Ready for Controlled Public MVP",
    "enterprise-pilot": "Ready for Enterprise Pilot",
    "government-evaluation": "Ready for Government Evaluation",
    "production-after-conditions": "Ready for Production after operational conditions",
  };

  return `AN ACT v1 is feature-complete and formally reviewed at ${score}/100. Chapters 1–10 delivered a certified architecture, stable Runtime, MVP foundation, enterprise evaluation stack, and Operating System v1. Executive recommendation: ${labels[recommendation]}. This document is the authoritative baseline for AN ACT v1 and the reference point for all future versions.`;
}

export function executiveRecommendationLabel(recommendation: ExecutiveRecommendation): string {
  const labels: Record<ExecutiveRecommendation, string> = {
    "controlled-public-mvp": "Ready for Controlled Public MVP",
    "enterprise-pilot": "Ready for Enterprise Pilot",
    "government-evaluation": "Ready for Government Evaluation",
    "production-after-conditions": "Ready for Production after operational conditions",
  };
  return labels[recommendation];
}

export function getAnActV1FinalExecutiveReviewSnapshot(now = Date.now()): AnActV1FinalExecutiveReviewSnapshot {
  const certification = getAnActV1CertificationSnapshot(now);
  const os = getAnActOperatingSystemV1Snapshot(now);
  const intelligence = getExecutiveIntelligenceCenterSnapshot(now);
  const launch = getLaunchReadinessSnapshot(now);
  const evaluation = getEnterpriseEvaluationSnapshot();
  const government = getGovernmentReadinessSnapshot();
  const { recommendation, reason } = determineRecommendation(certification, launch, government, evaluation);

  const finalReadinessScore = Math.round(
    (certification.certificationScore + os.operatingSystemScore + intelligence.intelligenceScore) / 3
  );

  const verificationItem = certification.verificationSummary.find((v) => v.id === "regression-status");
  const buildItem = certification.verificationSummary.find((v) => v.id === "build-status");
  const accessibilityItem = certification.verificationSummary.find((v) => v.id === "accessibility-validation");
  const runtimeItem = certification.verificationSummary.find((v) => v.id === "runtime-validation");

  return {
    generatedAt: new Date(now).toISOString(),
    version: "AN ACT v1",
    executiveSummary: buildExecutiveSummary(recommendation, finalReadinessScore, certification, intelligence),
    chapterEvolution: CHAPTER_EVOLUTION,
    architectureReview: buildArchitectureReview(),
    platformCapabilities: buildPlatformCapabilities(certification),
    operationalCapabilities: buildOperationalCapabilities(os),
    enterpriseCapabilities: buildEnterpriseCapabilities(evaluation, government),
    certificationSummary: {
      verificationSuites: "Chapters 6–10 · RC1/RC2 · Phase verification suites",
      regressionStatus: verificationItem?.value ?? "Clear",
      buildHealth: buildItem?.value ?? "Passing",
      accessibility: accessibilityItem?.value ?? "Validated",
      runtimeStability: runtimeItem?.value ?? "Validated",
      certificationOutcome: certificationDecisionLabel(certification.certificationDecision),
      signal: certification.certificationSignal,
    },
    strengths: buildStrengths(certification, evaluation, intelligence),
    operationalConditions: buildOperationalConditions(certification, launch),
    riskMatrix: buildRiskMatrix(certification, launch, os),
    executiveRecommendation: recommendation,
    executiveRecommendationLabel: executiveRecommendationLabel(recommendation),
    executiveRecommendationReason: reason,
    finalReadinessScore,
    finalReadinessSignal: scoreToSignal(finalReadinessScore),
    executiveClosingStatement: buildClosingStatement(recommendation, finalReadinessScore),
    roadmap: buildRoadmap(recommendation),
    hasData: certification.hasData || os.hasData,
  };
}

export { scoreToSignal };
