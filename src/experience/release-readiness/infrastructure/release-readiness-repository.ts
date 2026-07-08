import { access, readFile } from "node:fs/promises";
import path from "node:path";
import {
  collectProbePaths,
  type ReadinessSources,
} from "../domain/release-readiness.js";

export class ReleaseReadinessCenterRepository {
  constructor(private readonly rootDir: string = process.cwd()) {}

  async loadSources(): Promise<ReadinessSources> {
    const [indexSource, serverSource, packageSource, existingPaths] = await Promise.all([
      this.readOptional("src/index.ts"),
      this.readOptional("src/api/server.ts"),
      this.readOptional("package.json"),
      this.loadExistingPaths(collectProbePaths()),
    ]);

    return {
      indexSource,
      serverSource,
      packageSource,
      existingPaths,
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
          // Path missing; probe evaluation will mark warn/fail.
        }
      })
    );

    return existing;
  }
}

export const releaseReadinessCenterRepository = new ReleaseReadinessCenterRepository();
