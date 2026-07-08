import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import { createExecutiveUxReadinessRepository } from "../../executive-ux-readiness/infrastructure/executive-ux-readiness-repository.js";
import {
  BROWSER_LAYER_SPECS,
  BROWSER_VERIFICATION_CHAIN_SPECS,
  collectBrowserExperienceCompletenessPaths,
  type BrowserCompletenessSources,
  type BrowserExperienceCompletenessRawSnapshot,
} from "../domain/browser-experience-completeness.js";

export class BrowserExperienceCompletenessRepository {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly uxReadinessRepository = createExecutiveUxReadinessRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<BrowserExperienceCompletenessRawSnapshot> {
    const [uxReadinessRaw, sources] = await Promise.all([
      this.uxReadinessRepository.loadRawSnapshot(client),
      this.loadCompletenessSources(),
    ]);

    return {
      uxReadinessRaw,
      sources,
    };
  }

  async loadCompletenessSources(): Promise<BrowserCompletenessSources> {
    const [indexSource, serverSource, packageSource, existingPaths] = await Promise.all([
      this.readOptional("src/index.ts"),
      this.readOptional("src/api/server.ts"),
      this.readOptional("package.json"),
      this.loadExistingPaths([
        ...collectBrowserExperienceCompletenessPaths(),
        ...BROWSER_LAYER_SPECS.flatMap((spec) => [
          spec.documentationPath,
          spec.testPath,
          spec.verifyScript,
          spec.moduleFile,
          spec.routeFile,
          ...(spec.staticRouteFile ? [spec.staticRouteFile] : []),
        ]),
        "public/browser/app.css",
        "public/browser/favicon.svg",
        "public/browser/manifest.webmanifest",
      ]),
    ]);

    const [browserSurfaceRouteSource, browserStaticRouteSource, browserSurfaceSources, uiPageSources] =
      await Promise.all([
        this.readOptional("src/api/routes/browser-surface.ts"),
        this.readOptional("src/api/routes/browser-static.ts"),
        this.loadBrowserSurfaceSources(),
        this.loadUiPageSources(),
      ]);

    const verifyScriptSources: Record<string, string> = {};
    await Promise.all(
      BROWSER_VERIFICATION_CHAIN_SPECS.map(async (spec) => {
        verifyScriptSources[spec.script] = await this.readOptional(spec.script);
      })
    );

    return {
      indexSource,
      serverSource,
      packageSource,
      existingPaths,
      browserSurfaceRouteSource,
      browserStaticRouteSource,
      browserSurfaceSources,
      uiPageSources,
      verifyScriptSources,
    };
  }

  private async loadBrowserSurfaceSources(): Promise<Record<string, string>> {
    const browserSurfaceRoot = path.join(this.rootDir, "src/browser-surface");
    const sources: Record<string, string> = {};

    const walk = async (absoluteDir: string, relativePrefix: string): Promise<void> => {
      const entries = await readdir(absoluteDir, { withFileTypes: true });
      for (const entry of entries) {
        const relativePath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
        const absolutePath = path.join(absoluteDir, entry.name);
        if (entry.isDirectory()) {
          await walk(absolutePath, relativePath);
        } else if (entry.name.endsWith(".ts")) {
          sources[`src/browser-surface/${relativePath}`] = await this.readOptional(
            `src/browser-surface/${relativePath}`
          );
        }
      }
    };

    try {
      await walk(browserSurfaceRoot, "");
    } catch {
      return sources;
    }

    return sources;
  }

  private async loadUiPageSources(): Promise<Record<string, string>> {
    const uiPagesDir = path.join(this.rootDir, "src/ui/pages");
    const uiPageSources: Record<string, string> = {};

    try {
      const entries = await readdir(uiPagesDir, { withFileTypes: true });
      await Promise.all(
        entries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
          .map(async (entry) => {
            const relativePath = `src/ui/pages/${entry.name}`;
            uiPageSources[relativePath] = await this.readOptional(relativePath);
          })
      );
    } catch {
      return uiPageSources;
    }

    return uiPageSources;
  }

  private async readOptional(relativePath: string): Promise<string> {
    try {
      return await readFile(path.join(this.rootDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }

  private async loadExistingPaths(relativePaths: string[]): Promise<Set<string>> {
    const existingPaths = new Set<string>();
    await Promise.all(
      relativePaths.map(async (relativePath) => {
        try {
          await access(path.join(this.rootDir, relativePath));
          existingPaths.add(relativePath);
        } catch {
          // path missing
        }
      })
    );
    return existingPaths;
  }
}

export function createBrowserExperienceCompletenessRepository(input?: {
  rootDir?: string;
  uxReadinessRepository?: ReturnType<typeof createExecutiveUxReadinessRepository>;
}): BrowserExperienceCompletenessRepository {
  return new BrowserExperienceCompletenessRepository(
    input?.rootDir,
    input?.uxReadinessRepository ??
      createExecutiveUxReadinessRepository({ rootDir: input?.rootDir })
  );
}

export const browserExperienceCompletenessRepository =
  createBrowserExperienceCompletenessRepository();
