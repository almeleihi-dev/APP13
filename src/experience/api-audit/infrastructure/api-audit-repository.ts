import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import {
  collectApiAuditPaths,
  type ApiAuditRawSnapshot,
  type ApiAuditSources,
} from "../domain/api-audit.js";

export class ApiAuditRepository {
  constructor(private readonly rootDir: string = process.cwd()) {}

  async loadRawSnapshot(_client: Queryable): Promise<ApiAuditRawSnapshot> {
    return {
      sources: await this.loadAuditSources(),
    };
  }

  async loadAuditSources(): Promise<ApiAuditSources> {
    const [serverSource, packageSource, existingPaths, routeSources, documentationSources] =
      await Promise.all([
        this.readOptional("src/api/server.ts"),
        this.readOptional("package.json"),
        this.loadExistingPaths(collectApiAuditPaths()),
        this.loadRouteSources(),
        this.loadDocumentationSources(),
      ]);

    return {
      serverSource,
      packageSource,
      routeSources,
      documentationSources,
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

  private async loadDocumentationSources(): Promise<Record<string, string>> {
    const docsDir = path.join(this.rootDir, "docs/experience");
    const documentationSources: Record<string, string> = {};

    try {
      const entries = await readdir(docsDir, { withFileTypes: true });
      await Promise.all(
        entries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
          .map(async (entry) => {
            const relativePath = `docs/experience/${entry.name}`;
            documentationSources[relativePath] = await this.readOptional(relativePath);
          })
      );
    } catch {
      return documentationSources;
    }

    return documentationSources;
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

export function createApiAuditRepository(input?: { rootDir?: string }): ApiAuditRepository {
  return new ApiAuditRepository(input?.rootDir);
}

export const apiAuditRepository = createApiAuditRepository();
