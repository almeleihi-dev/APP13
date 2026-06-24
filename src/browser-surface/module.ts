export {
  BROWSER_DETAIL_ROUTES,
  BROWSER_ENTRY_ROUTES,
  BROWSER_HUB_ROUTES,
  BROWSER_NAV_LINKS,
  BROWSER_SURFACE_ROUTE_CONFIG,
  BROWSER_SURFACE_ROUTES,
  OPERATOR_EXPERIENCE_LINKS,
  buildBrowserDocumentHtml,
  collectBrowserHubPaths,
  collectBrowserSurfacePaths,
  renderBrowserNav,
  renderLoginSurfacePage,
  renderOperatorExperienceLinks,
  type BrowserNavLink,
  type OperatorExperienceLink,
} from "./domain/browser-surface.js";
export {
  renderBrowserSurfaceCatalog,
  renderDetailCrossLinks,
  collectBrowserDetailPaths,
  BROWSER_SURFACE_CATALOG,
  type BrowserSurfaceCatalogEntry,
} from "./domain/browser-detail-pages.js";
export {
  buildBrowserDemoContractReview,
  buildBrowserDemoCustomerRequest,
  buildBrowserDemoEvidenceContractId,
} from "./domain/browser-detail-fixtures.js";
export {
  BrowserSurfaceService,
  createBrowserSurfaceModule,
  createBrowserSurfaceService,
  type BrowserSurfaceModule,
} from "./application/browser-surface-service.js";
