import type { ActivePersonalIdentity } from "./personal-identity.js";
import type { PersonalProfessionalPassport } from "./personal-passport-persistence.js";
import type { LivingPlatformState } from "../lib/living-platform/types.js";
import {
  formatRelativeTime,
  listPublishedActionsForCreator,
  listRequestsForIdentity,
} from "../lib/living-platform/professional-action-store.js";
import { listPassportContractHistory } from "../lib/living-platform/action-contract-store.js";
import { listProjectsForIdentity } from "../lib/living-platform/project-living-store.js";
import { listTeamsForMember } from "../lib/living-platform/team-passport-store.js";
import { buildEconomyDashboardPresentation } from "../lib/living-platform/economy/economy-presentation.js";
import { buildActionIntelligencePresentation } from "../lib/living-platform/intelligence/action-intelligence-presentation.js";

export interface PersonalHomeActionItem {
  id: string;
  title: string;
  detail: string;
  status?: string;
}

export interface PersonalHomeActivityItem {
  id: string;
  title: string;
  time: string;
  status: string;
}

export interface PersonalHomeOpportunityItem {
  id: string;
  title: string;
  provider: string;
  liveFrameTier?: string;
}

export interface PersonalHomePresentation {
  trustScore: string;
  trustScoreValue: number;
  professionalLevel: string;
  profileCompletion: number;
  nextRecommendedStep: string;
  isNewUser: boolean;
  suggestedActions: PersonalHomeActionItem[];
  recentActivity: PersonalHomeActivityItem[];
  activeActions: PersonalHomeActionItem[];
  draftActions: PersonalHomeActionItem[];
  savedOpportunities: PersonalHomeOpportunityItem[];
  myPublishedActions: PersonalHomeActionItem[];
  activeRequests: PersonalHomeActionItem[];
  completedActions: PersonalHomeActionItem[];
  contractHistory: PersonalHomeActionItem[];
  activeContracts: PersonalHomeActionItem[];
  myTeams: PersonalHomeActionItem[];
  activeProjects: PersonalHomeActionItem[];
  economyPulse: {
    contractsGenerated: number;
    grossContractValue: string;
    successRate: string;
    growthIndex: number;
  };
  actionInventoryTotal: number;
  actionInventoryReady: number;
  actionInventoryGrowth: string | null;
  opportunityHeadlines: string[];
  matchingReadyCount: number;
  trustProgressDetail: string;
  liveFrameProgress: {
    current: PersonalProfessionalPassport["liveFrameTier"];
    next: PersonalProfessionalPassport["liveFrameTier"] | "Max tier";
    percent: number;
    detail: string;
  };
}

const TIER_ORDER: PersonalProfessionalPassport["liveFrameTier"][] = ["Silver", "Gold", "Platinum"];

function nextLiveFrameTier(current: PersonalProfessionalPassport["liveFrameTier"]) {
  const index = TIER_ORDER.indexOf(current);
  if (index < 0 || index >= TIER_ORDER.length - 1) {
    return { next: "Max tier" as const, percent: 100 };
  }
  const next = TIER_ORDER[index + 1]!;
  const percent = current === "Silver" ? 38 : current === "Gold" ? 64 : 100;
  return { next, percent };
}

function deriveTrustScore(identity: ActivePersonalIdentity): { label: string; value: number } {
  const base = 72;
  const indicatorBoost = identity.trustIndicators.length * 4;
  const actionBoost = Math.min(identity.completedActions * 2, 12);
  const photoBoost = identity.photoUrl ? 6 : 0;
  const summaryBoost = identity.experienceSummary.trim().length > 80 ? 6 : 0;
  const value = Math.min(98, base + indicatorBoost + actionBoost + photoBoost + summaryBoost);
  return { label: `${value}%`, value };
}

function deriveProfileCompletion(identity: ActivePersonalIdentity): number {
  const checks = [
    Boolean(identity.fullName.trim()),
    Boolean(identity.professionalTitle.trim()),
    Boolean(identity.location.trim()),
    Boolean(identity.mainSkill.trim()),
    Boolean(identity.experienceSummary.trim()),
    Boolean(identity.photoUrl),
    identity.trustIndicators.length >= 3,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function deriveProfessionalLevel(identity: ActivePersonalIdentity): string {
  if (identity.liveFrameTier === "Platinum") return "Elite Operator";
  if (identity.liveFrameTier === "Gold") return "Established Professional";
  if (identity.completedActions > 0) return "Active Professional";
  return "Emerging Professional";
}

export function buildPersonalHomePresentation(
  identity: ActivePersonalIdentity,
  livingState?: LivingPlatformState,
): PersonalHomePresentation {
  const state = livingState;
  const trust = deriveTrustScore(identity);
  const profileCompletion = deriveProfileCompletion(identity);
  const frame = nextLiveFrameTier(identity.liveFrameTier);
  const skill = identity.mainSkill.trim() || "your domain";
  const isNewUser = identity.completedActions === 0 && (!state || state.publishedActions.length === 0);

  const myPublished = state ? listPublishedActionsForCreator(identity) : [];
  const myRequests = state ? listRequestsForIdentity(identity) : [];
  const activeRequests = myRequests.filter(
    (request) => request.status !== "completed" && request.status !== "cancelled",
  );
  const completedRequests = myRequests.filter((request) => request.status === "completed");

  const liveFrameDetail =
    frame.next === "Max tier"
      ? "You are at the highest Live Frame tier on your operating surface."
      : `Complete verified actions and strengthen your passport to advance toward ${frame.next}.`;

  const suggestedActions: PersonalHomeActionItem[] = isNewUser
    ? [
        {
          id: "offer-action",
          title: "Publish your first Action",
          detail: "Transform your expertise into a structured professional action others can request.",
        },
        {
          id: "find-action",
          title: "Open the Action Marketplace",
          detail: `Browse verified professionals and opportunities in ${skill}.`,
        },
        {
          id: "complete-profile",
          title: profileCompletion < 100 ? "Strengthen your passport" : "Review your passport",
          detail:
            profileCompletion < 100
              ? "Add a photo and experience summary to improve trust signals."
              : "Your passport is complete — keep your credentials current.",
        },
      ]
    : [
        ...(myPublished.length === 0
          ? [
              {
                id: "offer-action",
                title: "Offer a professional Action",
                detail: "Publish a structured action to the marketplace with your passport attached.",
              },
            ]
          : []),
        {
          id: "find-action",
          title: "Explore the Action Marketplace",
          detail: `Search verified opportunities aligned with ${skill}.`,
        },
        {
          id: "complete-profile",
          title: profileCompletion < 100 ? "Complete your Professional Passport" : "Review your Professional Passport",
          detail:
            profileCompletion < 100
              ? "Add your photo, location, and experience summary to strengthen trust signals."
              : "Your passport is complete — keep your credentials current.",
        },
        {
          id: "live-frame",
          title: frame.next === "Max tier" ? "Maintain Platinum Live Frame" : `Build toward ${frame.next} Live Frame`,
          detail: liveFrameDetail,
        },
      ];

  const livingActivity: PersonalHomeActivityItem[] =
    state?.activity.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.title,
      time: formatRelativeTime(item.timestamp),
      status: item.kind,
    })) ?? [];

  const recentActivity: PersonalHomeActivityItem[] =
    livingActivity.length > 0
      ? livingActivity
      : [
          {
            id: "passport-created",
            title: "Professional Passport created",
            time: "Today",
            status: "complete",
          },
          {
            id: "live-frame-enrolled",
            title: `${identity.liveFrameTier} Live Frame enrolled`,
            time: "Today",
            status: "active",
          },
          {
            id: "identity-linked",
            title: "Platform identity linked",
            time: "Today",
            status: "verified",
          },
        ];

  const myPublishedActions: PersonalHomeActionItem[] = myPublished.map((action) => ({
    id: action.id,
    title: action.blueprint.name.trim(),
    detail: `Published · ${action.creator.liveFrameTier} Live Frame · Quality ${action.qualityScore}`,
    status: "published",
  }));

  const draftActions: PersonalHomeActionItem[] =
    state?.drafts.map((draft) => ({
      id: draft.id,
      title: draft.blueprint.name.trim() || "Untitled draft",
      detail: `Draft · Quality ${draft.qualityScore} · ${formatRelativeTime(draft.savedAt)}`,
      status: "draft",
    })) ?? [];

  const activeRequestsItems: PersonalHomeActionItem[] = activeRequests.map((request) => ({
    id: request.id,
    title: request.serviceName,
    detail: `${request.providerName} · ${request.trackingId} · In progress`,
    status: request.status,
  }));

  const myTeamsList = state ? listTeamsForMember(identity) : [];
  const myProjects = state ? listProjectsForIdentity(identity) : [];
  const activeProjectsList = myProjects.filter((project) => project.executionStatus !== "completed");

  const myTeamsItems: PersonalHomeActionItem[] = myTeamsList.map((team) => ({
    id: team.teamId,
    title: team.name,
    detail: `${team.liveFrameTier} Team Live Frame · Trust ${team.trustScore}% · ${team.members.length} members`,
    status: "team",
  }));

  const activeProjectsItems: PersonalHomeActionItem[] = activeProjectsList.map((project) => ({
    id: project.projectId,
    title: project.name,
    detail: `${project.progressPercent}% · ${project.executionStatus} · ${project.phases.length} phases`,
    status: project.executionStatus,
  }));

  const economy = state ? buildEconomyDashboardPresentation(identity) : null;
  const intelligence = state ? buildActionIntelligencePresentation(identity, state) : null;
  const economyPulse = {
    contractsGenerated: economy?.ledger.totalCreated ?? 0,
    grossContractValue: `$${(economy?.revenue.grossContractValue ?? 0).toLocaleString()}`,
    successRate: `${economy?.ledger.completionRate ?? 0}%`,
    growthIndex: economy?.revenue.economyGrowthIndex ?? 0,
  };

  const passportKey = identity.fullName.trim().toLowerCase();
  const contractHistoryEntries = state ? listPassportContractHistory(passportKey) : [];
  const activeContractsItems: PersonalHomeActionItem[] = state
    ? (state.contracts ?? [])
        .filter(
          (contract) =>
            (contract.requester.passportKey === passportKey ||
              contract.actionOwner.passportKey === passportKey) &&
            contract.agreementState !== "completed",
        )
        .map((contract) => ({
          id: contract.contractId,
          title: contract.actionDetails.name,
          detail: `${contract.agreementState} · ${contract.executionState} · ${contract.contractId}`,
          status: contract.agreementState,
        }))
    : [];

  const contractHistoryItems: PersonalHomeActionItem[] = contractHistoryEntries.map((entry) => ({
    id: entry.contractId,
    title: entry.actionName,
    detail: `${entry.role === "owner" ? "Delivered to" : "Requested from"} ${entry.partnerName} · Contract-backed`,
    status: "completed",
  }));

  const completedActionsItems: PersonalHomeActionItem[] =
    contractHistoryItems.length > 0
      ? contractHistoryItems
      : completedRequests.map((request) => ({
          id: request.id,
          title: request.serviceName,
          detail: `Completed with ${request.providerName} · Trust recorded`,
          status: "completed",
        }));

  const activeActions: PersonalHomeActionItem[] = [
    ...myPublishedActions.filter((action) => action.status === "published"),
    ...activeRequestsItems,
  ];

  const trustProgressDetail =
    contractHistoryEntries.length > 0
      ? `${contractHistoryEntries.length} contracted action${contractHistoryEntries.length === 1 ? "" : "s"} recorded on your passport.`
      : completedRequests.length > 0
      ? `${completedRequests.length} completed action${completedRequests.length === 1 ? "" : "s"} recorded on your passport.`
      : myPublished.length > 0
        ? `${myPublished.length} published action${myPublished.length === 1 ? "" : "s"} live in the marketplace.`
        : liveFrameDetail;

  const nextRecommendedStep =
    isNewUser
      ? myPublished.length === 0
        ? "Publish your first Action to activate the living platform loop."
        : "Open the Action Marketplace to receive your first request."
      : profileCompletion < 100
        ? "Complete your passport to unlock stronger trust signals."
        : myTeamsList.length === 0
          ? "Create a team to execute project phases with shared trust."
          : activeProjectsList.length > 0
            ? "Advance your living project — pay a phase, contract micro-actions, attach evidence."
            : activeContractsItems.length > 0
          ? "Advance your active contract — attach evidence and complete for trust growth."
          : intelligence && intelligence.inventoryTotal === 0
            ? "Discover your Action Inventory — an act converts your abilities into trusted actions."
            : intelligence && intelligence.opportunityHeadlines.length > 0
              ? intelligence.opportunityHeadlines[0]!
              : activeRequests.length > 0
          ? "Advance your active request to capture evidence and grow trust."
          : myPublished.length === 0
            ? "Publish a professional Action to appear in the marketplace."
            : completedRequests.length === 0
              ? "Request or complete an action to grow your trust score."
              : frame.next === "Max tier"
                ? "Continue completing verified actions to maintain Platinum assurance."
                : `Keep completing verified actions to progress toward ${frame.next} Live Frame.`;

  return {
    trustScore: trust.label,
    trustScoreValue: trust.value,
    professionalLevel: deriveProfessionalLevel(identity),
    profileCompletion,
    isNewUser,
    nextRecommendedStep,
    suggestedActions,
    recentActivity,
    activeActions,
    draftActions,
    myPublishedActions,
    activeRequests: activeRequestsItems,
    completedActions: completedActionsItems,
    contractHistory: contractHistoryItems,
    activeContracts: activeContractsItems,
    myTeams: myTeamsItems,
    activeProjects: activeProjectsItems,
    economyPulse,
    actionInventoryTotal: intelligence?.inventoryTotal ?? 0,
    actionInventoryReady: intelligence?.inventoryBuckets.ready_now ?? 0,
    actionInventoryGrowth: intelligence?.growthSummary ?? null,
    opportunityHeadlines: intelligence?.opportunityHeadlines ?? [],
    matchingReadyCount: intelligence?.matching.readyForContract ?? 0,
    trustProgressDetail,
    savedOpportunities: myPublished.map((action) => ({
      id: action.id,
      title: action.blueprint.name.trim(),
      provider: identity.fullName,
      liveFrameTier: action.creator.liveFrameTier,
    })),
    liveFrameProgress: {
      current: identity.liveFrameTier,
      next: frame.next,
      percent: frame.percent,
      detail: liveFrameDetail,
    },
  };
}

export function personalHomeGreeting(identity: ActivePersonalIdentity): string {
  return `${identity.firstName}'s operating home`;
}
