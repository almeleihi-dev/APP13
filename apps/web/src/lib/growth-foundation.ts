/**
 * Chapter 7 Sprint 3 — Growth Foundation (client-only operator layer).
 * Early access, invitations, waitlist, referrals, marketplace activation readiness.
 */

import { getPilotManagementSnapshot, type PilotCohortId } from "./pilot-management.js";

export type GrowthPersona = "customers" | "professionals" | "partners" | "investors" | "government-stakeholders";
export type EarlyAccessStatus = "controlled" | "expanding" | "closed";
export type WaitlistPriority = "high" | "medium" | "low";
export type ActivationSignal = "ready" | "building" | "blocked";

const INVITATIONS_KEY = "an-act-growth-invitations-v1";
const WAITLIST_KEY = "an-act-growth-waitlist-v1";
const REFERRALS_KEY = "an-act-growth-referrals-v1";

export interface InvitationBatch {
  id: GrowthPersona;
  label: string;
  invited: number;
  accepted: number;
  activated: number;
  blocked: number;
  followUpNeeded: boolean;
}

export interface WaitlistEntry {
  id: string;
  persona: GrowthPersona;
  source: string;
  readiness: "ready" | "conditional" | "not-started";
  priority: WaitlistPriority;
  expectedValue: string;
  nextAction: string;
  createdAt: number;
}

export interface ReferralSignal {
  id: string;
  referrerLabel: string;
  targetPersona: GrowthPersona;
  confidence: 1 | 2 | 3 | 4 | 5;
  reason: string;
  recommendedFollowUp: string;
  createdAt: number;
}

export interface EarlyAccessOverview {
  status: EarlyAccessStatus;
  invitedUsers: number;
  acceptedInvitations: number;
  pendingInvitations: number;
  waitlistInterest: number;
  pilotToGrowthReadiness: number;
}

export interface MarketplaceActivationSummary {
  enoughCustomers: ActivationSignal;
  enoughProfessionals: ActivationSignal;
  launchCategoryFirst: string;
  supplyDemandImbalance: string;
  nextActivationMove: string;
}

export interface GrowthFoundationSnapshot {
  generatedAt: string;
  earlyAccess: EarlyAccessOverview;
  invitationBatches: InvitationBatch[];
  waitlist: WaitlistEntry[];
  referrals: ReferralSignal[];
  activation: MarketplaceActivationSummary;
  hasOperatorData: boolean;
}

export interface WaitlistInput {
  persona: GrowthPersona;
  source: string;
  readiness: WaitlistEntry["readiness"];
  priority: WaitlistPriority;
  expectedValue: string;
  nextAction: string;
}

export interface ReferralInput {
  referrerLabel: string;
  targetPersona: GrowthPersona;
  confidence: 1 | 2 | 3 | 4 | 5;
  reason: string;
  recommendedFollowUp: string;
}

const PERSONA_LABELS: Record<GrowthPersona, string> = {
  customers: "Customers",
  professionals: "Professionals",
  partners: "Partners",
  investors: "Investors",
  "government-stakeholders": "Government stakeholders",
};

const COHORT_TO_PERSONA: Record<PilotCohortId, GrowthPersona> = {
  "first-customers": "customers",
  "first-professionals": "professionals",
  "enterprise-partners": "partners",
  investors: "investors",
  "government-stakeholders": "government-stakeholders",
};

const DEFAULT_INVITATION_BATCHES: InvitationBatch[] = [
  { id: "customers", label: "Customers", invited: 12, accepted: 8, activated: 6, blocked: 0, followUpNeeded: false },
  { id: "professionals", label: "Professionals", invited: 8, accepted: 4, activated: 2, blocked: 1, followUpNeeded: true },
  { id: "partners", label: "Partners", invited: 5, accepted: 4, activated: 3, blocked: 0, followUpNeeded: false },
  { id: "investors", label: "Investors", invited: 6, accepted: 5, activated: 4, blocked: 0, followUpNeeded: false },
  { id: "government-stakeholders", label: "Government stakeholders", invited: 3, accepted: 1, activated: 0, blocked: 0, followUpNeeded: true },
];

const DEFAULT_WAITLIST: WaitlistEntry[] = [
  {
    id: "waitlist-customer-1",
    persona: "customers",
    source: "Partner referral signal",
    readiness: "ready",
    priority: "high",
    expectedValue: "Need journey validation in Riyadh",
    nextAction: "Invite to next customer cohort",
    createdAt: Date.now() - 86_400_000,
  },
  {
    id: "waitlist-professional-1",
    persona: "professionals",
    source: "Pilot feedback follow-up",
    readiness: "conditional",
    priority: "medium",
    expectedValue: "Electrical services supply",
    nextAction: "Schedule guided onboarding",
    createdAt: Date.now() - 172_800_000,
  },
];

let testStore: Record<string, unknown> | null = null;

function loadJson<T>(key: string, fallback: T): T {
  if (testStore && key in testStore) {
    return testStore[key] as T;
  }
  if (typeof localStorage === "undefined") {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  if (testStore) {
    testStore[key] = value;
    return;
  }
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

function loadInvitationBatches(): InvitationBatch[] {
  const stored = loadJson<InvitationBatch[] | null>(INVITATIONS_KEY, null);
  if (stored && stored.length > 0) {
    return stored;
  }
  return DEFAULT_INVITATION_BATCHES.map((batch) => ({ ...batch }));
}

function loadWaitlist(): WaitlistEntry[] {
  const stored = loadJson<WaitlistEntry[]>(WAITLIST_KEY, []);
  if (stored.length > 0) {
    return stored;
  }
  return DEFAULT_WAITLIST.map((entry) => ({ ...entry }));
}

function loadReferrals(): ReferralSignal[] {
  return loadJson<ReferralSignal[]>(REFERRALS_KEY, []);
}

function syncInvitationsFromPilot(batches: InvitationBatch[]): InvitationBatch[] {
  const pilot = getPilotManagementSnapshot();
  return batches.map((batch) => {
    const cohortIds = (Object.keys(COHORT_TO_PERSONA) as PilotCohortId[]).filter(
      (cohortId) => COHORT_TO_PERSONA[cohortId] === batch.id
    );
    const sessions = pilot.sessions.filter((session) => cohortIds.includes(session.cohortId));
    const activated = sessions.filter((session) => session.outcome === "success").length;
    const blocked = sessions.filter((session) => session.outcome === "blocked" || session.outcome === "abandoned").length;
    const accepted = Math.max(batch.accepted, sessions.length);
    const invited = Math.max(batch.invited, accepted);
    return {
      ...batch,
      invited,
      accepted,
      activated: Math.max(batch.activated, activated),
      blocked: Math.max(batch.blocked, blocked),
      followUpNeeded: batch.followUpNeeded || blocked > 0 || batch.accepted < batch.invited,
    };
  });
}

function buildEarlyAccessOverview(batches: InvitationBatch[], waitlist: WaitlistEntry[]): EarlyAccessOverview {
  const invitedUsers = batches.reduce((sum, batch) => sum + batch.invited, 0);
  const acceptedInvitations = batches.reduce((sum, batch) => sum + batch.accepted, 0);
  const pendingInvitations = Math.max(0, invitedUsers - acceptedInvitations);
  const pilot = getPilotManagementSnapshot();
  const successful = pilot.readiness.successfulJourneys;
  const blocked = pilot.readiness.blockedJourneys;
  const pilotToGrowthReadiness = Math.min(
    100,
    Math.round(
      (acceptedInvitations / Math.max(invitedUsers, 1)) * 40 +
        (successful / Math.max(successful + blocked, 1)) * 40 +
        (waitlist.length > 0 ? 20 : 10)
    )
  );

  let status: EarlyAccessStatus = "controlled";
  if (pilotToGrowthReadiness >= 75 && pendingInvitations <= invitedUsers * 0.3) {
    status = "expanding";
  }
  if (blocked > successful && blocked >= 3) {
    status = "closed";
  }

  return {
    status,
    invitedUsers,
    acceptedInvitations,
    pendingInvitations,
    waitlistInterest: waitlist.length,
    pilotToGrowthReadiness,
  };
}

function buildActivationSummary(batches: InvitationBatch[], waitlist: WaitlistEntry[]): MarketplaceActivationSummary {
  const customers = batches.find((batch) => batch.id === "customers");
  const professionals = batches.find((batch) => batch.id === "professionals");
  const customerActivated = customers?.activated ?? 0;
  const professionalActivated = professionals?.activated ?? 0;

  const enoughCustomers: ActivationSignal =
    customerActivated >= 5 ? "ready" : customerActivated >= 2 ? "building" : "blocked";
  const enoughProfessionals: ActivationSignal =
    professionalActivated >= 3 ? "ready" : professionalActivated >= 1 ? "building" : "blocked";

  const demandWaitlist = waitlist.filter((entry) => entry.persona === "customers").length;
  const supplyWaitlist = waitlist.filter((entry) => entry.persona === "professionals").length;

  let launchCategoryFirst = "Customer Need journey";
  if (enoughCustomers === "ready" && enoughProfessionals !== "ready") {
    launchCategoryFirst = "Professional supply onboarding";
  }
  if (enoughCustomers !== "ready" && enoughProfessionals === "ready") {
    launchCategoryFirst = "Customer acquisition cohort";
  }

  let supplyDemandImbalance = "Balanced — monitor both sides";
  if (demandWaitlist > supplyWaitlist + 1) {
    supplyDemandImbalance = "Demand-heavy — prioritize professional invitations";
  } else if (supplyWaitlist > demandWaitlist + 1) {
    supplyDemandImbalance = "Supply-heavy — prioritize customer invitations";
  }

  let nextActivationMove = "Continue controlled pilot with customer cohort";
  if (enoughCustomers === "ready" && enoughProfessionals === "ready") {
    nextActivationMove = "Prepare limited marketplace activation for one category";
  } else if (enoughProfessionals !== "ready") {
    nextActivationMove = "Invite and activate more professionals before expanding customers";
  }

  return {
    enoughCustomers,
    enoughProfessionals,
    launchCategoryFirst,
    supplyDemandImbalance,
    nextActivationMove,
  };
}

export function addWaitlistEntry(input: WaitlistInput): WaitlistEntry {
  const entry: WaitlistEntry = {
    id: `waitlist-${Date.now().toString(36)}`,
    persona: input.persona,
    source: input.source.trim(),
    readiness: input.readiness,
    priority: input.priority,
    expectedValue: input.expectedValue.trim(),
    nextAction: input.nextAction.trim(),
    createdAt: Date.now(),
  };
  saveJson(WAITLIST_KEY, [entry, ...loadWaitlist()]);
  return entry;
}

export function addReferralSignal(input: ReferralInput): ReferralSignal {
  const signal: ReferralSignal = {
    id: `referral-${Date.now().toString(36)}`,
    referrerLabel: input.referrerLabel.trim(),
    targetPersona: input.targetPersona,
    confidence: input.confidence,
    reason: input.reason.trim(),
    recommendedFollowUp: input.recommendedFollowUp.trim(),
    createdAt: Date.now(),
  };
  saveJson(REFERRALS_KEY, [signal, ...loadReferrals()]);
  return signal;
}

export function updateInvitationBatch(id: GrowthPersona, patch: Partial<Omit<InvitationBatch, "id" | "label">>): void {
  const next = loadInvitationBatches().map((batch) => (batch.id === id ? { ...batch, ...patch } : batch));
  saveJson(INVITATIONS_KEY, next);
}

export function getGrowthFoundationSnapshot(now = Date.now()): GrowthFoundationSnapshot {
  const waitlist = loadWaitlist();
  const referrals = loadReferrals();
  const invitationBatches = syncInvitationsFromPilot(loadInvitationBatches());
  const earlyAccess = buildEarlyAccessOverview(invitationBatches, waitlist);
  const activation = buildActivationSummary(invitationBatches, waitlist);

  return {
    generatedAt: new Date(now).toISOString(),
    earlyAccess,
    invitationBatches,
    waitlist,
    referrals,
    activation,
    hasOperatorData:
      referrals.length > 0 ||
      waitlist.some((entry) => !entry.id.startsWith("waitlist-customer-1") && !entry.id.startsWith("waitlist-professional-1")) ||
      loadJson<boolean>("an-act-growth-customized-v1", false),
  };
}

export function personaOptions(): Array<{ id: GrowthPersona; label: string }> {
  return (Object.keys(PERSONA_LABELS) as GrowthPersona[]).map((id) => ({ id, label: PERSONA_LABELS[id] }));
}

export function earlyAccessStatusLabel(status: EarlyAccessStatus): string {
  if (status === "controlled") {
    return "Controlled early access";
  }
  if (status === "expanding") {
    return "Expanding early access";
  }
  return "Early access paused";
}

export function activationSignalLabel(signal: ActivationSignal): string {
  if (signal === "ready") {
    return "Ready";
  }
  if (signal === "building") {
    return "Building";
  }
  return "Blocked";
}

export function resetGrowthFoundationForTests(): void {
  testStore = {};
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(INVITATIONS_KEY);
    localStorage.removeItem(WAITLIST_KEY);
    localStorage.removeItem(REFERRALS_KEY);
    localStorage.removeItem("an-act-growth-customized-v1");
  }
}

export { PERSONA_LABELS };
