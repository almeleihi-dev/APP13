export {
  BROWSER_STATIC_ASSETS,
  BROWSER_STATIC_PREFIX,
  BROWSER_STATIC_ROUTE_CONFIG,
  collectBrowserStaticPaths,
  isBrowserStaticPath,
  type BrowserStaticAsset,
} from "./domain/browser-static.js";
export {
  BrowserStaticService,
  createBrowserStaticModule,
  createBrowserStaticService,
  type BrowserStaticModule,
} from "./application/browser-static-service.js";
