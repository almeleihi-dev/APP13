import type { RequestExecutor } from "../../integration/request-executor.js";

export interface ActivityCardSnapshot {
  summary: string;
  fields: Array<{ label: string; value: string }>;
}

export interface OverviewSectionSnapshot {
  title: string;
  summary: string;
  items: string[];
}

export interface PlatformOverviewSnapshots {
  activeRequests: OverviewSectionSnapshot;
  activeProviders: OverviewSectionSnapshot;
  activeContracts: OverviewSectionSnapshot;
  activeEscrows: OverviewSectionSnapshot;
  activeProjects: OverviewSectionSnapshot;
  evidenceOverview: OverviewSectionSnapshot;
  openDisputes: OverviewSectionSnapshot;
  trustSnapshot: OverviewSectionSnapshot;
}

export interface PlatformExperienceSource {
  platformId: string;
  requestActivity: ActivityCardSnapshot;
  marketplaceActivity: ActivityCardSnapshot;
  providerActivity: ActivityCardSnapshot;
  contractStatus: ActivityCardSnapshot;
  escrowStatus: ActivityCardSnapshot;
  executionStatus: ActivityCardSnapshot;
  evidenceStatus: ActivityCardSnapshot;
  disputeStatus: ActivityCardSnapshot;
  trustStatus: ActivityCardSnapshot;
  platformSummary: ActivityCardSnapshot;
  overview: PlatformOverviewSnapshots;
}

export interface PlatformHomeRequest {
  platform_id?: string;
}

export interface PlatformOverviewRequest {
  platform_id?: string;
}

export interface PlatformRequestValidationError {
  field: string;
  message: string;
}

export interface PlatformRequestValidationResult {
  valid: boolean;
  errors: PlatformRequestValidationError[];
}

export interface PlatformClientConfig {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type PlatformHomeExecutor = (request: PlatformHomeRequest) => Promise<PlatformExperienceSource>;
export type PlatformOverviewExecutor = (
  request: PlatformOverviewRequest
) => Promise<PlatformExperienceSource>;

export interface PlatformClientOptions extends PlatformClientConfig {
  homeExecutor?: PlatformHomeExecutor;
  overviewExecutor?: PlatformOverviewExecutor;
}

export interface CardField {
  label: string;
  value: string;
}

export interface ResponseCard {
  id: string;
  title: string;
  summary: string;
  fields: CardField[];
}

export interface RequestActivityCard extends ResponseCard {
  id: "request-activity";
}

export interface MarketplaceActivityCard extends ResponseCard {
  id: "marketplace-activity";
}

export interface ProviderActivityCard extends ResponseCard {
  id: "provider-activity";
}

export interface ContractStatusCard extends ResponseCard {
  id: "contract-status";
}

export interface EscrowStatusCard extends ResponseCard {
  id: "escrow-status";
}

export interface ExecutionStatusCard extends ResponseCard {
  id: "execution-status";
}

export interface EvidenceStatusCard extends ResponseCard {
  id: "evidence-status";
}

export interface DisputeStatusCard extends ResponseCard {
  id: "dispute-status";
}

export interface TrustStatusCard extends ResponseCard {
  id: "trust-status";
}

export interface PlatformSummaryCard extends ResponseCard {
  id: "platform-summary";
}

export interface PlatformHomeView {
  platform_id: string;
  request_activity: RequestActivityCard;
  marketplace_activity: MarketplaceActivityCard;
  provider_activity: ProviderActivityCard;
  contract_status: ContractStatusCard;
  escrow_status: EscrowStatusCard;
  execution_status: ExecutionStatusCard;
  evidence_status: EvidenceStatusCard;
  dispute_status: DisputeStatusCard;
  trust_status: TrustStatusCard;
  platform_summary: PlatformSummaryCard;
}

export interface OverviewSectionView {
  id: string;
  title: string;
  summary: string;
  items: string[];
}

export interface PlatformOverviewView {
  platform_id: string;
  active_requests: OverviewSectionView;
  active_providers: OverviewSectionView;
  active_contracts: OverviewSectionView;
  active_escrows: OverviewSectionView;
  active_projects: OverviewSectionView;
  evidence_overview: OverviewSectionView;
  open_disputes: OverviewSectionView;
  trust_snapshot: OverviewSectionView;
}

export interface PlatformHomePageModel {
  page_id: "platform-home";
  title: string;
  description: string;
  view: PlatformHomeView;
}

export interface PlatformOverviewPageModel {
  page_id: "platform-overview";
  title: string;
  description: string;
  view: PlatformOverviewView;
}

export interface PlatformHomeResult {
  source: PlatformExperienceSource;
  view: PlatformHomeView;
}

export interface PlatformOverviewResult {
  source: PlatformExperienceSource;
  view: PlatformOverviewView;
}
