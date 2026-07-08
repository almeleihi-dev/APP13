import { MVP_PLATFORM_HOME_SOURCE } from "../../ui/platform/platform-payload.js";
import type { PlatformExperienceSource } from "../../ui/platform/types.js";
import {
  createPlatformHomePageModel,
  renderPlatformHomePage,
} from "../../ui/pages/platform-home.js";
import {
  createPlatformOverviewPageModel,
  renderPlatformOverviewPage,
} from "../../ui/pages/platform-overview.js";
import {
  createContractSummaryPageModel,
  renderContractSummaryPage,
} from "../../ui/pages/contract-summary.js";
import {
  createMarketplaceResultsPageModel,
  renderMarketplaceResultsPage,
} from "../../ui/pages/marketplace-results.js";
import {
  createProviderDashboardPageModel,
  renderProviderDashboardPage,
} from "../../ui/pages/provider-dashboard.js";
import {
  createExecutionDashboardPageModel,
  renderExecutionDashboardPage,
} from "../../ui/pages/execution-dashboard.js";
import {
  createTrustCenterPageModel,
  renderTrustCenterPage,
} from "../../ui/pages/trust-center.js";
import {
  createDisputeDashboardPageModel,
  renderDisputeDashboardPage,
} from "../../ui/pages/dispute-dashboard.js";
import {
  createMarketplaceSearchPageModel,
  renderMarketplaceSearchPage,
} from "../../ui/pages/marketplace-search.js";
import {
  createContractReviewPageModel,
  renderContractReviewPage,
} from "../../ui/pages/contract-review.js";
import {
  createRequestAnalysisPageModel,
  renderRequestAnalysisPage,
} from "../../ui/pages/request-analysis.js";
import {
  createRequestResultPageModel,
  renderWorkflowResultPage,
} from "../../ui/pages/request-result.js";
import {
  createEscrowOverviewPageModel,
  renderEscrowOverviewPage,
} from "../../ui/pages/escrow-overview.js";
import {
  createEscrowHistoryPageModel,
  renderEscrowHistoryPage,
} from "../../ui/pages/escrow-history.js";
import {
  createEvidenceOverviewPageModel,
  renderEvidenceOverviewPage,
} from "../../ui/pages/evidence-overview.js";
import {
  createEvidenceDetailsPageModel,
  renderEvidenceDetailsPage,
} from "../../ui/pages/evidence-details.js";
import {
  createAttestationTimelinePageModel,
  renderAttestationTimelinePage,
} from "../../ui/pages/attestation-timeline.js";
import {
  createMilestoneDetailsPageModel,
  renderMilestoneDetailsPage,
} from "../../ui/pages/milestone-details.js";
import {
  createDisputeDetailsPageModel,
  renderDisputeDetailsPage,
} from "../../ui/pages/dispute-details.js";
import {
  createResolutionTimelinePageModel,
  renderResolutionTimelinePage,
} from "../../ui/pages/resolution-timeline.js";
import {
  createProviderProfilePageModel,
  renderProviderProfilePage,
} from "../../ui/pages/provider-profile.js";
import {
  createProviderTrustReportPageModel,
  renderProviderTrustReportPage,
} from "../../ui/pages/provider-trust-report.js";
import {
  createTrustTimelinePageModel,
  renderTrustTimelinePage,
} from "../../ui/pages/trust-timeline.js";
import { MVP_ACTIVE_EXECUTION_SOURCE } from "../../ui/execution/execution-payload.js";
import {
  buildBrowserDocumentHtml,
  renderLoginSurfacePage,
  renderOperatorExperienceLinks,
} from "../domain/browser-surface.js";
import {
  buildBrowserDemoContractContext,
  buildBrowserDemoContractWorkflow,
  buildBrowserDemoMarketplaceProviders,
  buildBrowserDemoMarketplaceSearch,
  buildBrowserDemoMarketplaceWorkflow,
  buildBrowserDemoProviderId,
  buildBrowserDemoProviderProfile,
} from "../domain/browser-hub-fixtures.js";
import {
  renderContractsHubLinks,
  renderCustomerHubPage,
  renderMarketplaceResultsLink,
} from "../domain/browser-hub-pages.js";
import {
  renderBrowserSurfaceCatalog,
  renderDetailCrossLinks,
} from "../domain/browser-detail-pages.js";
import {
  buildBrowserDemoContractReview,
  buildBrowserDemoCustomerRequest,
  buildBrowserDemoEvidenceContractId,
  MVP_DISPUTE_ID,
  MVP_EVIDENCE_ID_DOC,
  MVP_EVIDENCE_OVERVIEW_SOURCE,
  MVP_MILESTONE_ESCROW_SOURCE,
  MVP_MILESTONE_WIP_ID,
  MVP_OPEN_DISPUTE_SOURCE,
  MVP_TRUST_CENTER_SOURCE,
  MVP_TRUST_PROVIDER_ID,
} from "../domain/browser-detail-fixtures.js";

export class BrowserSurfaceService {
  private readonly demoContractWorkflow = buildBrowserDemoContractWorkflow();
  private readonly demoContractContext = buildBrowserDemoContractContext(this.demoContractWorkflow);
  private readonly demoMarketplaceWorkflow = buildBrowserDemoMarketplaceWorkflow();
  private readonly demoMarketplaceSearch = buildBrowserDemoMarketplaceSearch();
  private readonly demoMarketplaceProviders = buildBrowserDemoMarketplaceProviders();
  private readonly demoProviderProfile = buildBrowserDemoProviderProfile();
  private readonly demoProviderId = buildBrowserDemoProviderId();

  constructor(
    private readonly platformSource: PlatformExperienceSource = MVP_PLATFORM_HOME_SOURCE
  ) {}

  getBrowserHomeHtml(): string {
    const page = renderPlatformHomePage(createPlatformHomePageModel(this.platformSource));

    return buildBrowserDocumentHtml({
      title: "APP13 Platform Home",
      body: page,
      activePath: "/",
    });
  }

  getOperatorDashboardHtml(): string {
    const overview = renderPlatformOverviewPage(
      createPlatformOverviewPageModel(this.platformSource)
    );
    const body = [renderOperatorExperienceLinks(), overview].join("\n");

    return buildBrowserDocumentHtml({
      title: "APP13 Operator Dashboard",
      body,
      activePath: "/operator/dashboard",
    });
  }

  getMarketplaceSearchHtml(): string {
    const page = [
      renderMarketplaceSearchPage(createMarketplaceSearchPageModel()),
      renderMarketplaceResultsLink(),
    ].join("\n");

    return buildBrowserDocumentHtml({
      title: "APP13 Marketplace",
      body: page,
      activePath: "/marketplace",
    });
  }

  getLoginHtml(): string {
    return buildBrowserDocumentHtml({
      title: "APP13 Sign In",
      body: renderLoginSurfacePage(),
      activePath: "/login",
    });
  }

  getHomeHubHtml(): string {
    const page = renderPlatformHomePage(createPlatformHomePageModel(this.platformSource));

    return buildBrowserDocumentHtml({
      title: "APP13 Home Hub",
      body: page,
      activePath: "/home",
    });
  }

  getContractsHtml(): string {
    const page = [
      renderDetailCrossLinks(),
      renderContractsHubLinks(),
      renderContractSummaryPage(
        createContractSummaryPageModel(this.demoContractWorkflow, this.demoContractContext)
      ),
    ].join("\n");

    return buildBrowserDocumentHtml({
      title: "APP13 Contract Journey",
      body: page,
      activePath: "/contracts",
    });
  }

  getMarketplaceResultsHtml(): string {
    const page = renderMarketplaceResultsPage(
      createMarketplaceResultsPageModel(
        this.demoMarketplaceWorkflow,
        this.demoMarketplaceSearch,
        this.demoMarketplaceProviders
      )
    );

    return buildBrowserDocumentHtml({
      title: "APP13 Marketplace Results",
      body: page,
      activePath: "/marketplace/results",
    });
  }

  getProviderHubHtml(): string {
    const page = renderProviderDashboardPage(
      createProviderDashboardPageModel(this.demoProviderId, this.demoProviderProfile)
    );

    return buildBrowserDocumentHtml({
      title: "APP13 Provider Hub",
      body: page,
      activePath: "/provider",
    });
  }

  getCustomerHubHtml(): string {
    return buildBrowserDocumentHtml({
      title: "APP13 Customer Hub",
      body: renderCustomerHubPage(),
      activePath: "/customer",
    });
  }

  getExecutionDashboardHtml(): string {
    const page = renderExecutionDashboardPage(
      createExecutionDashboardPageModel(MVP_ACTIVE_EXECUTION_SOURCE)
    );

    return buildBrowserDocumentHtml({
      title: "APP13 Execution Dashboard",
      body: page,
      activePath: "/execution/dashboard",
    });
  }

  getTrustCenterHtml(): string {
    const page = renderTrustCenterPage(createTrustCenterPageModel(MVP_TRUST_CENTER_SOURCE));

    return buildBrowserDocumentHtml({
      title: "APP13 Trust Center",
      body: page,
      activePath: "/trust/center",
    });
  }

  getDisputeDashboardHtml(): string {
    const page = renderDisputeDashboardPage(
      createDisputeDashboardPageModel(MVP_OPEN_DISPUTE_SOURCE)
    );

    return buildBrowserDocumentHtml({
      title: "APP13 Dispute Dashboard",
      body: page,
      activePath: "/disputes/dashboard",
    });
  }

  getBrowserCatalogHtml(): string {
    return buildBrowserDocumentHtml({
      title: "APP13 Browser Catalog",
      body: renderBrowserSurfaceCatalog(),
      activePath: "/browse",
    });
  }

  getContractReviewHtml(): string {
    const review = buildBrowserDemoContractReview();
    const page = renderContractReviewPage(createContractReviewPageModel(review));

    return buildBrowserDocumentHtml({
      title: "APP13 Contract Review",
      body: page,
      activePath: "/contracts/review",
    });
  }

  getRequestAnalysisHtml(): string {
    const page = renderRequestAnalysisPage(createRequestAnalysisPageModel());

    return buildBrowserDocumentHtml({
      title: "APP13 Request Analysis",
      body: page,
      activePath: "/requests/analysis",
    });
  }

  getRequestResultHtml(): string {
    const request = buildBrowserDemoCustomerRequest();
    const workflow = buildBrowserDemoMarketplaceWorkflow();
    const page = renderWorkflowResultPage(createRequestResultPageModel(workflow, request));

    return buildBrowserDocumentHtml({
      title: "APP13 Workflow Result",
      body: page,
      activePath: "/requests/result",
    });
  }

  getEscrowOverviewHtml(): string {
    const page = renderEscrowOverviewPage(createEscrowOverviewPageModel(MVP_MILESTONE_ESCROW_SOURCE));

    return buildBrowserDocumentHtml({
      title: "APP13 Escrow Overview",
      body: page,
      activePath: "/escrow",
    });
  }

  getEscrowHistoryHtml(): string {
    const page = renderEscrowHistoryPage(createEscrowHistoryPageModel(MVP_MILESTONE_ESCROW_SOURCE));

    return buildBrowserDocumentHtml({
      title: "APP13 Escrow History",
      body: page,
      activePath: "/escrow/history",
    });
  }

  getEvidenceOverviewHtml(): string {
    const page = renderEvidenceOverviewPage(createEvidenceOverviewPageModel(MVP_EVIDENCE_OVERVIEW_SOURCE));

    return buildBrowserDocumentHtml({
      title: "APP13 Evidence Overview",
      body: page,
      activePath: "/evidence",
    });
  }

  getEvidenceDetailsHtml(): string {
    const model = createEvidenceDetailsPageModel(MVP_EVIDENCE_OVERVIEW_SOURCE, MVP_EVIDENCE_ID_DOC);
    if (!model) {
      throw new Error("Browser evidence detail fixture is unavailable");
    }

    const page = renderEvidenceDetailsPage(model);

    return buildBrowserDocumentHtml({
      title: "APP13 Evidence Details",
      body: page,
      activePath: "/evidence/details",
    });
  }

  getAttestationTimelineHtml(): string {
    const contractId = buildBrowserDemoEvidenceContractId();
    const page = renderAttestationTimelinePage(
      createAttestationTimelinePageModel(MVP_EVIDENCE_OVERVIEW_SOURCE, contractId)
    );

    return buildBrowserDocumentHtml({
      title: "APP13 Attestation Timeline",
      body: page,
      activePath: "/evidence/attestations",
    });
  }

  getMilestoneDetailsHtml(): string {
    const model = createMilestoneDetailsPageModel(MVP_ACTIVE_EXECUTION_SOURCE, MVP_MILESTONE_WIP_ID);
    if (!model) {
      throw new Error("Browser milestone detail fixture is unavailable");
    }

    const page = renderMilestoneDetailsPage(model);

    return buildBrowserDocumentHtml({
      title: "APP13 Milestone Details",
      body: page,
      activePath: "/execution/milestones",
    });
  }

  getDisputeDetailsHtml(): string {
    const page = renderDisputeDetailsPage(createDisputeDetailsPageModel(MVP_OPEN_DISPUTE_SOURCE));

    return buildBrowserDocumentHtml({
      title: "APP13 Dispute Details",
      body: page,
      activePath: "/disputes/details",
    });
  }

  getResolutionTimelineHtml(): string {
    const page = renderResolutionTimelinePage(
      createResolutionTimelinePageModel(MVP_OPEN_DISPUTE_SOURCE, MVP_DISPUTE_ID)
    );

    return buildBrowserDocumentHtml({
      title: "APP13 Resolution Timeline",
      body: page,
      activePath: "/disputes/resolution",
    });
  }

  getProviderProfileHtml(): string {
    const page = renderProviderProfilePage(createProviderProfilePageModel());

    return buildBrowserDocumentHtml({
      title: "APP13 Provider Profile",
      body: page,
      activePath: "/provider/profile",
    });
  }

  getProviderTrustReportHtml(): string {
    const page = renderProviderTrustReportPage(createProviderTrustReportPageModel(MVP_TRUST_CENTER_SOURCE));

    return buildBrowserDocumentHtml({
      title: "APP13 Provider Trust Report",
      body: page,
      activePath: "/trust/report",
    });
  }

  getTrustTimelineHtml(): string {
    const page = renderTrustTimelinePage(
      createTrustTimelinePageModel(MVP_TRUST_CENTER_SOURCE, MVP_TRUST_PROVIDER_ID)
    );

    return buildBrowserDocumentHtml({
      title: "APP13 Trust Timeline",
      body: page,
      activePath: "/trust/timeline",
    });
  }
}

export function createBrowserSurfaceService(
  platformSource?: PlatformExperienceSource
): BrowserSurfaceService {
  return new BrowserSurfaceService(platformSource);
}

export function createBrowserSurfaceModule(deps?: {
  platformSource?: PlatformExperienceSource;
}) {
  const browserSurface = createBrowserSurfaceService(deps?.platformSource);

  return {
    browserSurface,
  };
}

export type BrowserSurfaceModule = ReturnType<typeof createBrowserSurfaceModule>;
