import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import { createBrowserExperienceCompletenessRepository } from "../../browser-experience-completeness/infrastructure/browser-experience-completeness-repository.js";
import {
  collectOperatorSurfaceNavigationPaths,
  OPERATOR_JSON_CENTER_SPECS,
  type OperatorSurfaceNavigationRawSnapshot,
  type OperatorSurfaceNavigationSources,
} from "../domain/operator-surface-navigation.js";

const EXPERIENCE_ROUTE_FILES = [
  "src/api/routes/architecture-review.ts",
  "src/api/routes/api-audit.ts",
  "src/api/routes/browser-experience-completeness.ts",
  "src/api/routes/business-intelligence.ts",
  "src/api/routes/executive-experience.ts",
  "src/api/routes/executive-ux-readiness.ts",
  "src/api/routes/launch-control.ts",
  "src/api/routes/mission-control.ts",
  "src/api/routes/operator-surface-navigation.ts",
  "src/api/routes/platform-operations.ts",
  "src/api/routes/post-launch-monitoring.ts",
  "src/api/routes/production-readiness.ts",
  "src/api/routes/release-readiness.ts",
  "src/api/routes/security-readiness.ts",
];

export class OperatorSurfaceNavigationRepository {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly browserCompletenessRepository = createBrowserExperienceCompletenessRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<OperatorSurfaceNavigationRawSnapshot> {
    const [browserCompletenessRaw, sources] = await Promise.all([
      this.browserCompletenessRepository.loadRawSnapshot(client),
      this.loadNavigationSources(),
    ]);

    return {
      browserCompletenessRaw,
      sources,
    };
  }

  async loadNavigationSources(): Promise<OperatorSurfaceNavigationSources> {
    const [packageSource, browserSurfaceRouteSource, browserSurfaceSources] = await Promise.all([
      this.readOptional("package.json"),
      this.readOptional("src/api/routes/browser-surface.ts"),
      this.loadBrowserSurfaceSources(),
    ]);

    const existingPaths = await this.loadExistingPaths([
      ...collectOperatorSurfaceNavigationPaths(),
      ...OPERATOR_JSON_CENTER_SPECS.map((spec) => `src/api/routes${spec.baseRoute}.ts`),
      ...EXPERIENCE_ROUTE_FILES,
    ]);

    const experienceRouteSources: Record<string, string> = {};
    await Promise.all(
      EXPERIENCE_ROUTE_FILES.map(async (routeFile) => {
        experienceRouteSources[routeFile] = await this.readOptional(routeFile);
      })
    );

    return {
      serverSource: await this.readOptional("src/api/server.ts"),
      packageSource,
      browserSurfaceRouteSource,
      browserSurfaceSources,
      experienceRouteSources,
      existingPaths,
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

export function createOperatorSurfaceNavigationRepository(input?: {
  rootDir?: string;
  browserCompletenessRepository?: ReturnType<typeof createBrowserExperienceCompletenessRepository>;
}): OperatorSurfaceNavigationRepository {
  return new OperatorSurfaceNavigationRepository(
    input?.rootDir,
    input?.browserCompletenessRepository ??
      createBrowserExperienceCompletenessRepository({ rootDir: input?.rootDir })
  );
}

export const operatorSurfaceNavigationRepository = createOperatorSurfaceNavigationRepository();
