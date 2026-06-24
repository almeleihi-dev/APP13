import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import { createOperatorSurfaceNavigationRepository } from "../../operator-surface-navigation/infrastructure/operator-surface-navigation-repository.js";
import {
  collectOperatorExperienceIntegrityPaths,
  type OperatorExperienceIntegrityRawSnapshot,
  type OperatorExperienceIntegritySources,
} from "../domain/operator-experience-integrity.js";

const EXPERIENCE_ROUTE_FILES = [
  "src/api/routes/architecture-review.ts",
  "src/api/routes/api-audit.ts",
  "src/api/routes/browser-experience-completeness.ts",
  "src/api/routes/business-intelligence.ts",
  "src/api/routes/contract-journey.ts",
  "src/api/routes/customer-command-center.ts",
  "src/api/routes/discovery-matching.ts",
  "src/api/routes/disputes-read.ts",
  "src/api/routes/escrow-payment.ts",
  "src/api/routes/executive-experience.ts",
  "src/api/routes/executive-ux-readiness.ts",
  "src/api/routes/home.ts",
  "src/api/routes/launch-control.ts",
  "src/api/routes/mission-control.ts",
  "src/api/routes/operator-experience-integrity.ts",
  "src/api/routes/operator-surface-navigation.ts",
  "src/api/routes/platform-operations.ts",
  "src/api/routes/post-launch-monitoring.ts",
  "src/api/routes/production-readiness.ts",
  "src/api/routes/provider-command-center.ts",
  "src/api/routes/release-readiness.ts",
  "src/api/routes/security-readiness.ts",
  "src/api/routes/trust-reputation.ts",
];

export class OperatorExperienceIntegrityRepository {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly navigationRepository = createOperatorSurfaceNavigationRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<OperatorExperienceIntegrityRawSnapshot> {
    const [navigationRaw, sources] = await Promise.all([
      this.navigationRepository.loadRawSnapshot(client),
      this.loadIntegritySources(),
    ]);

    return {
      navigationRaw,
      sources,
    };
  }

  async loadIntegritySources(): Promise<OperatorExperienceIntegritySources> {
    const [serverSource, packageSource, browserSurfaceRouteSource, browserSurfaceSources] =
      await Promise.all([
        this.readOptional("src/api/server.ts"),
        this.readOptional("package.json"),
        this.readOptional("src/api/routes/browser-surface.ts"),
        this.loadBrowserSurfaceSources(),
      ]);

    const experienceRouteSources: Record<string, string> = {};
    await Promise.all(
      EXPERIENCE_ROUTE_FILES.map(async (routeFile) => {
        experienceRouteSources[routeFile] = await this.readOptional(routeFile);
      })
    );

    const existingPaths = await this.loadExistingPaths([
      ...collectOperatorExperienceIntegrityPaths(),
      ...EXPERIENCE_ROUTE_FILES,
    ]);

    return {
      serverSource,
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

export function createOperatorExperienceIntegrityRepository(input?: {
  rootDir?: string;
  navigationRepository?: ReturnType<typeof createOperatorSurfaceNavigationRepository>;
}): OperatorExperienceIntegrityRepository {
  return new OperatorExperienceIntegrityRepository(
    input?.rootDir,
    input?.navigationRepository ??
      createOperatorSurfaceNavigationRepository({ rootDir: input?.rootDir })
  );
}

export const operatorExperienceIntegrityRepository = createOperatorExperienceIntegrityRepository();
