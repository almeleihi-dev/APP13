import type { ActionBlueprintForm } from "../../components/action-creator/types.js";

export const LIVING_PLATFORM_STORAGE_KEY = "an-act-living-platform-v1";
export const LIVING_PLATFORM_UPDATED_EVENT = "an-act-living-platform-updated";

export type ActionRequestStatus = "requested" | "accepted" | "in_progress" | "completed" | "cancelled";

export type AgreementState = "pending_acceptance" | "accepted" | "completed" | "cancelled";

export type ExecutionState =
  | "awaiting_acceptance"
  | "in_progress"
  | "evidence_pending"
  | "evidence_confirmed"
  | "completed";

export type EvidenceStatus = "pending" | "attached" | "confirmed";

export interface ContractParty {
  passportKey: string;
  fullName: string;
  professionalTitle?: string;
  photoUrl?: string;
  liveFrameTier: string;
  location?: string;
}

export interface ActionContractDetails {
  name: string;
  purpose: string;
  deliverables: string;
  successCriteria: string;
  estimatedDuration: string;
  evidenceRequirements: string;
}

export interface ContractEvidence {
  id: string;
  label: string;
  description: string;
  status: EvidenceStatus;
  attachedAt: string;
  confirmedAt?: string;
  confirmedBy?: "owner" | "requester";
}

export type TeamMemberRole = "leader" | "coordinator" | "contributor" | "specialist";

export interface TeamMember {
  passportKey: string;
  fullName: string;
  professionalTitle?: string;
  photoUrl?: string;
  role: TeamMemberRole;
  skills: string[];
  joinedAt: string;
}

export type ServiceAvailability = "remote" | "local" | "hybrid";

export type ActionExecutionLocation = "remote" | "local" | "hybrid";

export type MarketplaceLocationScope = "near_me" | "same_city" | "same_country" | "worldwide";

export interface GeoLocationProfile {
  country: string;
  city: string;
  region: string;
  timeZone: string;
  serviceRadiusKm: number | null;
  availability: ServiceAvailability;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ProjectLocationProfile {
  country: string;
  city: string;
  remoteTeamPossible: boolean;
  localTeamRequired: boolean;
}

export interface TeamGlobalCapability {
  teamLocations: string[];
  languagesSpoken: string[];
  coverage: Array<"local" | "country" | "global">;
  availability: ServiceAvailability;
}

export interface MarketplaceLocationFilters {
  scope: MarketplaceLocationScope;
  country?: string;
  city?: string;
  language?: string;
  remoteOnly?: boolean;
}

export interface TeamPassport {
  teamId: string;
  name: string;
  members: TeamMember[];
  leaderPassportKey: string;
  combinedSkills: string[];
  completedActions: number;
  trustIndicators: string[];
  liveFrameTier: "Silver" | "Gold" | "Platinum";
  trustScore: number;
  reliabilityScore: number;
  globalCapability: TeamGlobalCapability;
  createdAt: string;
  updatedAt: string;
}

export type ProjectExecutionPath = "fast" | "balanced" | "step_by_step";

export type ProjectPhaseStatus = "locked" | "available" | "in_progress" | "completed";

export type MicroActionStatus =
  | "pending"
  | "contracted"
  | "in_progress"
  | "evidence_pending"
  | "completed";

export type MicroActionContractScope = "individual" | "team";

export interface ProjectPhaseEvidence {
  id: string;
  label: string;
  description: string;
  attachedAt: string;
  confirmedAt?: string;
}

export interface MicroAction {
  microActionId: string;
  name: string;
  ownerPassportKey: string | null;
  teamId: string | null;
  contractScope: MicroActionContractScope;
  estimatedCost: number;
  estimatedDays: number;
  contractId: string | null;
  evidenceIds: string[];
  status: MicroActionStatus;
}

export interface ProjectSubPhase {
  subPhaseId: string;
  name: string;
  microActions: MicroAction[];
}

export interface ProjectPhase {
  phaseId: string;
  name: string;
  order: number;
  status: ProjectPhaseStatus;
  subPhases: ProjectSubPhase[];
  estimatedCost: number;
  estimatedDays: number;
  paidAmount: number;
  evidence: ProjectPhaseEvidence[];
  completedAt?: string;
}

export type ProjectExecutionStatus = "planning" | "executing" | "paused" | "completed";

export interface LivingProject {
  projectId: string;
  goal: string;
  name: string;
  templateId: string;
  teamId: string | null;
  creatorPassportKey: string;
  selectedPath: ProjectExecutionPath;
  phases: ProjectPhase[];
  progressPercent: number;
  completedPhaseCount: number;
  activeContractIds: string[];
  evidenceHistory: ProjectPhaseEvidence[];
  riskIndicators: string[];
  trustLevel: number;
  executionStatus: ProjectExecutionStatus;
  liveFrameHealth: "healthy" | "watch" | "at_risk";
  projectLocation: ProjectLocationProfile;
  createdAt: string;
  updatedAt: string;
}

export interface ActionContract {
  contractId: string;
  requestId: string;
  trackingId: string;
  publishedActionId: string | null;
  opportunityId: string;
  actionOwner: ContractParty;
  requester: ContractParty;
  actionDetails: ActionContractDetails;
  agreementState: AgreementState;
  executionState: ExecutionState;
  progressStep: number;
  evidence: ContractEvidence[];
  projectId?: string | null;
  microActionId?: string | null;
  teamId?: string | null;
  contractScope?: MicroActionContractScope;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface PassportContractHistoryEntry {
  contractId: string;
  actionName: string;
  role: "owner" | "requester";
  partnerName: string;
  completedAt: string;
}

export interface ActionCreatorIdentity {
  passportKey: string;
  fullName: string;
  professionalTitle: string;
  photoUrl?: string;
  liveFrameTier: string;
  classification: string;
  trustIndicators: string[];
  certifications: string[];
  mainSkill: string;
  location: string;
}

export interface PublishedProfessionalAction {
  id: string;
  status: "published";
  blueprint: ActionBlueprintForm;
  qualityScore: number;
  creator: ActionCreatorIdentity;
  publishedAt: string;
  updatedAt: string;
}

export interface ActionBlueprintDraftRecord {
  id: string;
  blueprint: ActionBlueprintForm;
  qualityScore: number;
  savedAt: string;
}

export interface ActionServiceRequest {
  id: string;
  trackingId: string;
  publishedActionId: string | null;
  opportunityId: string;
  serviceName: string;
  providerName: string;
  requesterName: string;
  requesterPassportKey: string;
  creatorPassportKey: string | null;
  status: ActionRequestStatus;
  progressStep: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface LivingPlatformActivity {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  kind:
    | "publish"
    | "request"
    | "progress"
    | "complete"
    | "trust"
    | "contract"
    | "evidence"
    | "team"
    | "project"
    | "economy"
    | "inventory"
    | "opportunity"
    | "growth";
}

export type ActionInventoryStatus = "discovered" | "active" | "removed" | "edited";

export type ActionInventoryBucket = "ready_now" | "needs_verification" | "unlockable";

export type ActionInventorySourceType =
  | "skill"
  | "certificate"
  | "license"
  | "experience"
  | "talent"
  | "contract";

export type MarketDemandLevel = "low" | "moderate" | "high";

export type TrustRequirementLevel = "standard" | "elevated" | "verified";

export interface ActionInventoryItem {
  inventoryId: string;
  title: string;
  description: string;
  confidenceScore: number;
  bucket: ActionInventoryBucket;
  requiredProof: string;
  marketDemand: MarketDemandLevel;
  estimatedValue: number;
  trustRequirement: TrustRequirementLevel;
  sourceSkill?: string;
  sourceType: ActionInventorySourceType;
  status: ActionInventoryStatus;
  executionLocation?: ActionExecutionLocation;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PassportGrowthEvent {
  eventId: string;
  kind: "certificate" | "course" | "experience" | "contract";
  label: string;
  unlockedActionCount: number;
  unlockedActionTitles: string[];
  detectedAt: string;
}

export interface OpportunityAlert {
  alertId: string;
  actionTitle: string;
  category: string;
  demandChangePercent: number;
  qualifies: boolean;
  recommendations: string[];
}

export interface ActionMatchCandidate {
  matchId: string;
  needActionName: string;
  needRequestId?: string;
  supplyInventoryId: string;
  supplyTitle: string;
  confidenceScore: number;
  contractReady: boolean;
  suggestedContractValue: number;
}

export interface LivingPlatformState {
  version: 6;
  publishedActions: PublishedProfessionalAction[];
  drafts: ActionBlueprintDraftRecord[];
  requests: ActionServiceRequest[];
  contracts: ActionContract[];
  passportHistory: Record<string, PassportContractHistoryEntry[]>;
  teams: TeamPassport[];
  projects: LivingProject[];
  economySignals: ContractEconomySignal[];
  actionInventory: ActionInventoryItem[];
  passportGrowthEvents: PassportGrowthEvent[];
  opportunityAlerts: OpportunityAlert[];
  activity: LivingPlatformActivity[];
}

export type ContractEconomyScope = "individual" | "team" | "project";

export interface ContractEconomySignal {
  signalId: string;
  contractId: string;
  actionCategory: string;
  actionName: string;
  scope: ContractEconomyScope;
  contractValue: number;
  executionDays: number;
  evidenceConfirmed: boolean;
  evidenceQuality: number;
  providerPassportKey: string;
  requesterPassportKey: string;
  reliabilityScore: number;
  completedAt: string;
}

export interface ContractEconomyLedger {
  totalCreated: number;
  active: number;
  completed: number;
  failedCancelled: number;
  totalContractValue: number;
  completedContractValue: number;
  completionRate: number;
  averageExecutionDays: number;
  evidenceConfirmationRate: number;
  byScope: Record<ContractEconomyScope, number>;
}

export interface ActionIntelligenceProfile {
  category: string;
  demand: number;
  supply: number;
  averageMarketValue: number;
  averageDeliveryDays: number;
  reliability: number;
  successRate: number;
  shortageSignal: boolean;
  contractCount: number;
  summary: string;
}

export type ActionValueGuidance = "low" | "fair" | "premium";

export interface ActionValueRecommendation {
  actionName: string;
  category: string;
  guidance: ActionValueGuidance;
  suggestedLow: number;
  suggestedFair: number;
  suggestedPremium: number;
  factors: string[];
}

export interface RareActionSignal {
  category: string;
  label: string;
  demandTrend: "up" | "stable" | "down";
  supplyTrend: "up" | "down";
  trustRequirement: "elevated" | "standard";
  valueTrend: "up" | "stable";
  rationale: string;
}

export interface PlatformRevenueMetrics {
  grossContractValue: number;
  platformRevenueEstimate: number;
  averageContractValue: number;
  contractsPerDay: number;
  contractsPerMinute: number;
  platformFeePercent: number;
  economyGrowthIndex: number;
}

export interface InsuranceReadinessProfile {
  overallReadiness: number;
  riskLevel: "low" | "moderate" | "elevated";
  disputeFrequency: number;
  failureRate: number;
  verifiedEvidencePercent: number;
  providerReliability: number;
  readinessSignals: string[];
}

export interface EconomyDashboardPresentation {
  ledger: ContractEconomyLedger;
  actionProfiles: ActionIntelligenceProfile[];
  trendingActions: ActionIntelligenceProfile[];
  rareActions: RareActionSignal[];
  valueRecommendations: ActionValueRecommendation[];
  revenue: PlatformRevenueMetrics;
  insurance: InsuranceReadinessProfile;
  trustedHumans: Array<{ name: string; reliability: number; contracts: number }>;
  trustedTeams: Array<{ name: string; trustScore: number; completedActions: number }>;
  trustedProjects: Array<{ name: string; trustLevel: number; progressPercent: number }>;
  platformHealth: {
    growth: string;
    reliability: string;
    risk: string;
  };
}

export const REQUEST_PROGRESS_LABELS = [
  "Request submitted",
  "Provider notified",
  "Action in progress",
  "Evidence captured",
  "Action completed",
] as const;

export const PROJECT_PATH_LABELS: Record<ProjectExecutionPath, string> = {
  fast: "Fast Path",
  balanced: "Balanced Path",
  step_by_step: "Step-by-Step Path",
};

export const PROJECT_PATH_DESCRIPTIONS: Record<ProjectExecutionPath, string> = {
  fast: "More resources · shorter time · higher cost",
  balanced: "Optimized balance of cost and time",
  step_by_step: "Execute based on available budget — pay per phase",
};

export const PLATFORM_FEE_PERCENT = 8;

export const CONTRACT_PROGRESS_LABELS = [
  "Contract generated",
  "Agreement accepted",
  "Execution in progress",
  "Evidence attached",
  "Evidence confirmed",
  "Contract completed",
] as const;
