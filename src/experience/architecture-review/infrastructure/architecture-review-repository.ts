import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import { createExecutiveExperienceRepository } from "../../executive-experience/infrastructure/executive-experience-repository.js";
import {
  collectArchitectureAuditPaths,
  EXPERIENCE_LAYER_SPECS,
  VERIFICATION_CHAIN_SPECS,
  type ArchitectureAuditSources,
  type ArchitectureReviewRawSnapshot,
} from "../domain/architecture-review.js";

export class ArchitectureReviewRepository {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly executiveRepository = createExecutiveExperienceRepository()
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<ArchitectureReviewRawSnapshot> {
    const [executiveRaw, sources] = await Promise.all([
      this.executiveRepository.loadRawSnapshot(client),
      this.loadAuditSources(),
    ]);

    return {
      executiveRaw,
      sources,
    };
  }

  async loadAuditSources(): Promise<ArchitectureAuditSources> {
    const [indexSource, serverSource, packageSource, existingPaths] = await Promise.all([
      this.readOptional("src/index.ts"),
      this.readOptional("src/api/server.ts"),
      this.readOptional("package.json"),
      this.loadExistingPaths(collectArchitectureAuditPaths()),
    ]);

    const routeFiles = new Set([
      ...EXPERIENCE_LAYER_SPECS.map((spec) => spec.routeFile),
      "src/api/routes/architecture-review.ts",
    ]);
    const verifyScripts = new Set([
      ...VERIFICATION_CHAIN_SPECS.map((spec) => spec.script),
      "scripts/verify-x23.sh",
    ]);

    const routeSources: Record<string, string> = {};
    await Promise.all(
      [...routeFiles].map(async (routeFile) => {
        routeSources[routeFile] = await this.readOptional(routeFile);
      })
    );

    const verifyScriptSources: Record<string, string> = {};
    await Promise.all(
      [...verifyScripts].map(async (verifyScript) => {
        verifyScriptSources[verifyScript] = await this.readOptional(verifyScript);
      })
    );

    return {
      indexSource,
      serverSource,
      packageSource,
      existingPaths,
      routeSources,
      verifyScriptSources,
    };
  }

  private async readOptional(relativePath: string): Promise<string> {
    try {
      return await readFile(path.join(this.rootDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }

  private async loadExistingPaths(relativePaths: string[]): Promise<Set<string>> {
    const existing = new Set<string>();

    await Promise.all(
      relativePaths.map(async (relativePath) => {
        try {
          await access(path.join(this.rootDir, relativePath));
          existing.add(relativePath);
        } catch {
          // Missing paths are surfaced by audit builders.
        }
      })
    );

    return existing;
  }
}

export function createArchitectureReviewRepository(deps?: {
  rootDir?: string;
  executiveRepository?: ReturnType<typeof createExecutiveExperienceRepository>;
}): ArchitectureReviewRepository {
  const executiveRepository =
    deps?.executiveRepository ??
    createExecutiveExperienceRepository({ rootDir: deps?.rootDir });

  return new ArchitectureReviewRepository(deps?.rootDir, executiveRepository);
}

export const architectureReviewRepository = createArchitectureReviewRepository();
