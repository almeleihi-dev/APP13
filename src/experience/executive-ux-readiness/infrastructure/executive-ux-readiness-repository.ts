import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import {
  collectExecutiveUxReadinessPaths,
  type ExecutiveUxReadinessRawSnapshot,
  type ExecutiveUxReadinessSources,
} from "../domain/executive-ux-readiness.js";

export class ExecutiveUxReadinessRepository {
  constructor(private readonly rootDir: string = process.cwd()) {}

  async loadRawSnapshot(_client: Queryable): Promise<ExecutiveUxReadinessRawSnapshot> {
    return {
      sources: await this.loadSources(),
    };
  }

  async loadSources(): Promise<ExecutiveUxReadinessSources> {
    const [
      serverSource,
      packageSource,
      existingPaths,
      routeSources,
      browserSurfaceSources,
      uiPageSources,
    ] = await Promise.all([
      this.readOptional("src/api/server.ts"),
      this.readOptional("package.json"),
      this.loadExistingPaths(collectExecutiveUxReadinessPaths()),
      this.loadRouteSources(),
      this.loadBrowserSurfaceSources(),
      this.loadUiPageSources(),
    ]);

    return {
      serverSource,
      packageSource,
      routeSources,
      browserSurfaceSources,
      uiPageSources,
      existingPaths,
    };
  }

  private async loadRouteSources(): Promise<Record<string, string>> {
    const routeFiles = await this.collectRouteFiles();
    const routeSources: Record<string, string> = {};

    await Promise.all(
      routeFiles.map(async (routeFile) => {
        routeSources[routeFile] = await this.readOptional(routeFile);
      })
    );

    return routeSources;
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

  private async collectRouteFiles(): Promise<string[]> {
    const routesRoot = path.join(this.rootDir, "src/api/routes");
    const files: string[] = [];

    const walk = async (absoluteDir: string, relativePrefix: string): Promise<void> => {
      const entries = await readdir(absoluteDir, { withFileTypes: true });
      for (const entry of entries) {
        const relativePath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
        const absolutePath = path.join(absoluteDir, entry.name);
        if (entry.isDirectory()) {
          await walk(absolutePath, relativePath);
        } else if (entry.name.endsWith(".ts")) {
          files.push(`src/api/routes/${relativePath}`);
        }
      }
    };

    try {
      await walk(routesRoot, "");
    } catch {
      return files;
    }

    return files;
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

export function createExecutiveUxReadinessRepository(input?: {
  rootDir?: string;
}): ExecutiveUxReadinessRepository {
  return new ExecutiveUxReadinessRepository(input?.rootDir);
}

export const executiveUxReadinessRepository = createExecutiveUxReadinessRepository();
