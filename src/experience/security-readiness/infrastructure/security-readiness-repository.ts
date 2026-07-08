import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import {
  collectSecurityReadinessPaths,
  type SecurityReadinessRawSnapshot,
  type SecurityReadinessSources,
} from "../domain/security-readiness.js";

export class SecurityReadinessRepository {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly runtimeEnvKeys: Set<string> = new Set(Object.keys(process.env))
  ) {}

  async loadRawSnapshot(_client: Queryable): Promise<SecurityReadinessRawSnapshot> {
    return {
      sources: await this.loadAuditSources(),
    };
  }

  async loadAuditSources(): Promise<SecurityReadinessSources> {
    const [
      serverSource,
      indexSource,
      packageSource,
      envExampleSource,
      configSource,
      guardsSource,
      requireAuthSource,
      authenticateSource,
      loggingSource,
      s3StorageSource,
      routeSources,
      documentationSources,
      serviceSources,
      existingPaths,
    ] = await Promise.all([
      this.readOptional("src/api/server.ts"),
      this.readOptional("src/index.ts"),
      this.readOptional("package.json"),
      this.readOptional(".env.example"),
      this.readOptional("src/shared/config/index.ts"),
      this.readOptional("src/security/guards.ts"),
      this.readOptional("src/api/middleware/require-auth.ts"),
      this.readOptional("src/api/middleware/authenticate.ts"),
      this.readOptional("src/shared/logging/index.ts"),
      this.readOptional("src/platform/storage/s3-storage.ts"),
      this.loadRouteSources(),
      this.loadDocumentationSources(),
      this.loadServiceSources(),
      this.loadExistingPaths(collectSecurityReadinessPaths()),
    ]);

    const migrationsDir = path.join(this.rootDir, "database/migrations");
    try {
      const migrationFiles = await readdir(migrationsDir);
      for (const file of migrationFiles.filter((name) => name.endsWith(".sql"))) {
        existingPaths.add(`database/migrations/${file}`);
      }
    } catch {
      // migrations directory missing
    }

    return {
      serverSource,
      indexSource,
      packageSource,
      envExampleSource,
      configSource,
      guardsSource,
      requireAuthSource,
      authenticateSource,
      loggingSource,
      s3StorageSource,
      routeSources,
      documentationSources,
      serviceSources,
      existingPaths,
      runtimeEnvKeys: this.runtimeEnvKeys,
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

  private async loadServiceSources(): Promise<Record<string, string>> {
    const srcRoot = path.join(this.rootDir, "src");
    const serviceSources: Record<string, string> = {};

    const walk = async (absoluteDir: string, relativePrefix: string): Promise<void> => {
      let entries;
      try {
        entries = await readdir(absoluteDir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const relativePath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
        const absolutePath = path.join(absoluteDir, entry.name);
        if (entry.isDirectory()) {
          await walk(absolutePath, relativePath);
        } else if (entry.name.endsWith("-service.ts") || entry.name.endsWith("service.ts")) {
          serviceSources[`src/${relativePath}`] = await this.readOptional(`src/${relativePath}`);
        }
      }
    };

    await walk(srcRoot, "");
    return serviceSources;
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

export function createSecurityReadinessRepository(input?: {
  rootDir?: string;
  runtimeEnvKeys?: Set<string>;
}): SecurityReadinessRepository {
  return new SecurityReadinessRepository(input?.rootDir, input?.runtimeEnvKeys);
}

export const securityReadinessRepository = createSecurityReadinessRepository();
