import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import {
  BROWSER_STATIC_ASSETS,
  BROWSER_STATIC_PREFIX,
} from "../domain/browser-static.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

export class BrowserStaticService {
  constructor(private readonly publicRootDir: string) {}

  getPublicRootDir(): string {
    return this.publicRootDir;
  }

  getStaticPrefix(): string {
    return BROWSER_STATIC_PREFIX;
  }

  listAssets(): typeof BROWSER_STATIC_ASSETS {
    return BROWSER_STATIC_ASSETS;
  }

  async registerStaticPlugin(app: FastifyInstance): Promise<void> {
    await app.register(fastifyStatic, {
      root: this.publicRootDir,
      prefix: BROWSER_STATIC_PREFIX,
      decorateReply: false,
    });
  }
}

export function createBrowserStaticService(input?: {
  publicRootDir?: string;
}): BrowserStaticService {
  const repoRoot = path.resolve(MODULE_DIR, "../../..");
  const publicRootDir =
    input?.publicRootDir ?? path.join(repoRoot, "public/browser");

  return new BrowserStaticService(publicRootDir);
}

export function createBrowserStaticModule(input?: {
  publicRootDir?: string;
}) {
  const browserStatic = createBrowserStaticService(input);

  return {
    browserStatic,
  };
}

export type BrowserStaticModule = ReturnType<typeof createBrowserStaticModule>;
