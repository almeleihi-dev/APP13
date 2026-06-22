import type { ActionStatus } from "../../../action/domain/action.js";
import { getTemplateByActionCode } from "../../../contract/templates/registry.js";
import { getCatalogActionByCode } from "../../../action-intelligence/domain/action-catalog.js";
import { inferRequestIntent } from "../../../request-experience/domain/request.js";
import { classifyTrustLiveFrame } from "../../../trust/domain/trust-profile.js";
import { formatMinorAmount } from "../../../experience/format.js";

export interface ProviderActionRecord {
  id: string;
  actionCode: string;
  actionName: string;
  title: string;
  status: ActionStatus;
  tekrrCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionPerformanceRecord {
  actionCode: string;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
}

export interface ActionEconomySnapshot {
  providerId: string;
  providerUserId: string;
  displayName: string;
  verificationTier: string;
  trustScore: number | null;
  trustTierLabel: string | null;
  actions: ProviderActionRecord[];
  performanceByActionCode: ActionPerformanceRecord[];
  platformProviderCounts: Array<{ actionCode: string; providerCount: number }>;
  openRequests: Array<{
    id: string;
    requestText: string;
    status: string;
    budgetMinor: number | null;
    preferredDays: number | null;
  }>;
  earnings: {
    currencyCode: string;
    releasedEarningsMinor: number;
    pendingHeldMinor: number;
    walletBalanceMinor: number;
    contractsWithEarnings: number;
  };
  platformPublishedActions: number;
}

export interface PublishedActionSummary {
  actionId: string;
  actionCode: string;
  actionName: string;
  title: string;
  status: ActionStatus;
  tekrrCompleteness: number;
  trustRequirementLabel: string;
  marketplaceProviderCount: number;
  completedContracts: number;
  activeContracts: number;
  completionRatePercent: number;
  summary: string;
}

export interface DraftActionSummary {
  actionId: string;
  actionCode: string;
  actionName: string;
  title: string;
  status: ActionStatus;
  tekrrCompleteness: number;
  publishReady: boolean;
  trustRequirementLabel: string;
  summary: string;
}

export interface RecommendedAction {
  actionCode: string;
  title: string;
  description: string;
  routeHint: string;
  priority: number;
}

export interface ActionOpportunity {
  requestId: string;
  primaryActionCode: string;
  actionName: string;
  requestSummary: string;
  budgetLabel: string | null;
  demandScore: number;
  eligible: boolean;
  summary: string;
}

export interface ActionDemandSummary {
  actionCode: string;
  actionName: string;
  openRequestCount: number;
  marketplaceProviderCount: number;
  demandLevel: "low" | "medium" | "high";
  summary: string;
}

export interface ActionPerformanceSummary {
  actionCode: string;
  actionName: string;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  completionRatePercent: number;
  rank: number;
  summary: string;
}

export interface EarningsPotential {
  currencyCode: string;
  releasedEarningsLabel: string;
  pendingHeldLabel: string;
  walletBalanceLabel: string;
  estimatedPipelineLabel: string;
  contractsWithEarnings: number;
  summary: string;
}

export interface ActionPortfolio {
  published: PublishedActionSummary[];
  drafts: DraftActionSummary[];
  publishedCount: number;
  draftCount: number;
  summary: string;
}

export interface ActionEconomyExperience {
  providerId: string;
  providerUserId: string;
  displayName: string;
  portfolio: ActionPortfolio;
  recommendedActions: RecommendedAction[];
  opportunities: ActionOpportunity[];
  demand: ActionDemandSummary[];
  performance: ActionPerformanceSummary[];
  earnings: EarningsPotential;
  growthOpportunities: ActionDemandSummary[];
  generatedAt: Date;
}

export interface PublishedActionSummaryView {
  action_id: string;
  action_code: string;
  action_name: string;
  title: string;
  status: ActionStatus;
  tekrr_completeness: number;
  trust_requirement_label: string;
  marketplace_provider_count: number;
  completed_contracts: number;
  active_contracts: number;
  completion_rate_percent: number;
  summary: string;
}

export interface DraftActionSummaryView {
  action_id: string;
  action_code: string;
  action_name: string;
  title: string;
  status: ActionStatus;
  tekrr_completeness: number;
  publish_ready: boolean;
  trust_requirement_label: string;
  summary: string;
}

export interface RecommendedActionView {
  action_code: string;
  title: string;
  description: string;
  route_hint: string;
  priority: number;
}

export interface ActionOpportunityView {
  request_id: string;
  primary_action_code: string;
  action_name: string;
  request_summary: string;
  budget_label: string | null;
  demand_score: number;
  eligible: boolean;
  summary: string;
}

export interface ActionDemandSummaryView {
  action_code: string;
  action_name: string;
  open_request_count: number;
  marketplace_provider_count: number;
  demand_level: "low" | "medium" | "high";
  summary: string;
}

export interface ActionPerformanceSummaryView {
  action_code: string;
  action_name: string;
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  completion_rate_percent: number;
  rank: number;
  summary: string;
}

export interface EarningsPotentialView {
  currency_code: string;
  released_earnings_label: string;
  pending_held_label: string;
  wallet_balance_label: string;
  estimated_pipeline_label: string;
  contracts_with_earnings: number;
  summary: string;
}

export interface ActionPortfolioView {
  published: PublishedActionSummaryView[];
  drafts: DraftActionSummaryView[];
  published_count: number;
  draft_count: number;
  summary: string;
}

export interface ActionEconomyExperienceView {
  provider_id: string;
  provider_user_id: string;
  display_name: string;
  portfolio: ActionPortfolioView;
  recommended_actions: RecommendedActionView[];
  opportunities: ActionOpportunityView[];
  demand: ActionDemandSummaryView[];
  performance: ActionPerformanceSummaryView[];
  earnings: EarningsPotentialView;
  growth_opportunities: ActionDemandSummaryView[];
  generated_at: string;
}

const DRAFT_STATUSES: ReadonlySet<ActionStatus> = new Set(["draft", "tekrr_in_progress"]);

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function resolveTrustRequirementLabel(actionCode: string): string {
  const template = getTemplateByActionCode(actionCode);
  return template ? `Provider tier ${template.minProviderTier}+` : "Provider tier T1+";
}

function performanceForCode(
  snapshot: ActionEconomySnapshot,
  actionCode: string
): ActionPerformanceRecord {
  return (
    snapshot.performanceByActionCode.find((entry) => entry.actionCode === actionCode) ?? {
      actionCode,
      totalContracts: 0,
      activeContracts: 0,
      completedContracts: 0,
    }
  );
}

function marketplaceCount(snapshot: ActionEconomySnapshot, actionCode: string): number {
  return (
    snapshot.platformProviderCounts.find((entry) => entry.actionCode === actionCode)
      ?.providerCount ?? 0
  );
}

function actionNameForCode(actionCode: string, fallback?: string): string {
  return getCatalogActionByCode(actionCode)?.actionName ?? fallback ?? actionCode;
}

export function buildPublishedActionSummary(
  action: ProviderActionRecord,
  snapshot: ActionEconomySnapshot
): PublishedActionSummary {
  const performance = performanceForCode(snapshot, action.actionCode);
  const completionRatePercent =
    performance.totalContracts > 0
      ? Math.round((performance.completedContracts / performance.totalContracts) * 100)
      : 0;

  return {
    actionId: action.id,
    actionCode: action.actionCode,
    actionName: action.actionName,
    title: action.title,
    status: action.status,
    tekrrCompleteness: action.tekrrCompleteness,
    trustRequirementLabel: resolveTrustRequirementLabel(action.actionCode),
    marketplaceProviderCount: marketplaceCount(snapshot, action.actionCode),
    completedContracts: performance.completedContracts,
    activeContracts: performance.activeContracts,
    completionRatePercent,
    summary: `${action.actionName} is published with ${performance.completedContracts} completed contract${performance.completedContracts === 1 ? "" : "s"}.`,
  };
}

export function buildDraftActionSummary(action: ProviderActionRecord): DraftActionSummary {
  const publishReady = action.tekrrCompleteness >= 100;

  return {
    actionId: action.id,
    actionCode: action.actionCode,
    actionName: action.actionName,
    title: action.title,
    status: action.status,
    tekrrCompleteness: action.tekrrCompleteness,
    publishReady,
    trustRequirementLabel: resolveTrustRequirementLabel(action.actionCode),
    summary: publishReady
      ? `${action.actionName} is ready to publish.`
      : `${action.actionName} is ${action.tekrrCompleteness}% complete.`,
  };
}

export function buildActionPortfolio(snapshot: ActionEconomySnapshot): ActionPortfolio {
  const publishedActions = snapshot.actions.filter((action) => !DRAFT_STATUSES.has(action.status));
  const draftActions = snapshot.actions.filter((action) => DRAFT_STATUSES.has(action.status));

  return {
    published: publishedActions.map((action) => buildPublishedActionSummary(action, snapshot)),
    drafts: draftActions.map(buildDraftActionSummary),
    publishedCount: publishedActions.length,
    draftCount: draftActions.length,
    summary: `${publishedActions.length} published and ${draftActions.length} draft action${draftActions.length === 1 ? "" : "s"} in your portfolio.`,
  };
}

export function buildActionDemandSummaries(snapshot: ActionEconomySnapshot): ActionDemandSummary[] {
  const demandByCode = new Map<string, number>();

  for (const request of snapshot.openRequests) {
    const intent = inferRequestIntent(request.requestText);
    const actionCode = intent.primaryActionCode;
    if (!actionCode) continue;
    demandByCode.set(actionCode, (demandByCode.get(actionCode) ?? 0) + 1);
  }

  const codes = new Set<string>([
    ...demandByCode.keys(),
    ...snapshot.platformProviderCounts.map((entry) => entry.actionCode),
    ...snapshot.actions.map((action) => action.actionCode),
  ]);

  return [...codes]
    .map((actionCode) => {
      const openRequestCount = demandByCode.get(actionCode) ?? 0;
      const marketplaceProviderCount = marketplaceCount(snapshot, actionCode);
      const demandLevel: ActionDemandSummary["demandLevel"] =
        openRequestCount >= 3 ? "high" : openRequestCount >= 1 ? "medium" : "low";

      return {
        actionCode,
        actionName: actionNameForCode(actionCode),
        openRequestCount,
        marketplaceProviderCount,
        demandLevel,
        summary: `${openRequestCount} open request${openRequestCount === 1 ? "" : "s"} across ${marketplaceProviderCount} marketplace provider${marketplaceProviderCount === 1 ? "" : "s"}.`,
      };
    })
    .sort(
      (left, right) =>
        right.openRequestCount - left.openRequestCount ||
        left.actionCode.localeCompare(right.actionCode)
    );
}

export function buildActionOpportunities(snapshot: ActionEconomySnapshot): ActionOpportunity[] {
  const publishedCodes = new Set(
    snapshot.actions
      .filter((action) => !DRAFT_STATUSES.has(action.status))
      .map((action) => action.actionCode)
  );

  return snapshot.openRequests
    .map((request) => {
      const intent = inferRequestIntent(request.requestText);
      const primaryActionCode = intent.primaryActionCode ?? "technology.code";
      const eligible = publishedCodes.has(primaryActionCode);
      const demandScore = Math.round(intent.confidence * 100);

      return {
        requestId: request.id,
        primaryActionCode,
        actionName: actionNameForCode(primaryActionCode),
        requestSummary: request.requestText.slice(0, 120),
        budgetLabel:
          request.budgetMinor !== null
            ? formatMinorAmount(request.budgetMinor, snapshot.earnings.currencyCode)
            : null,
        demandScore,
        eligible,
        summary: eligible
          ? `You can respond to this ${primaryActionCode} request now.`
          : `Publish ${primaryActionCode} to unlock this request.`,
      };
    })
    .sort(
      (left, right) =>
        Number(right.eligible) - Number(left.eligible) ||
        right.demandScore - left.demandScore ||
        left.requestId.localeCompare(right.requestId)
    )
    .slice(0, 10);
}

export function buildActionPerformanceSummaries(
  snapshot: ActionEconomySnapshot
): ActionPerformanceSummary[] {
  const publishedCodes = snapshot.actions
    .filter((action) => !DRAFT_STATUSES.has(action.status))
    .map((action) => action.actionCode);

  const uniqueCodes = [...new Set(publishedCodes)];

  return uniqueCodes
    .map((actionCode) => {
      const performance = performanceForCode(snapshot, actionCode);
      const completionRatePercent =
        performance.totalContracts > 0
          ? Math.round((performance.completedContracts / performance.totalContracts) * 100)
          : 0;

      return {
        actionCode,
        actionName: actionNameForCode(
          actionCode,
          snapshot.actions.find((action) => action.actionCode === actionCode)?.actionName
        ),
        totalContracts: performance.totalContracts,
        activeContracts: performance.activeContracts,
        completedContracts: performance.completedContracts,
        completionRatePercent,
        rank: 0,
        summary: `${performance.completedContracts}/${performance.totalContracts} contracts completed for ${actionCode}.`,
      };
    })
    .sort(
      (left, right) =>
        right.completedContracts - left.completedContracts ||
        right.activeContracts - left.activeContracts ||
        left.actionCode.localeCompare(right.actionCode)
    )
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export function buildEarningsPotential(snapshot: ActionEconomySnapshot): EarningsPotential {
  const pipelineMinor = snapshot.openRequests.reduce((total, request) => {
    const intent = inferRequestIntent(request.requestText);
    const publishedCodes = new Set(
      snapshot.actions
        .filter((action) => !DRAFT_STATUSES.has(action.status))
        .map((action) => action.actionCode)
    );
    if (!intent.primaryActionCode || !publishedCodes.has(intent.primaryActionCode)) {
      return total;
    }
    return total + (request.budgetMinor ?? 0);
  }, 0);

  return {
    currencyCode: snapshot.earnings.currencyCode,
    releasedEarningsLabel: formatMinorAmount(
      snapshot.earnings.releasedEarningsMinor,
      snapshot.earnings.currencyCode
    ),
    pendingHeldLabel: formatMinorAmount(
      snapshot.earnings.pendingHeldMinor,
      snapshot.earnings.currencyCode
    ),
    walletBalanceLabel: formatMinorAmount(
      snapshot.earnings.walletBalanceMinor,
      snapshot.earnings.currencyCode
    ),
    estimatedPipelineLabel: formatMinorAmount(pipelineMinor, snapshot.earnings.currencyCode),
    contractsWithEarnings: snapshot.earnings.contractsWithEarnings,
    summary: `${formatMinorAmount(snapshot.earnings.releasedEarningsMinor, snapshot.earnings.currencyCode)} released with ${formatMinorAmount(pipelineMinor, snapshot.earnings.currencyCode)} estimated pipeline.`,
  };
}

export function buildRecommendedActions(snapshot: ActionEconomySnapshot): RecommendedAction[] {
  const recommendations: RecommendedAction[] = [];
  const portfolio = buildActionPortfolio(snapshot);
  const performance = buildActionPerformanceSummaries(snapshot);
  const opportunities = buildActionOpportunities(snapshot);

  const publishReadyDraft = portfolio.drafts.find((draft) => draft.publishReady);
  if (publishReadyDraft) {
    recommendations.push({
      actionCode: "publish_ready_draft",
      title: `Publish ${publishReadyDraft.actionName}`,
      description: publishReadyDraft.summary,
      routeHint: `GET /v1/actions/${publishReadyDraft.actionId}`,
      priority: 1,
    });
  }

  const topOpportunity = opportunities.find((opportunity) => opportunity.eligible);
  if (topOpportunity) {
    recommendations.push({
      actionCode: "respond_to_request",
      title: "Respond to matched request",
      description: topOpportunity.summary,
      routeHint: `GET /discover/requests`,
      priority: 2,
    });
  }

  if ((snapshot.trustScore ?? 0) < 70) {
    recommendations.push({
      actionCode: "improve_trust",
      title: "Improve trust score",
      description: `Current trust score is ${snapshot.trustScore ?? 0}; Sapphire Verified requires 70+.`,
      routeHint: "GET /live-frame",
      priority: 3,
    });
  }

  const topPerformer = performance[0];
  if (topPerformer && topPerformer.completedContracts > 0) {
    recommendations.push({
      actionCode: "grow_top_action",
      title: `Grow ${topPerformer.actionName}`,
      description: topPerformer.summary,
      routeHint: "GET /discover/actions",
      priority: 4,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      actionCode: "publish_first_action",
      title: "Publish your first action",
      description: "Complete TEKRR and publish an action to enter the marketplace.",
      routeHint: "GET /v1/actions",
      priority: 5,
    });
  }

  return recommendations.sort((left, right) => left.priority - right.priority);
}

export function buildGrowthOpportunities(snapshot: ActionEconomySnapshot): ActionDemandSummary[] {
  const publishedCodes = new Set(
    snapshot.actions
      .filter((action) => !DRAFT_STATUSES.has(action.status))
      .map((action) => action.actionCode)
  );

  return buildActionDemandSummaries(snapshot)
    .filter(
      (entry) =>
        !publishedCodes.has(entry.actionCode) &&
        entry.openRequestCount > 0 &&
        entry.marketplaceProviderCount <= 3
    )
    .slice(0, 5);
}

export function buildActionEconomyExperience(input: {
  snapshot: ActionEconomySnapshot;
  generatedAt?: Date;
}): ActionEconomyExperience {
  const snapshot = {
    ...input.snapshot,
    trustTierLabel:
      input.snapshot.trustScore !== null
        ? classifyTrustLiveFrame(input.snapshot.trustScore).label
        : input.snapshot.trustTierLabel,
  };

  return {
    providerId: snapshot.providerId,
    providerUserId: snapshot.providerUserId,
    displayName: snapshot.displayName,
    portfolio: buildActionPortfolio(snapshot),
    recommendedActions: buildRecommendedActions(snapshot),
    opportunities: buildActionOpportunities(snapshot),
    demand: buildActionDemandSummaries(snapshot),
    performance: buildActionPerformanceSummaries(snapshot),
    earnings: buildEarningsPotential(snapshot),
    growthOpportunities: buildGrowthOpportunities(snapshot),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toPublishedActionSummaryView(
  summary: PublishedActionSummary
): PublishedActionSummaryView {
  return {
    action_id: summary.actionId,
    action_code: summary.actionCode,
    action_name: summary.actionName,
    title: summary.title,
    status: summary.status,
    tekrr_completeness: summary.tekrrCompleteness,
    trust_requirement_label: summary.trustRequirementLabel,
    marketplace_provider_count: summary.marketplaceProviderCount,
    completed_contracts: summary.completedContracts,
    active_contracts: summary.activeContracts,
    completion_rate_percent: summary.completionRatePercent,
    summary: summary.summary,
  };
}

export function toDraftActionSummaryView(summary: DraftActionSummary): DraftActionSummaryView {
  return {
    action_id: summary.actionId,
    action_code: summary.actionCode,
    action_name: summary.actionName,
    title: summary.title,
    status: summary.status,
    tekrr_completeness: summary.tekrrCompleteness,
    publish_ready: summary.publishReady,
    trust_requirement_label: summary.trustRequirementLabel,
    summary: summary.summary,
  };
}

export function toRecommendedActionView(action: RecommendedAction): RecommendedActionView {
  return {
    action_code: action.actionCode,
    title: action.title,
    description: action.description,
    route_hint: action.routeHint,
    priority: action.priority,
  };
}

export function toActionOpportunityView(opportunity: ActionOpportunity): ActionOpportunityView {
  return {
    request_id: opportunity.requestId,
    primary_action_code: opportunity.primaryActionCode,
    action_name: opportunity.actionName,
    request_summary: opportunity.requestSummary,
    budget_label: opportunity.budgetLabel,
    demand_score: opportunity.demandScore,
    eligible: opportunity.eligible,
    summary: opportunity.summary,
  };
}

export function toActionDemandSummaryView(summary: ActionDemandSummary): ActionDemandSummaryView {
  return {
    action_code: summary.actionCode,
    action_name: summary.actionName,
    open_request_count: summary.openRequestCount,
    marketplace_provider_count: summary.marketplaceProviderCount,
    demand_level: summary.demandLevel,
    summary: summary.summary,
  };
}

export function toActionPerformanceSummaryView(
  summary: ActionPerformanceSummary
): ActionPerformanceSummaryView {
  return {
    action_code: summary.actionCode,
    action_name: summary.actionName,
    total_contracts: summary.totalContracts,
    active_contracts: summary.activeContracts,
    completed_contracts: summary.completedContracts,
    completion_rate_percent: summary.completionRatePercent,
    rank: summary.rank,
    summary: summary.summary,
  };
}

export function toEarningsPotentialView(earnings: EarningsPotential): EarningsPotentialView {
  return {
    currency_code: earnings.currencyCode,
    released_earnings_label: earnings.releasedEarningsLabel,
    pending_held_label: earnings.pendingHeldLabel,
    wallet_balance_label: earnings.walletBalanceLabel,
    estimated_pipeline_label: earnings.estimatedPipelineLabel,
    contracts_with_earnings: earnings.contractsWithEarnings,
    summary: earnings.summary,
  };
}

export function toActionPortfolioView(portfolio: ActionPortfolio): ActionPortfolioView {
  return {
    published: portfolio.published.map(toPublishedActionSummaryView),
    drafts: portfolio.drafts.map(toDraftActionSummaryView),
    published_count: portfolio.publishedCount,
    draft_count: portfolio.draftCount,
    summary: portfolio.summary,
  };
}

export function toActionEconomyExperienceView(
  experience: ActionEconomyExperience
): ActionEconomyExperienceView {
  return {
    provider_id: experience.providerId,
    provider_user_id: experience.providerUserId,
    display_name: experience.displayName,
    portfolio: toActionPortfolioView(experience.portfolio),
    recommended_actions: experience.recommendedActions.map(toRecommendedActionView),
    opportunities: experience.opportunities.map(toActionOpportunityView),
    demand: experience.demand.map(toActionDemandSummaryView),
    performance: experience.performance.map(toActionPerformanceSummaryView),
    earnings: toEarningsPotentialView(experience.earnings),
    growth_opportunities: experience.growthOpportunities.map(toActionDemandSummaryView),
    generated_at: toIsoString(experience.generatedAt),
  };
}
