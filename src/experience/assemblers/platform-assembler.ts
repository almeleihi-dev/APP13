import type { PlatformExperienceSource } from "../../ui/platform/types.js";

export interface PlatformAssemblyInput {
  platformId: string;
  contractCount: number;
  activeContracts: number;
  escrowCount: number;
  openDisputes: number;
  providerCount: number;
  evidenceCount: number;
  featuredProviderId?: string;
}

function activityCard(summary: string, fields: Array<{ label: string; value: string }>) {
  return { summary, fields };
}

export function assemblePlatformExperienceSource(input: PlatformAssemblyInput): PlatformExperienceSource {
  const overview = {
    activeRequests: {
      title: "Active Requests",
      summary: `${input.contractCount} contracts`,
      items: [`${input.contractCount} tracked contracts`],
    },
    activeProviders: {
      title: "Active Providers",
      summary: `${input.providerCount} providers`,
      items: input.featuredProviderId ? [`Featured ${input.featuredProviderId}`] : [],
    },
    activeContracts: {
      title: "Active Contracts",
      summary: `${input.activeContracts} active`,
      items: [`${input.activeContracts} in execution`],
    },
    activeEscrows: {
      title: "Active Escrows",
      summary: `${input.escrowCount} escrows`,
      items: [`${input.escrowCount} escrow agreements`],
    },
    activeProjects: {
      title: "Active Projects",
      summary: `${input.activeContracts} projects`,
      items: [`${input.activeContracts} active projects`],
    },
    evidenceOverview: {
      title: "Evidence Overview",
      summary: `${input.evidenceCount} items`,
      items: [`${input.evidenceCount} evidence records`],
    },
    openDisputes: {
      title: "Open Disputes",
      summary: `${input.openDisputes} open`,
      items: [`${input.openDisputes} open disputes`],
    },
    trustSnapshot: {
      title: "Trust Snapshot",
      summary: input.featuredProviderId ? "available" : "pending",
      items: input.featuredProviderId ? [`Provider ${input.featuredProviderId}`] : [],
    },
  };

  return {
    platformId: input.platformId,
    requestActivity: activityCard("ready", [
      { label: "Active Requests", value: String(input.contractCount) },
      { label: "Workflow Status", value: "ready" },
    ]),
    marketplaceActivity: activityCard(`${input.providerCount} providers`, [
      { label: "Search Results", value: String(input.providerCount) },
      { label: "Category", value: "mixed" },
    ]),
    providerActivity: activityCard("providers", [
      { label: "Active Providers", value: String(input.providerCount) },
      { label: "Featured Provider", value: input.featuredProviderId ?? "—" },
    ]),
    contractStatus: activityCard(`${input.activeContracts} active`, [
      { label: "Active Contracts", value: String(input.activeContracts) },
      { label: "Total Contracts", value: String(input.contractCount) },
    ]),
    escrowStatus: activityCard(`${input.escrowCount} escrows`, [
      { label: "Escrow Agreements", value: String(input.escrowCount) },
      { label: "Status", value: input.escrowCount > 0 ? "active" : "none" },
    ]),
    executionStatus: activityCard(`${input.activeContracts} executing`, [
      { label: "Active Projects", value: String(input.activeContracts) },
      { label: "Execution", value: "in_progress" },
    ]),
    evidenceStatus: activityCard(`${input.evidenceCount} items`, [
      { label: "Evidence Items", value: String(input.evidenceCount) },
      { label: "Health", value: input.evidenceCount > 0 ? "stable" : "empty" },
    ]),
    disputeStatus: activityCard(`${input.openDisputes} open`, [
      { label: "Open Disputes", value: String(input.openDisputes) },
      { label: "Status", value: input.openDisputes > 0 ? "attention" : "clear" },
    ]),
    trustStatus: activityCard("trust", [
      { label: "Featured Provider", value: input.featuredProviderId ?? "—" },
      { label: "Trust Center", value: "available" },
    ]),
    platformSummary: activityCard("platform home", [
      { label: "Platform ID", value: input.platformId },
      { label: "Modules", value: "P1-P10" },
    ]),
    overview,
  };
}
