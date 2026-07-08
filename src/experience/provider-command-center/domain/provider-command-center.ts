import type { ProviderContractRecord } from "../../../provider-workspace/infrastructure/provider-dashboard-repository.js";
import {
  buildProviderEarningsSummary,
  type ProviderEarningsSummary,
} from "../../../provider-workspace/domain/provider-dashboard.js";
import { formatMinorAmount } from "../../../experience/format.js";
import {
  rankRequestsForProvider,
  toRequestMatchResultView,
  type DiscoveryMatchProviderRecord,
  type RequestMatchResult,
} from "../../discovery-matching/domain/discovery-matching.js";
import {
  buildPassportLevelAssessment,
  isLicenseCredential,
  toPassportLevelAssessmentView,
  type PassportLevelAssessment,
  type PassportLevelAssessmentView,
} from "../../professional-passport/domain/professional-passport.js";
import {
  buildProfessionalSealsProfile,
  toVerificationEconomyView,
  type ProfessionalSealsSnapshot,
  type VerificationEconomy,
  type VerificationEconomyView,
} from "../../professional-seals/domain/professional-seals.js";
import {
  buildLiveTrustFrameExperience,
  buildLiveTrustFrameSnapshot,
  toFrameScoreBreakdownView,
  toFrameSignalView,
  type FrameLevelAssessmentView,
  type FrameScoreBreakdownView,
  type FrameSignalView,
  type LiveTrustFrameExperience,
} from "../../live-trust-frame/domain/live-trust-frame.js";
import {
  buildTrustOverview,
  toTrustOverviewView,
  type TrustOverview,
  type TrustOverviewView,
} from "../../trust-reputation/domain/trust-reputation-experience.js";
import type { PlatformTrustContext } from "../../live-frame/domain/live-frame-experience.js";

const ACTIVE_CONTRACT_STATUSES = new Set(["accepted", "active", "proposed"]);
const COMPLETED_CONTRACT_STATUSES = new Set(["completed"]);

export interface ProviderCommandCenterSnapshot {
  providerUserId: string;
  providerId: string;
  displayName: string;
  earnings: ProviderEarningsSummary;
  contracts: ProviderContractRecord[];
  incomingOfferCount: number;
  trustOverview: TrustOverview;
  opportunities: RequestMatchResult[];
  passportLevel: PassportLevelAssessment;
  sealsEconomy: VerificationEconomy;
  sealPointsTotal: number;
  liveTrustFrame: LiveTrustFrameExperience;
}

export interface CommandCenterOverview {
  headline: string;
  nextRecommendedAction: string;
  incomingOffers: number;
  activeContracts: number;
  completedContracts: number;
  trustScore: number;
  frameScore: number;
  opportunityCount: number;
  summary: string;
}

export interface RevenueSummary {
  providerId: string;
  currencyCode: string;
  releasedEarningsMinor: number;
  releasedEarningsLabel: string;
  pendingHeldMinor: number;
  pendingHeldLabel: string;
  walletBalanceMinor: number;
  walletBalanceLabel: string;
  contractsWithEarnings: number;
  summary: string;
}

export interface ContractHighlight {
  contractId: string;
  contractNumber: string;
  status: string;
  customerDisplayName: string;
  actionTitle: string | null;
  summary: string;
}

export interface ContractsSummary {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  incomingOffers: number;
  recentContracts: ContractHighlight[];
  summary: string;
}

export interface TrustIntegration {
  trustScore: number;
  tierLabel: string;
  badgeLabel: string;
  completedContracts: number;
  averageRating: number;
  summary: string;
  overview: TrustOverview;
}

export interface OpportunitiesIntegration {
  totalOpportunities: number;
  topOpportunities: RequestMatchResult[];
  summary: string;
}

export interface PassportIntegration {
  level: PassportLevelAssessment["level"];
  label: string;
  summary: string;
  assessment: PassportLevelAssessment;
}

export interface SealsEconomyIntegration {
  tier: VerificationEconomy["tier"];
  tierLabel: string;
  sealPoints: number;
  trustBonusPercent: number;
  visibilityBonusPercent: number;
  pricingPremiumPercent: number;
  summary: string;
  economy: VerificationEconomy;
}

export interface LiveTrustFrameIntegration {
  frameLevel: LiveTrustFrameExperience["frameLevel"]["level"];
  frameLevelLabel: string;
  frameScore: number;
  topSignals: LiveTrustFrameExperience["signals"];
  summary: string;
  experience: LiveTrustFrameExperience;
}

export interface ProviderCommandCenter {
  providerUserId: string;
  providerId: string;
  displayName: string;
  overview: CommandCenterOverview;
  revenue: RevenueSummary;
  contracts: ContractsSummary;
  trust: TrustIntegration;
  opportunities: OpportunitiesIntegration;
  passport: PassportIntegration;
  sealsEconomy: SealsEconomyIntegration;
  liveTrustFrame: LiveTrustFrameIntegration;
  generatedAt: Date;
}

export interface CommandCenterOverviewView {
  headline: string;
  next_recommended_action: string;
  incoming_offers: number;
  active_contracts: number;
  completed_contracts: number;
  trust_score: number;
  frame_score: number;
  opportunity_count: number;
  summary: string;
}

export interface RevenueSummaryView {
  provider_id: string;
  currency_code: string;
  released_earnings_minor: number;
  released_earnings_label: string;
  pending_held_minor: number;
  pending_held_label: string;
  wallet_balance_minor: number;
  wallet_balance_label: string;
  contracts_with_earnings: number;
  summary: string;
}

export interface ContractHighlightView {
  contract_id: string;
  contract_number: string;
  status: string;
  customer_display_name: string;
  action_title: string | null;
  summary: string;
}

export interface ContractsSummaryView {
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  incoming_offers: number;
  recent_contracts: ContractHighlightView[];
  summary: string;
}

export interface TrustIntegrationView {
  trust_score: number;
  tier_label: string;
  badge_label: string;
  completed_contracts: number;
  average_rating: number;
  summary: string;
  overview: TrustOverviewView;
}

export interface OpportunitiesIntegrationView {
  total_opportunities: number;
  top_opportunities: ReturnType<typeof toRequestMatchResultView>[];
  summary: string;
}

export interface PassportIntegrationView {
  level: PassportLevelAssessmentView["level"];
  label: string;
  summary: string;
  assessment: PassportLevelAssessmentView;
}

export interface SealsEconomyIntegrationView {
  tier: VerificationEconomyView["tier"];
  tier_label: string;
  seal_points: number;
  trust_bonus_percent: number;
  visibility_bonus_percent: number;
  pricing_premium_percent: number;
  summary: string;
  economy: VerificationEconomyView;
}

export interface LiveTrustFrameIntegrationView {
  frame_level: FrameLevelAssessmentView["level"];
  frame_level_label: string;
  frame_score: number;
  frame_score_breakdown: FrameScoreBreakdownView;
  top_signals: FrameSignalView[];
  summary: string;
}

export interface ProviderCommandCenterView {
  provider_user_id: string;
  provider_id: string;
  display_name: string;
  overview: CommandCenterOverviewView;
  revenue: RevenueSummaryView;
  contracts: ContractsSummaryView;
  trust: TrustIntegrationView;
  opportunities: OpportunitiesIntegrationView;
  passport: PassportIntegrationView;
  seals_economy: SealsEconomyIntegrationView;
  live_trust_frame: LiveTrustFrameIntegrationView;
  generated_at: string;
}

export function buildRevenueSummary(earnings: ProviderEarningsSummary): RevenueSummary {
  return {
    providerId: earnings.providerId,
    currencyCode: earnings.currencyCode,
    releasedEarningsMinor: earnings.releasedEarningsMinor,
    releasedEarningsLabel: earnings.releasedEarningsLabel,
    pendingHeldMinor: earnings.pendingHeldMinor,
    pendingHeldLabel: earnings.pendingHeldLabel,
    walletBalanceMinor: earnings.walletBalanceMinor,
    walletBalanceLabel: earnings.walletBalanceLabel,
    contractsWithEarnings: earnings.contractsWithEarnings,
    summary: earnings.summary,
  };
}

export function buildContractsSummary(input: {
  contracts: ProviderContractRecord[];
  incomingOfferCount: number;
  limit?: number;
}): ContractsSummary {
  const activeContracts = input.contracts.filter((contract) =>
    ACTIVE_CONTRACT_STATUSES.has(contract.status)
  ).length;
  const completedContracts = input.contracts.filter((contract) =>
    COMPLETED_CONTRACT_STATUSES.has(contract.status)
  ).length;
  const recentContracts = input.contracts.slice(0, input.limit ?? 5).map((contract) => ({
    contractId: contract.id,
    contractNumber: contract.contractNumber,
    status: contract.status,
    customerDisplayName: contract.customerDisplayName,
    actionTitle: contract.actionTitle,
    summary: `${contract.contractNumber} with ${contract.customerDisplayName} is ${contract.status}.`,
  }));

  return {
    totalContracts: input.contracts.length,
    activeContracts,
    completedContracts,
    incomingOffers: input.incomingOfferCount,
    recentContracts,
    summary: `${input.contracts.length} total contracts (${activeContracts} active, ${completedContracts} completed) and ${input.incomingOfferCount} incoming offer${input.incomingOfferCount === 1 ? "" : "s"}.`,
  };
}

export function buildTrustIntegration(overview: TrustOverview): TrustIntegration {
  return {
    trustScore: overview.trustScore,
    tierLabel: overview.tierLabel,
    badgeLabel: overview.badgeLabel,
    completedContracts: overview.completedContracts,
    averageRating: overview.averageRating,
    summary: overview.summary,
    overview,
  };
}

export function buildOpportunitiesIntegration(
  opportunities: RequestMatchResult[]
): OpportunitiesIntegration {
  return {
    totalOpportunities: opportunities.length,
    topOpportunities: opportunities.slice(0, 5),
    summary:
      opportunities.length > 0
        ? `${opportunities.length} matched open request${opportunities.length === 1 ? "" : "s"} ranked by X8 discovery matching.`
        : "No matched open requests available right now.",
  };
}

export function buildPassportIntegration(
  assessment: PassportLevelAssessment
): PassportIntegration {
  return {
    level: assessment.level,
    label: assessment.label,
    summary: assessment.summary,
    assessment,
  };
}

export function buildSealsEconomyIntegration(input: {
  economy: VerificationEconomy;
  sealPointsTotal: number;
}): SealsEconomyIntegration {
  return {
    tier: input.economy.tier,
    tierLabel: input.economy.tierLabel,
    sealPoints: input.sealPointsTotal,
    trustBonusPercent: input.economy.trustBonusPercent,
    visibilityBonusPercent: input.economy.visibilityBonusPercent,
    pricingPremiumPercent: input.economy.pricingPremiumPercent,
    summary: input.economy.summary,
    economy: input.economy,
  };
}

export function buildLiveTrustFrameIntegration(
  experience: LiveTrustFrameExperience
): LiveTrustFrameIntegration {
  return {
    frameLevel: experience.frameLevel.level,
    frameLevelLabel: experience.frameLevel.label,
    frameScore: experience.frameScore.totalScore,
    topSignals: experience.signals.slice(0, 5),
    summary: experience.frameLevel.summary,
    experience,
  };
}

export function deriveCommandCenterNextAction(input: {
  opportunities: RequestMatchResult[];
  activeContracts: number;
  incomingOffers: number;
  liveTrustFrame: LiveTrustFrameExperience;
}): string {
  if (input.liveTrustFrame.frameLevel.downgrade.applied) {
    return "Resolve open disputes to restore live trust frame";
  }
  if (input.incomingOffers > 0) {
    return "Review incoming contract offers";
  }
  if (input.activeContracts > 0) {
    return "Continue active contract delivery";
  }
  if (input.opportunities.length > 0) {
    return "Respond to matched marketplace requests";
  }
  return "Publish actions and improve passport credentials";
}

export function buildCommandCenterOverview(input: {
  snapshot: ProviderCommandCenterSnapshot;
}): CommandCenterOverview {
  const contracts = buildContractsSummary({
    contracts: input.snapshot.contracts,
    incomingOfferCount: input.snapshot.incomingOfferCount,
  });

  const nextRecommendedAction = deriveCommandCenterNextAction({
    opportunities: input.snapshot.opportunities,
    activeContracts: contracts.activeContracts,
    incomingOffers: contracts.incomingOffers,
    liveTrustFrame: input.snapshot.liveTrustFrame,
  });

  return {
    headline: `${input.snapshot.displayName} command center`,
    nextRecommendedAction,
    incomingOffers: contracts.incomingOffers,
    activeContracts: contracts.activeContracts,
    completedContracts: contracts.completedContracts,
    trustScore: input.snapshot.trustOverview.trustScore,
    frameScore: input.snapshot.liveTrustFrame.frameScore.totalScore,
    opportunityCount: input.snapshot.opportunities.length,
    summary: `Provider command center with trust ${input.snapshot.trustOverview.trustScore}, frame ${input.snapshot.liveTrustFrame.frameScore.totalScore}, and ${input.snapshot.opportunities.length} matched opportunities.`,
  };
}

export function buildProviderCommandCenterSnapshot(input: {
  providerUserId: string;
  providerId: string;
  displayName: string;
  earningsRecord: {
    currencyCode: string;
    releasedEarningsMinor: number;
    pendingHeldMinor: number;
    walletBalanceMinor: number;
    contractsWithEarnings: number;
  };
  contracts: ProviderContractRecord[];
  incomingOfferCount: number;
  sealsSnapshot: ProfessionalSealsSnapshot;
  platformContext: PlatformTrustContext;
  providerRecord: DiscoveryMatchProviderRecord;
  openRequests: Array<{
    requestId: string;
    customerUserId: string;
    requestText: string;
    status: string;
    budget: number | null;
    preferredDays: number | null;
  }>;
}): ProviderCommandCenterSnapshot {
  const earnings = buildProviderEarningsSummary({
    providerId: input.providerId,
    currencyCode: input.earningsRecord.currencyCode,
    releasedEarningsMinor: input.earningsRecord.releasedEarningsMinor,
    releasedEarningsLabel: formatMinorAmount(
      input.earningsRecord.releasedEarningsMinor,
      input.earningsRecord.currencyCode
    ),
    pendingHeldMinor: input.earningsRecord.pendingHeldMinor,
    pendingHeldLabel: formatMinorAmount(
      input.earningsRecord.pendingHeldMinor,
      input.earningsRecord.currencyCode
    ),
    walletBalanceMinor: input.earningsRecord.walletBalanceMinor,
    walletBalanceLabel: formatMinorAmount(
      input.earningsRecord.walletBalanceMinor,
      input.earningsRecord.currencyCode
    ),
    contractsWithEarnings: input.earningsRecord.contractsWithEarnings,
  });

  const trustOverview = buildTrustOverview({
    profile: input.sealsSnapshot.trustProfile,
    platformContext: input.platformContext,
    verificationTier: input.sealsSnapshot.verificationTier,
  });

  const verifiedCredentials = input.sealsSnapshot.credentials.filter(
    (credential) => credential.status === "verified"
  );

  const passportLevel = buildPassportLevelAssessment({
    trustScore: input.sealsSnapshot.trustProfile.trust_score,
    verificationTier: input.sealsSnapshot.verificationTier,
    completedContracts: input.sealsSnapshot.publicProfile.completion_summary.completed_contracts,
    averageRating: input.sealsSnapshot.publicProfile.rating_summary.average_rating,
    activeIssues: input.sealsSnapshot.publicProfile.dispute_summary.active_issues,
    verifiedCredentialCount: verifiedCredentials.length,
    verifiedLicenseCount: verifiedCredentials.filter(isLicenseCredential).length,
  });

  const sealsProfile = buildProfessionalSealsProfile({ snapshot: input.sealsSnapshot });
  const liveTrustFrame = buildLiveTrustFrameExperience({
    snapshot: buildLiveTrustFrameSnapshot({
      sealsSnapshot: input.sealsSnapshot,
      platformContext: input.platformContext,
    }),
  });

  const opportunities = rankRequestsForProvider({
    provider: input.providerRecord,
    requests: input.openRequests.map((request) => ({
      requestId: request.requestId,
      customerUserId: request.customerUserId,
      requestText: request.requestText,
      status: request.status,
      budget: request.budget,
      preferredDays: request.preferredDays,
    })),
    limit: 5,
  });

  return {
    providerUserId: input.providerUserId,
    providerId: input.providerId,
    displayName: input.displayName,
    earnings,
    contracts: input.contracts,
    incomingOfferCount: input.incomingOfferCount,
    trustOverview,
    opportunities,
    passportLevel,
    sealsEconomy: sealsProfile.economy,
    sealPointsTotal: sealsProfile.sealPoints.totalPoints,
    liveTrustFrame,
  };
}

export function buildProviderCommandCenter(input: {
  snapshot: ProviderCommandCenterSnapshot;
  generatedAt?: Date;
}): ProviderCommandCenter {
  const revenue = buildRevenueSummary(input.snapshot.earnings);
  const contracts = buildContractsSummary({
    contracts: input.snapshot.contracts,
    incomingOfferCount: input.snapshot.incomingOfferCount,
  });
  const trust = buildTrustIntegration(input.snapshot.trustOverview);
  const opportunities = buildOpportunitiesIntegration(input.snapshot.opportunities);
  const passport = buildPassportIntegration(input.snapshot.passportLevel);
  const sealsEconomy = buildSealsEconomyIntegration({
    economy: input.snapshot.sealsEconomy,
    sealPointsTotal: input.snapshot.sealPointsTotal,
  });
  const liveTrustFrame = buildLiveTrustFrameIntegration(input.snapshot.liveTrustFrame);
  const overview = buildCommandCenterOverview({ snapshot: input.snapshot });

  return {
    providerUserId: input.snapshot.providerUserId,
    providerId: input.snapshot.providerId,
    displayName: input.snapshot.displayName,
    overview,
    revenue,
    contracts,
    trust,
    opportunities,
    passport,
    sealsEconomy,
    liveTrustFrame,
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function toCommandCenterOverviewView(
  overview: CommandCenterOverview
): CommandCenterOverviewView {
  return {
    headline: overview.headline,
    next_recommended_action: overview.nextRecommendedAction,
    incoming_offers: overview.incomingOffers,
    active_contracts: overview.activeContracts,
    completed_contracts: overview.completedContracts,
    trust_score: overview.trustScore,
    frame_score: overview.frameScore,
    opportunity_count: overview.opportunityCount,
    summary: overview.summary,
  };
}

export function toRevenueSummaryView(revenue: RevenueSummary): RevenueSummaryView {
  return {
    provider_id: revenue.providerId,
    currency_code: revenue.currencyCode,
    released_earnings_minor: revenue.releasedEarningsMinor,
    released_earnings_label: revenue.releasedEarningsLabel,
    pending_held_minor: revenue.pendingHeldMinor,
    pending_held_label: revenue.pendingHeldLabel,
    wallet_balance_minor: revenue.walletBalanceMinor,
    wallet_balance_label: revenue.walletBalanceLabel,
    contracts_with_earnings: revenue.contractsWithEarnings,
    summary: revenue.summary,
  };
}

export function toContractHighlightView(highlight: ContractHighlight): ContractHighlightView {
  return {
    contract_id: highlight.contractId,
    contract_number: highlight.contractNumber,
    status: highlight.status,
    customer_display_name: highlight.customerDisplayName,
    action_title: highlight.actionTitle,
    summary: highlight.summary,
  };
}

export function toContractsSummaryView(contracts: ContractsSummary): ContractsSummaryView {
  return {
    total_contracts: contracts.totalContracts,
    active_contracts: contracts.activeContracts,
    completed_contracts: contracts.completedContracts,
    incoming_offers: contracts.incomingOffers,
    recent_contracts: contracts.recentContracts.map(toContractHighlightView),
    summary: contracts.summary,
  };
}

export function toTrustIntegrationView(trust: TrustIntegration): TrustIntegrationView {
  return {
    trust_score: trust.trustScore,
    tier_label: trust.tierLabel,
    badge_label: trust.badgeLabel,
    completed_contracts: trust.completedContracts,
    average_rating: trust.averageRating,
    summary: trust.summary,
    overview: toTrustOverviewView(trust.overview),
  };
}

export function toOpportunitiesIntegrationView(
  opportunities: OpportunitiesIntegration
): OpportunitiesIntegrationView {
  return {
    total_opportunities: opportunities.totalOpportunities,
    top_opportunities: opportunities.topOpportunities.map(toRequestMatchResultView),
    summary: opportunities.summary,
  };
}

export function toPassportIntegrationView(passport: PassportIntegration): PassportIntegrationView {
  return {
    level: passport.level,
    label: passport.label,
    summary: passport.summary,
    assessment: toPassportLevelAssessmentView(passport.assessment),
  };
}

export function toSealsEconomyIntegrationView(
  integration: SealsEconomyIntegration
): SealsEconomyIntegrationView {
  return {
    tier: integration.tier,
    tier_label: integration.tierLabel,
    seal_points: integration.sealPoints,
    trust_bonus_percent: integration.trustBonusPercent,
    visibility_bonus_percent: integration.visibilityBonusPercent,
    pricing_premium_percent: integration.pricingPremiumPercent,
    summary: integration.summary,
    economy: toVerificationEconomyView(integration.economy),
  };
}

export function toLiveTrustFrameIntegrationView(
  integration: LiveTrustFrameIntegration
): LiveTrustFrameIntegrationView {
  return {
    frame_level: integration.frameLevel,
    frame_level_label: integration.frameLevelLabel,
    frame_score: integration.frameScore,
    frame_score_breakdown: toFrameScoreBreakdownView(integration.experience.frameScore),
    top_signals: integration.topSignals.map(toFrameSignalView),
    summary: integration.summary,
  };
}

export function toProviderCommandCenterView(
  center: ProviderCommandCenter
): ProviderCommandCenterView {
  return {
    provider_user_id: center.providerUserId,
    provider_id: center.providerId,
    display_name: center.displayName,
    overview: toCommandCenterOverviewView(center.overview),
    revenue: toRevenueSummaryView(center.revenue),
    contracts: toContractsSummaryView(center.contracts),
    trust: toTrustIntegrationView(center.trust),
    opportunities: toOpportunitiesIntegrationView(center.opportunities),
    passport: toPassportIntegrationView(center.passport),
    seals_economy: toSealsEconomyIntegrationView(center.sealsEconomy),
    live_trust_frame: toLiveTrustFrameIntegrationView(center.liveTrustFrame),
    generated_at: center.generatedAt.toISOString(),
  };
}
