import { buildBrowserExperienceCompletenessSnapshot } from "../../browser-experience-completeness/domain/browser-experience-completeness.js";
import { buildExecutiveUxReadinessSnapshot } from "../../executive-ux-readiness/domain/executive-ux-readiness.js";
import {
  buildOperatorExperienceIntegritySnapshot,
  type OperatorExperienceIntegrityRawSnapshot,
  type OperatorExperienceIntegritySnapshot,
} from "../../operator-experience-integrity/domain/operator-experience-integrity.js";
import { buildOperatorSurfaceNavigationSnapshot } from "../../operator-surface-navigation/domain/operator-surface-navigation.js";

export type OnboardingReadinessStatus = "onboarding_ready" | "developing" | "blocked";
export type RemediationPriority = "blocker" | "warning" | "info";
export type RecommendationHorizon = "immediate" | "pre_onboarding" | "post_onboarding";
export type ChecklistStatus = "pass" | "fail";
export type VerificationExecutionStatus = "ready" | "attention_required";

export interface OperatorOnboardingReadinessSources {
  packageSource: string;
  existingPaths: Set<string>;
  verifyScriptSources: Record<string, string>;
}

export interface OperatorOnboardingReadinessRawSnapshot {
  integrityRaw: OperatorExperienceIntegrityRawSnapshot;
  sources: OperatorOnboardingReadinessSources;
}

export interface OnboardingOverview {
  headline: string;
  onboardingScore: number;
  status: OnboardingReadinessStatus;
  blockerCount: number;
  warningCount: number;
  checklistPassedCount: number;
  checklistTotalCount: number;
  remediationQueueCount: number;
  summary: string;
}

export interface OnboardingBlocker {
  code: string;
  title: string;
  source: string;
  reason: string;
  action: string;
}

export interface BlockerRegister {
  blockers: OnboardingBlocker[];
  summary: string;
}

export interface OnboardingWarning {
  code: string;
  title: string;
  source: string;
  reason: string;
  action: string;
}

export interface WarningRegister {
  warnings: OnboardingWarning[];
  summary: string;
}

export interface RemediationQueueEntry {
  id: string;
  source: string;
  priority: RemediationPriority;
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface RemediationQueue {
  entries: RemediationQueueEntry[];
  blockerCount: number;
  warningCount: number;
  summary: string;
}

export interface OnboardingChecklistSpec {
  code: string;
  label: string;
  source: string;
}

export interface OnboardingChecklistEntry {
  code: string;
  label: string;
  source: string;
  status: ChecklistStatus;
  rationale: string;
}

export interface OnboardingChecklist {
  entries: OnboardingChecklistEntry[];
  passedCount: number;
  totalCount: number;
  completionScore: number;
  summary: string;
}

export interface XStackReadinessEntry {
  layer: string;
  label: string;
  score: number;
  status: string;
  ready: boolean;
}

export interface XStackReadinessMatrix {
  entries: XStackReadinessEntry[];
  allReady: boolean;
  summary: string;
}

export interface OnboardingVerificationChainEntry {
  chain: string;
  exists: boolean;
  chainedCorrectly: boolean;
  executionStatus: VerificationExecutionStatus;
  summary: string;
}

export interface OnboardingVerificationChainAudit {
  chains: OnboardingVerificationChainEntry[];
  summary: string;
}

export interface OnboardingRecommendation {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface OnboardingRecommendations {
  immediate: OnboardingRecommendation[];
  preOnboarding: OnboardingRecommendation[];
  postOnboarding: OnboardingRecommendation[];
  summary: string;
}

export interface OnboardingReadinessScore {
  score: number;
  status: OnboardingReadinessStatus;
  blockerClearanceWeight: number;
  xStackReadinessWeight: number;
  checklistWeight: number;
  remediationSeverityWeight: number;
  verificationChainWeight: number;
  summary: string;
}

export interface OperatorOnboardingReadinessSnapshot {
  overview: OnboardingOverview;
  blockers: BlockerRegister;
  warnings: WarningRegister;
  remediationQueue: RemediationQueue;
  checklist: OnboardingChecklist;
  xStackReadiness: XStackReadinessMatrix;
  verificationChain: OnboardingVerificationChainAudit;
  recommendations: OnboardingRecommendations;
  onboardingScore: OnboardingReadinessScore;
  generatedAt: Date;
}

export interface OperatorOnboardingReadinessCenter {
  overview: OnboardingOverview;
  blockers: BlockerRegister;
  warnings: WarningRegister;
  remediationQueue: RemediationQueue;
  checklist: OnboardingChecklist;
  xStackReadiness: XStackReadinessMatrix;
  verificationChain: OnboardingVerificationChainAudit;
  recommendations: OnboardingRecommendations;
  onboardingScore: OnboardingReadinessScore;
  generatedAt: Date;
}

export const OPERATOR_ONBOARDING_READINESS_ROUTES = [
  "/operator-onboarding-readiness",
  "/operator-onboarding-readiness/overview",
  "/operator-onboarding-readiness/blockers",
  "/operator-onboarding-readiness/warnings",
  "/operator-onboarding-readiness/remediation-queue",
  "/operator-onboarding-readiness/checklist",
  "/operator-onboarding-readiness/x-stack-readiness",
  "/operator-onboarding-readiness/verification",
  "/operator-onboarding-readiness/recommendations",
  "/operator-onboarding-readiness/score",
] as const;

export const ONBOARDING_VERIFICATION_CHAIN_SPECS = [
  { chain: "verify:x31", script: "scripts/verify-x31.sh", previous: "verify:x30", packageScript: "verify:x31" },
  { chain: "verify:x32", script: "scripts/verify-x32.sh", previous: "verify:x31", packageScript: "verify:x32" },
  { chain: "verify:x33", script: "scripts/verify-x33.sh", previous: "verify:x32", packageScript: "verify:x33" },
  { chain: "verify:x34", script: "scripts/verify-x34.sh", previous: "verify:x33", packageScript: "verify:x34" },
  { chain: "verify:x35", script: "scripts/verify-x35.sh", previous: "verify:x34", packageScript: "verify:x35" },
  { chain: "verify:x36", script: "scripts/verify-x36.sh", previous: "verify:x35", packageScript: "verify:x36" },
  { chain: "verify:x37", script: "scripts/verify-x37.sh", previous: "verify:x36", packageScript: "verify:x37" },
  { chain: "verify:x38", script: "scripts/verify-x38.sh", previous: "verify:x37", packageScript: "verify:x38" },
  { chain: "verify:x39", script: "scripts/verify-x39.sh", previous: "verify:x38", packageScript: "verify:x39" },
];

export const ONBOARDING_CHECKLIST_SPECS: OnboardingChecklistSpec[] = [
  { code: "x31_browser_ready", label: "X31 browser_ready tier achieved", source: "X31" },
  { code: "x36_browser_complete", label: "X36 browser stack complete", source: "X36" },
  { code: "x37_journeys_ready", label: "X37 operator journeys fully reachable", source: "X37" },
  { code: "x38_no_hybrid_conflicts", label: "No hybrid auth boundary conflicts", source: "X38" },
  { code: "x38_disclosure_adequate", label: "Browser fixture disclosure adequate", source: "X38" },
  { code: "x38_workflow_parity", label: "Workflow parity pairs satisfied", source: "X38" },
  { code: "verification_chain", label: "verify:x31–x39 chain ready", source: "X39" },
  { code: "operator_dashboard", label: "Operator dashboard browser route registered", source: "X32" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildOnboardingVerificationChainAudit(
  sources: OperatorOnboardingReadinessSources
): OnboardingVerificationChainAudit {
  const chains = ONBOARDING_VERIFICATION_CHAIN_SPECS.map((spec) => {
    const exists = sources.existingPaths.has(spec.script);
    const scriptSource = sources.verifyScriptSources[spec.script] ?? "";
    const chainedCorrectly = exists && scriptSource.includes(spec.previous);
    const packageReady = sources.packageSource.includes(`"${spec.packageScript}"`);
    const executionStatus: VerificationExecutionStatus =
      exists && chainedCorrectly && packageReady ? "ready" : "attention_required";

    return {
      chain: spec.chain,
      exists,
      chainedCorrectly,
      executionStatus,
      summary: `${spec.chain} ${executionStatus === "ready" ? "chains correctly" : "requires attention"}.`,
    };
  });

  return {
    chains,
    summary: `Onboarding verification chain audit reviewed ${chains.length} verify scripts from verify:x31 through verify:x39.`,
  };
}

export function buildXStackReadinessMatrix(input: {
  integritySnapshot: OperatorExperienceIntegritySnapshot;
  uxSnapshot: ReturnType<typeof buildExecutiveUxReadinessSnapshot>;
  browserSnapshot: ReturnType<typeof buildBrowserExperienceCompletenessSnapshot>;
  navigationSnapshot: ReturnType<typeof buildOperatorSurfaceNavigationSnapshot>;
}): XStackReadinessMatrix {
  const entries: XStackReadinessEntry[] = [
    {
      layer: "X31",
      label: "Executive UX Readiness",
      score: input.uxSnapshot.readinessScore.score,
      status: input.uxSnapshot.classification.highestAchievedTier,
      ready: input.uxSnapshot.classification.browserReady.ready,
    },
    {
      layer: "X36",
      label: "Browser Experience Completeness",
      score: input.browserSnapshot.completenessScore.score,
      status: input.browserSnapshot.completenessScore.status,
      ready: input.browserSnapshot.completenessScore.status === "browser_complete",
    },
    {
      layer: "X37",
      label: "Operator Surface Navigation",
      score: input.navigationSnapshot.navigationScore.score,
      status: input.navigationSnapshot.navigationScore.status,
      ready: input.navigationSnapshot.navigationScore.status !== "attention_required",
    },
    {
      layer: "X38",
      label: "Operator Experience Integrity",
      score: input.integritySnapshot.integrityScore.score,
      status: input.integritySnapshot.integrityScore.status,
      ready: input.integritySnapshot.integrityScore.status !== "attention_required",
    },
  ];

  return {
    entries,
    allReady: entries.every((entry) => entry.ready),
    summary: `X-stack readiness matrix: ${entries.filter((entry) => entry.ready).length}/${entries.length} layers ready for operator onboarding.`,
  };
}

export function buildOnboardingChecklist(input: {
  integritySnapshot: OperatorExperienceIntegritySnapshot;
  uxSnapshot: ReturnType<typeof buildExecutiveUxReadinessSnapshot>;
  browserSnapshot: ReturnType<typeof buildBrowserExperienceCompletenessSnapshot>;
  navigationSnapshot: ReturnType<typeof buildOperatorSurfaceNavigationSnapshot>;
  verificationChain: OnboardingVerificationChainAudit;
  sources: OperatorOnboardingReadinessSources;
}): OnboardingChecklist {
  const browserRouteSource = input.integritySnapshot.authBoundaries.entries.length > 0
    ? input.sources.packageSource
    : "";

  const evaluations: Record<string, { pass: boolean; rationale: string }> = {
    x31_browser_ready: {
      pass: input.uxSnapshot.classification.browserReady.ready,
      rationale: input.uxSnapshot.classification.browserReady.summary,
    },
    x36_browser_complete: {
      pass: input.browserSnapshot.completenessScore.status === "browser_complete",
      rationale: input.browserSnapshot.completenessScore.summary,
    },
    x37_journeys_ready: {
      pass:
        input.navigationSnapshot.journeys.readyCount === input.navigationSnapshot.journeys.journeys.length,
      rationale: input.navigationSnapshot.journeys.summary,
    },
    x38_no_hybrid_conflicts: {
      pass: input.integritySnapshot.authBoundaries.hybridConflicts.length === 0,
      rationale: input.integritySnapshot.authBoundaries.summary,
    },
    x38_disclosure_adequate: {
      pass: input.integritySnapshot.dataModes.disclosureScore >= 80,
      rationale: input.integritySnapshot.dataModes.summary,
    },
    x38_workflow_parity: {
      pass: input.integritySnapshot.workflowParity.parityScore >= 80,
      rationale: input.integritySnapshot.workflowParity.summary,
    },
    verification_chain: {
      pass: input.verificationChain.chains.every((chain) => chain.executionStatus === "ready"),
      rationale: input.verificationChain.summary,
    },
    operator_dashboard: {
      pass: input.integritySnapshot.authBoundaries.entries.some(
        (entry) => entry.path === "/operator/dashboard" && entry.browserPublic
      ),
      rationale: browserRouteSource.includes("verify:x32")
        ? "Operator dashboard browser route is registered in the browser surface stack."
        : "Operator dashboard route registration could not be confirmed.",
    },
  };

  const entries: OnboardingChecklistEntry[] = ONBOARDING_CHECKLIST_SPECS.map((spec) => {
    const evaluation = evaluations[spec.code] ?? { pass: false, rationale: "Check not configured." };
    return {
      code: spec.code,
      label: spec.label,
      source: spec.source,
      status: evaluation.pass ? "pass" : "fail",
      rationale: evaluation.rationale,
    };
  });

  const passedCount = entries.filter((entry) => entry.status === "pass").length;
  const completionScore = clamp(
    Math.round((passedCount / Math.max(1, entries.length)) * 100),
    0,
    100
  );

  return {
    entries,
    passedCount,
    totalCount: entries.length,
    completionScore,
    summary: `Onboarding checklist: ${passedCount}/${entries.length} steps passed with ${completionScore}% completion.`,
  };
}

function collectUpstreamRecommendations(input: {
  integritySnapshot: OperatorExperienceIntegritySnapshot;
  uxSnapshot: ReturnType<typeof buildExecutiveUxReadinessSnapshot>;
  browserSnapshot: ReturnType<typeof buildBrowserExperienceCompletenessSnapshot>;
  navigationSnapshot: ReturnType<typeof buildOperatorSurfaceNavigationSnapshot>;
}): Array<{
  source: string;
  horizon: "immediate" | "next_layer" | "production";
  title: string;
  reason: string;
  action: string;
}> {
  const items: Array<{
    source: string;
    horizon: "immediate" | "next_layer" | "production";
    title: string;
    reason: string;
    action: string;
  }> = [];

  for (const item of input.uxSnapshot.recommendations.immediate) {
    items.push({ source: "X31", ...item });
  }
  for (const item of input.uxSnapshot.recommendations.nextLayer) {
    items.push({ source: "X31", ...item });
  }
  for (const item of input.uxSnapshot.recommendations.production) {
    items.push({ source: "X31", ...item });
  }

  for (const item of input.browserSnapshot.recommendations.immediate) {
    items.push({ source: "X36", ...item });
  }
  for (const item of input.browserSnapshot.recommendations.nextLayer) {
    items.push({ source: "X36", ...item });
  }
  for (const item of input.browserSnapshot.recommendations.production) {
    items.push({ source: "X36", ...item });
  }

  for (const item of input.navigationSnapshot.recommendations.immediate) {
    items.push({ source: "X37", ...item });
  }
  for (const item of input.navigationSnapshot.recommendations.nextLayer) {
    items.push({ source: "X37", ...item });
  }
  for (const item of input.navigationSnapshot.recommendations.production) {
    items.push({ source: "X37", ...item });
  }

  for (const item of input.integritySnapshot.recommendations.immediate) {
    items.push({ source: "X38", ...item });
  }
  for (const item of input.integritySnapshot.recommendations.nextLayer) {
    items.push({ source: "X38", ...item });
  }
  for (const item of input.integritySnapshot.recommendations.production) {
    items.push({ source: "X38", ...item });
  }

  return items;
}

function mapHorizon(horizon: "immediate" | "next_layer" | "production"): RecommendationHorizon {
  if (horizon === "immediate") return "immediate";
  if (horizon === "next_layer") return "pre_onboarding";
  return "post_onboarding";
}

function mapPriority(
  horizon: "immediate" | "next_layer" | "production",
  title: string
): RemediationPriority {
  if (horizon === "immediate") return "blocker";
  if (horizon === "next_layer") return "warning";
  if (/orphan|cross-link|link high-priority/i.test(title)) return "warning";
  return "info";
}

export function buildRemediationQueue(input: {
  integritySnapshot: OperatorExperienceIntegritySnapshot;
  uxSnapshot: ReturnType<typeof buildExecutiveUxReadinessSnapshot>;
  browserSnapshot: ReturnType<typeof buildBrowserExperienceCompletenessSnapshot>;
  navigationSnapshot: ReturnType<typeof buildOperatorSurfaceNavigationSnapshot>;
}): RemediationQueue {
  const upstream = collectUpstreamRecommendations(input);
  const seen = new Set<string>();
  const entries: RemediationQueueEntry[] = [];

  for (const item of upstream) {
    const key = slugify(`${item.source}-${item.title}`);
    if (seen.has(key)) continue;
    seen.add(key);

    entries.push({
      id: key,
      source: item.source,
      priority: mapPriority(item.horizon, item.title),
      horizon: mapHorizon(item.horizon),
      title: item.title,
      reason: item.reason,
      action: item.action,
    });
  }

  entries.sort((left, right) => {
    const priorityOrder = { blocker: 0, warning: 1, info: 2 };
    return priorityOrder[left.priority] - priorityOrder[right.priority];
  });

  return {
    entries,
    blockerCount: entries.filter((entry) => entry.priority === "blocker").length,
    warningCount: entries.filter((entry) => entry.priority === "warning").length,
    summary: `Remediation queue: ${entries.length} deduplicated actions (${entries.filter((entry) => entry.priority === "blocker").length} blockers, ${entries.filter((entry) => entry.priority === "warning").length} warnings).`,
  };
}

export function buildBlockerRegister(input: {
  integritySnapshot: OperatorExperienceIntegritySnapshot;
  uxSnapshot: ReturnType<typeof buildExecutiveUxReadinessSnapshot>;
  browserSnapshot: ReturnType<typeof buildBrowserExperienceCompletenessSnapshot>;
  navigationSnapshot: ReturnType<typeof buildOperatorSurfaceNavigationSnapshot>;
  verificationChain: OnboardingVerificationChainAudit;
}): BlockerRegister {
  const blockers: OnboardingBlocker[] = [];

  if (!input.uxSnapshot.classification.browserReady.ready) {
    blockers.push({
      code: "x31_browser_not_ready",
      title: "X31 browser_ready tier not achieved",
      source: "X31",
      reason: input.uxSnapshot.classification.browserReady.summary,
      action: "Resolve X31 browser-ready blockers before onboarding operators.",
    });
  }

  if (input.browserSnapshot.completenessScore.status !== "browser_complete") {
    blockers.push({
      code: "x36_browser_incomplete",
      title: "X36 browser stack incomplete",
      source: "X36",
      reason: input.browserSnapshot.completenessScore.summary,
      action: "Complete missing browser routes, assets, tests, or verify scripts.",
    });
  }

  for (const path of input.integritySnapshot.authBoundaries.hybridConflicts) {
    blockers.push({
      code: `hybrid_conflict_${slugify(path)}`,
      title: `Hybrid auth conflict on ${path}`,
      source: "X38",
      reason: `Public browser HTML and authenticated JSON share ambiguous boundaries at ${path}.`,
      action: "Separate or document auth boundaries before operator onboarding.",
    });
  }

  if (input.integritySnapshot.dataModes.disclosureScore < 50) {
    blockers.push({
      code: "fixture_disclosure_critical",
      title: "Critical fixture disclosure gap",
      source: "X38",
      reason: input.integritySnapshot.dataModes.summary,
      action: 'Add data-mode="fixture" disclosure markers across browser HTML adapters.',
    });
  }

  if (input.navigationSnapshot.journeys.readyCount === 0) {
    blockers.push({
      code: "no_reachable_journeys",
      title: "No operator journeys are fully reachable",
      source: "X37",
      reason: input.navigationSnapshot.journeys.summary,
      action: "Register missing JSON and browser routes referenced by operator journeys.",
    });
  }

  const brokenChains = input.verificationChain.chains.filter(
    (chain) => chain.executionStatus !== "ready"
  );
  if (brokenChains.length > 0) {
    blockers.push({
      code: "verification_chain_broken",
      title: "Experience verification chain incomplete",
      source: "X39",
      reason: `${brokenChains.length} verify scripts from verify:x31 through verify:x39 require attention.`,
      action: "Repair verify script chaining and package.json script registration.",
    });
  }

  return {
    blockers,
    summary: `Blocker register: ${blockers.length} must-fix items before operator onboarding.`,
  };
}

export function buildWarningRegister(input: {
  integritySnapshot: OperatorExperienceIntegritySnapshot;
  navigationSnapshot: ReturnType<typeof buildOperatorSurfaceNavigationSnapshot>;
  remediationQueue: RemediationQueue;
}): WarningRegister {
  const warnings: OnboardingWarning[] = [];

  if (input.integritySnapshot.dataModes.disclosureScore >= 50 && input.integritySnapshot.dataModes.disclosureScore < 80) {
    warnings.push({
      code: "fixture_disclosure_partial",
      title: "Partial fixture disclosure coverage",
      source: "X38",
      reason: input.integritySnapshot.dataModes.summary,
      action: "Extend disclosure markers to remaining browser workflow routes.",
    });
  }

  if (input.navigationSnapshot.orphanCenters.orphans.length > 0) {
    warnings.push({
      code: "orphan_json_centers",
      title: "Orphan JSON experience centers",
      source: "X37",
      reason: input.navigationSnapshot.orphanCenters.summary,
      action: "Cross-link orphan JSON centers from browser operator surfaces.",
    });
  }

  if (input.integritySnapshot.workflowParity.parityScore < 80) {
    warnings.push({
      code: "workflow_parity_gap",
      title: "Workflow parity gaps remain",
      source: "X38",
      reason: input.integritySnapshot.workflowParity.summary,
      action: "Pair browser workflow hubs with authenticated JSON experience routes.",
    });
  }

  if (input.integritySnapshot.journeyIntegrity.readyCount < input.integritySnapshot.journeyIntegrity.journeys.length) {
    warnings.push({
      code: "journey_integrity_partial",
      title: "Operator journey integrity incomplete",
      source: "X38",
      reason: input.integritySnapshot.journeyIntegrity.summary,
      action: "Harden journey steps with auth-bounded JSON centers or disclosed browser surfaces.",
    });
  }

  for (const entry of input.remediationQueue.entries.filter((item) => item.priority === "warning").slice(0, 3)) {
    warnings.push({
      code: entry.id,
      title: entry.title,
      source: entry.source,
      reason: entry.reason,
      action: entry.action,
    });
  }

  const seen = new Set<string>();
  const deduped = warnings.filter((warning) => {
    if (seen.has(warning.code)) return false;
    seen.add(warning.code);
    return true;
  });

  return {
    warnings: deduped,
    summary: `Warning register: ${deduped.length} fix-soon items that do not alone block onboarding.`,
  };
}

export function buildOnboardingRecommendations(input: {
  blockers: BlockerRegister;
  warnings: WarningRegister;
  checklist: OnboardingChecklist;
  xStackReadiness: XStackReadinessMatrix;
}): OnboardingRecommendations {
  const immediate: OnboardingRecommendation[] = [];
  const preOnboarding: OnboardingRecommendation[] = [];
  const postOnboarding: OnboardingRecommendation[] = [];

  if (input.blockers.blockers.length > 0) {
    immediate.push({
      horizon: "immediate",
      title: "Clear onboarding blockers",
      reason: `${input.blockers.blockers.length} must-fix blockers prevent operator onboarding.`,
      action: "Resolve hybrid auth conflicts, browser completeness gaps, and verification chain issues first.",
    });
  }

  if (input.checklist.completionScore < 100) {
    preOnboarding.push({
      horizon: "pre_onboarding",
      title: "Complete onboarding checklist",
      reason: `${input.checklist.totalCount - input.checklist.passedCount} checklist steps remain incomplete.`,
      action: "Use /operator-onboarding-readiness/checklist as the canonical pre-onboarding runbook.",
    });
  }

  if (input.warnings.warnings.length > 0) {
    preOnboarding.push({
      horizon: "pre_onboarding",
      title: "Address onboarding warnings",
      reason: `${input.warnings.warnings.length} warnings should be resolved before broad operator rollout.`,
      action: "Prioritize orphan center links, disclosure markers, and workflow parity pairs.",
    });
  }

  if (!input.xStackReadiness.allReady) {
    postOnboarding.push({
      horizon: "post_onboarding",
      title: "Continue X-stack hardening after initial onboarding",
      reason: "Not all X31–X38 layers report ready status.",
      action: "Schedule post-onboarding remediation from the unified remediation queue.",
    });
  }

  return {
    immediate,
    preOnboarding,
    postOnboarding,
    summary: `Onboarding recommendations: ${immediate.length} immediate, ${preOnboarding.length} pre-onboarding, ${postOnboarding.length} post-onboarding actions.`,
  };
}

export function computeOnboardingReadinessScore(input: {
  blockers: BlockerRegister;
  warnings: WarningRegister;
  checklist: OnboardingChecklist;
  xStackReadiness: XStackReadinessMatrix;
  remediationQueue: RemediationQueue;
  verificationChain: OnboardingVerificationChainAudit;
}): OnboardingReadinessScore {
  const blockerClearanceWeight = 30;
  const xStackReadinessWeight = 25;
  const checklistWeight = 20;
  const remediationSeverityWeight = 15;
  const verificationChainWeight = 10;

  const blockerComponent =
    input.blockers.blockers.length === 0
      ? 100
      : clamp(100 - input.blockers.blockers.length * 20, 0, 100);
  const xStackComponent = clamp(
    Math.round(
      (input.xStackReadiness.entries.filter((entry) => entry.ready).length /
        Math.max(1, input.xStackReadiness.entries.length)) *
        100
    ),
    0,
    100
  );
  const checklistComponent = input.checklist.completionScore;
  const remediationComponent = clamp(
    100 - input.remediationQueue.blockerCount * 15 - input.remediationQueue.warningCount * 5,
    0,
    100
  );
  const verificationComponent = clamp(
    Math.round(
      (input.verificationChain.chains.filter((chain) => chain.executionStatus === "ready").length /
        Math.max(1, input.verificationChain.chains.length)) *
        100
    ),
    0,
    100
  );

  const score = Math.round(
    (blockerComponent * blockerClearanceWeight +
      xStackComponent * xStackReadinessWeight +
      checklistComponent * checklistWeight +
      remediationComponent * remediationSeverityWeight +
      verificationComponent * verificationChainWeight) /
      100
  );

  let status: OnboardingReadinessStatus = "blocked";
  if (score >= 85 && input.blockers.blockers.length === 0) status = "onboarding_ready";
  else if (score >= 60) status = "developing";

  return {
    score: clamp(score, 0, 100),
    status,
    blockerClearanceWeight,
    xStackReadinessWeight,
    checklistWeight,
    remediationSeverityWeight,
    verificationChainWeight,
    summary: `Operator onboarding readiness score ${clamp(score, 0, 100)} (${status.replace(/_/g, " ")}).`,
  };
}

export function buildOnboardingOverview(input: {
  onboardingScore: OnboardingReadinessScore;
  blockers: BlockerRegister;
  warnings: WarningRegister;
  checklist: OnboardingChecklist;
  remediationQueue: RemediationQueue;
}): OnboardingOverview {
  return {
    headline: "APP13 operator onboarding readiness center",
    onboardingScore: input.onboardingScore.score,
    status: input.onboardingScore.status,
    blockerCount: input.blockers.blockers.length,
    warningCount: input.warnings.warnings.length,
    checklistPassedCount: input.checklist.passedCount,
    checklistTotalCount: input.checklist.totalCount,
    remediationQueueCount: input.remediationQueue.entries.length,
    summary: `Onboarding overview: score ${input.onboardingScore.score}, ${input.blockers.blockers.length} blockers, ${input.warnings.warnings.length} warnings, ${input.checklist.passedCount}/${input.checklist.totalCount} checklist steps passed.`,
  };
}

export function buildOperatorOnboardingReadinessSnapshot(input: {
  raw: OperatorOnboardingReadinessRawSnapshot;
  generatedAt?: Date;
}): OperatorOnboardingReadinessSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const integritySnapshot = buildOperatorExperienceIntegritySnapshot({
    raw: input.raw.integrityRaw,
    generatedAt,
  });
  const navigationSnapshot = buildOperatorSurfaceNavigationSnapshot({
    raw: input.raw.integrityRaw.navigationRaw,
    generatedAt,
  });
  const browserSnapshot = buildBrowserExperienceCompletenessSnapshot({
    raw: input.raw.integrityRaw.navigationRaw.browserCompletenessRaw,
    generatedAt,
  });
  const uxSnapshot = buildExecutiveUxReadinessSnapshot({
    raw: input.raw.integrityRaw.navigationRaw.browserCompletenessRaw.uxReadinessRaw,
    generatedAt,
  });

  const verificationChain = buildOnboardingVerificationChainAudit(input.raw.sources);
  const xStackReadiness = buildXStackReadinessMatrix({
    integritySnapshot,
    uxSnapshot,
    browserSnapshot,
    navigationSnapshot,
  });
  const checklist = buildOnboardingChecklist({
    integritySnapshot,
    uxSnapshot,
    browserSnapshot,
    navigationSnapshot,
    verificationChain,
    sources: input.raw.sources,
  });
  const remediationQueue = buildRemediationQueue({
    integritySnapshot,
    uxSnapshot,
    browserSnapshot,
    navigationSnapshot,
  });
  const blockers = buildBlockerRegister({
    integritySnapshot,
    uxSnapshot,
    browserSnapshot,
    navigationSnapshot,
    verificationChain,
  });
  const warnings = buildWarningRegister({
    integritySnapshot,
    navigationSnapshot,
    remediationQueue,
  });
  const recommendations = buildOnboardingRecommendations({
    blockers,
    warnings,
    checklist,
    xStackReadiness,
  });
  const onboardingScore = computeOnboardingReadinessScore({
    blockers,
    warnings,
    checklist,
    xStackReadiness,
    remediationQueue,
    verificationChain,
  });
  const overview = buildOnboardingOverview({
    onboardingScore,
    blockers,
    warnings,
    checklist,
    remediationQueue,
  });

  return {
    overview,
    blockers,
    warnings,
    remediationQueue,
    checklist,
    xStackReadiness,
    verificationChain,
    recommendations,
    onboardingScore,
    generatedAt,
  };
}

export function buildOperatorOnboardingReadinessCenter(input: {
  snapshot: OperatorOnboardingReadinessSnapshot;
}): OperatorOnboardingReadinessCenter {
  return {
    overview: input.snapshot.overview,
    blockers: input.snapshot.blockers,
    warnings: input.snapshot.warnings,
    remediationQueue: input.snapshot.remediationQueue,
    checklist: input.snapshot.checklist,
    xStackReadiness: input.snapshot.xStackReadiness,
    verificationChain: input.snapshot.verificationChain,
    recommendations: input.snapshot.recommendations,
    onboardingScore: input.snapshot.onboardingScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectOperatorOnboardingReadinessPaths(): string[] {
  return [
    "docs/experience/X39-Operator-Onboarding-Readiness-Center.md",
    "src/api/routes/operator-onboarding-readiness.ts",
    "src/experience/operator-onboarding-readiness/module.ts",
    "test/x39-operator-onboarding-readiness.test.ts",
    "scripts/verify-x39.sh",
    ".dependency-cruiser.cjs",
  ];
}

export interface OnboardingOverviewView {
  headline: string;
  onboarding_score: number;
  status: OnboardingReadinessStatus;
  blocker_count: number;
  warning_count: number;
  checklist_passed_count: number;
  checklist_total_count: number;
  remediation_queue_count: number;
  summary: string;
}

export interface OnboardingBlockerView {
  code: string;
  title: string;
  source: string;
  reason: string;
  action: string;
}

export interface BlockerRegisterView {
  blockers: OnboardingBlockerView[];
  summary: string;
}

export interface OnboardingWarningView {
  code: string;
  title: string;
  source: string;
  reason: string;
  action: string;
}

export interface WarningRegisterView {
  warnings: OnboardingWarningView[];
  summary: string;
}

export interface RemediationQueueEntryView {
  id: string;
  source: string;
  priority: RemediationPriority;
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface RemediationQueueView {
  entries: RemediationQueueEntryView[];
  blocker_count: number;
  warning_count: number;
  summary: string;
}

export interface OnboardingChecklistEntryView {
  code: string;
  label: string;
  source: string;
  status: ChecklistStatus;
  rationale: string;
}

export interface OnboardingChecklistView {
  entries: OnboardingChecklistEntryView[];
  passed_count: number;
  total_count: number;
  completion_score: number;
  summary: string;
}

export interface XStackReadinessEntryView {
  layer: string;
  label: string;
  score: number;
  status: string;
  ready: boolean;
}

export interface XStackReadinessMatrixView {
  entries: XStackReadinessEntryView[];
  all_ready: boolean;
  summary: string;
}

export interface OnboardingVerificationChainEntryView {
  chain: string;
  exists: boolean;
  chained_correctly: boolean;
  execution_status: VerificationExecutionStatus;
  summary: string;
}

export interface OnboardingVerificationChainAuditView {
  chains: OnboardingVerificationChainEntryView[];
  summary: string;
}

export interface OnboardingRecommendationView {
  horizon: RecommendationHorizon;
  title: string;
  reason: string;
  action: string;
}

export interface OnboardingRecommendationsView {
  immediate: OnboardingRecommendationView[];
  pre_onboarding: OnboardingRecommendationView[];
  post_onboarding: OnboardingRecommendationView[];
  summary: string;
}

export interface OnboardingReadinessScoreView {
  score: number;
  status: OnboardingReadinessStatus;
  blocker_clearance_weight: number;
  x_stack_readiness_weight: number;
  checklist_weight: number;
  remediation_severity_weight: number;
  verification_chain_weight: number;
  summary: string;
}

export interface OperatorOnboardingReadinessCenterView {
  overview: OnboardingOverviewView;
  blockers: BlockerRegisterView;
  warnings: WarningRegisterView;
  remediation_queue: RemediationQueueView;
  checklist: OnboardingChecklistView;
  x_stack_readiness: XStackReadinessMatrixView;
  verification_chain: OnboardingVerificationChainAuditView;
  recommendations: OnboardingRecommendationsView;
  onboarding_score: OnboardingReadinessScoreView;
  generated_at: string;
}

export function toOnboardingOverviewView(overview: OnboardingOverview): OnboardingOverviewView {
  return {
    headline: overview.headline,
    onboarding_score: overview.onboardingScore,
    status: overview.status,
    blocker_count: overview.blockerCount,
    warning_count: overview.warningCount,
    checklist_passed_count: overview.checklistPassedCount,
    checklist_total_count: overview.checklistTotalCount,
    remediation_queue_count: overview.remediationQueueCount,
    summary: overview.summary,
  };
}

export function toOnboardingBlockerView(blocker: OnboardingBlocker): OnboardingBlockerView {
  return {
    code: blocker.code,
    title: blocker.title,
    source: blocker.source,
    reason: blocker.reason,
    action: blocker.action,
  };
}

export function toBlockerRegisterView(register: BlockerRegister): BlockerRegisterView {
  return {
    blockers: register.blockers.map(toOnboardingBlockerView),
    summary: register.summary,
  };
}

export function toOnboardingWarningView(warning: OnboardingWarning): OnboardingWarningView {
  return {
    code: warning.code,
    title: warning.title,
    source: warning.source,
    reason: warning.reason,
    action: warning.action,
  };
}

export function toWarningRegisterView(register: WarningRegister): WarningRegisterView {
  return {
    warnings: register.warnings.map(toOnboardingWarningView),
    summary: register.summary,
  };
}

export function toRemediationQueueEntryView(entry: RemediationQueueEntry): RemediationQueueEntryView {
  return {
    id: entry.id,
    source: entry.source,
    priority: entry.priority,
    horizon: entry.horizon,
    title: entry.title,
    reason: entry.reason,
    action: entry.action,
  };
}

export function toRemediationQueueView(queue: RemediationQueue): RemediationQueueView {
  return {
    entries: queue.entries.map(toRemediationQueueEntryView),
    blocker_count: queue.blockerCount,
    warning_count: queue.warningCount,
    summary: queue.summary,
  };
}

export function toOnboardingChecklistEntryView(entry: OnboardingChecklistEntry): OnboardingChecklistEntryView {
  return {
    code: entry.code,
    label: entry.label,
    source: entry.source,
    status: entry.status,
    rationale: entry.rationale,
  };
}

export function toOnboardingChecklistView(checklist: OnboardingChecklist): OnboardingChecklistView {
  return {
    entries: checklist.entries.map(toOnboardingChecklistEntryView),
    passed_count: checklist.passedCount,
    total_count: checklist.totalCount,
    completion_score: checklist.completionScore,
    summary: checklist.summary,
  };
}

export function toXStackReadinessEntryView(entry: XStackReadinessEntry): XStackReadinessEntryView {
  return {
    layer: entry.layer,
    label: entry.label,
    score: entry.score,
    status: entry.status,
    ready: entry.ready,
  };
}

export function toXStackReadinessMatrixView(matrix: XStackReadinessMatrix): XStackReadinessMatrixView {
  return {
    entries: matrix.entries.map(toXStackReadinessEntryView),
    all_ready: matrix.allReady,
    summary: matrix.summary,
  };
}

export function toOnboardingVerificationChainEntryView(
  entry: OnboardingVerificationChainEntry
): OnboardingVerificationChainEntryView {
  return {
    chain: entry.chain,
    exists: entry.exists,
    chained_correctly: entry.chainedCorrectly,
    execution_status: entry.executionStatus,
    summary: entry.summary,
  };
}

export function toOnboardingVerificationChainAuditView(
  audit: OnboardingVerificationChainAudit
): OnboardingVerificationChainAuditView {
  return {
    chains: audit.chains.map(toOnboardingVerificationChainEntryView),
    summary: audit.summary,
  };
}

export function toOnboardingRecommendationView(
  recommendation: OnboardingRecommendation
): OnboardingRecommendationView {
  return {
    horizon: recommendation.horizon,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toOnboardingRecommendationsView(
  recommendations: OnboardingRecommendations
): OnboardingRecommendationsView {
  return {
    immediate: recommendations.immediate.map(toOnboardingRecommendationView),
    pre_onboarding: recommendations.preOnboarding.map(toOnboardingRecommendationView),
    post_onboarding: recommendations.postOnboarding.map(toOnboardingRecommendationView),
    summary: recommendations.summary,
  };
}

export function toOnboardingReadinessScoreView(score: OnboardingReadinessScore): OnboardingReadinessScoreView {
  return {
    score: score.score,
    status: score.status,
    blocker_clearance_weight: score.blockerClearanceWeight,
    x_stack_readiness_weight: score.xStackReadinessWeight,
    checklist_weight: score.checklistWeight,
    remediation_severity_weight: score.remediationSeverityWeight,
    verification_chain_weight: score.verificationChainWeight,
    summary: score.summary,
  };
}

export function toOperatorOnboardingReadinessCenterView(
  center: OperatorOnboardingReadinessCenter
): OperatorOnboardingReadinessCenterView {
  return {
    overview: toOnboardingOverviewView(center.overview),
    blockers: toBlockerRegisterView(center.blockers),
    warnings: toWarningRegisterView(center.warnings),
    remediation_queue: toRemediationQueueView(center.remediationQueue),
    checklist: toOnboardingChecklistView(center.checklist),
    x_stack_readiness: toXStackReadinessMatrixView(center.xStackReadiness),
    verification_chain: toOnboardingVerificationChainAuditView(center.verificationChain),
    recommendations: toOnboardingRecommendationsView(center.recommendations),
    onboarding_score: toOnboardingReadinessScoreView(center.onboardingScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
