export type NeedMvpStage = "browse" | "detail" | "confirm" | "success" | "contract" | "tracking";

export interface OpportunitySnapshot {
  opportunityId: string;
  title: string;
  providerName: string;
  serviceName: string;
  liveFrameTier?: string;
  rating?: number;
  distanceKm?: number;
  availability?: string;
  estimatedMinutes?: number;
  estimatedCostSar?: number;
  badges?: string[];
}

export interface NeedMvpPresentationState {
  stage: NeedMvpStage;
  selectedOpportunity: OpportunitySnapshot | null;
  trackingId: string | null;
  searchLoading: boolean;
  searchKeyword: string;
}
