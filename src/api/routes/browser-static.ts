import type { FastifyInstance } from "fastify";
import type { BrowserStaticService } from "../../browser-static/application/browser-static-service.js";

export async function registerBrowserStaticRoutes(
  app: FastifyInstance,
  browserStatic: BrowserStaticService
): Promise<void> {
  await browserStatic.registerStaticPlugin(app);
}
