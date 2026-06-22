import type { Queryable } from "../../../shared/db/index.js";
import { platformAnalyticsRepository } from "../../../analytics/infrastructure/platform-analytics-repository.js";
import { adminConsoleRepository } from "../../../operations/infrastructure/admin-console-repository.js";
import { liveFrameExperienceRepository } from "../../live-frame/infrastructure/live-frame-experience-repository.js";
import {
  buildContractOverview,
  buildEscrowOverview,
  buildExecutionOverview,
  buildIssueOverview,
  buildOfferOverview,
  buildPlatformOverview,
  buildRequestOverview,
  buildRiskOverview,
  buildTrustOverview,
} from "../../../operations/domain/admin-console.js";
import type { PlatformControlTowerRawSnapshot } from "../domain/platform-control-tower.js";

export class PlatformControlTowerRepository {
  async loadRawSnapshot(client: Queryable): Promise<PlatformControlTowerRawSnapshot> {
    const [
      analyticsSnapshot,
      requestMetrics,
      offerMetrics,
      contractMetrics,
      escrowMetrics,
      executionMetrics,
      issueMetrics,
      trustMetrics,
      riskMetrics,
      platformTrustContext,
    ] = await Promise.all([
      platformAnalyticsRepository.loadSnapshot(client),
      adminConsoleRepository.getRequestMetrics(client),
      adminConsoleRepository.getOfferMetrics(client),
      adminConsoleRepository.getContractMetrics(client),
      adminConsoleRepository.getEscrowMetrics(client),
      adminConsoleRepository.getExecutionMetrics(client),
      adminConsoleRepository.getIssueMetrics(client),
      adminConsoleRepository.getTrustMetrics(client),
      adminConsoleRepository.getRiskMetrics(client),
      liveFrameExperienceRepository.getPlatformTrustContext(client),
    ]);

    const platformOverview = buildPlatformOverview({
      requests: buildRequestOverview(requestMetrics),
      offers: buildOfferOverview(offerMetrics),
      contracts: buildContractOverview(contractMetrics),
      escrow: buildEscrowOverview(escrowMetrics),
      execution: buildExecutionOverview(executionMetrics),
      issues: buildIssueOverview(issueMetrics),
      trust: buildTrustOverview(trustMetrics),
      risks: buildRiskOverview(riskMetrics),
      failedOperations: riskMetrics.failedOperations,
    });

    return {
      analyticsSnapshot,
      platformOverview,
      platformTrustContext,
    };
  }
}

export const platformControlTowerRepository = new PlatformControlTowerRepository();
