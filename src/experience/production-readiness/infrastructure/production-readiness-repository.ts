import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Queryable } from "../../../shared/db/index.js";
import {
  collectProductionReadinessPaths,
  type MigrationStatusSnapshot,
  type ProductionReadinessRawSnapshot,
  type ProductionReadinessSources,
} from "../domain/production-readiness.js";

export class ProductionReadinessRepository {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly runtimeEnvKeys: Set<string> = new Set(Object.keys(process.env))
  ) {}

  async loadRawSnapshot(client: Queryable): Promise<ProductionReadinessRawSnapshot> {
    return {
      sources: await this.loadAuditSources(client),
    };
  }

  async loadAuditSources(client?: Queryable): Promise<ProductionReadinessSources> {
    const [
      envExampleSource,
      packageSource,
      dockerComposeSource,
      configSource,
      indexSource,
      serverSource,
      migrateScriptSource,
      s3StorageSource,
      healthRouteSource,
      loggingSource,
      migrationFiles,
      existingPaths,
      migrationStatus,
    ] = await Promise.all([
      this.readOptional(".env.example"),
      this.readOptional("package.json"),
      this.readOptional("docker-compose.yml"),
      this.readOptional("src/shared/config/index.ts"),
      this.readOptional("src/index.ts"),
      this.readOptional("src/api/server.ts"),
      this.readOptional("scripts/migrate.ts"),
      this.readOptional("src/platform/storage/s3-storage.ts"),
      this.readOptional("src/api/routes/health.ts"),
      this.readOptional("src/shared/logging/index.ts"),
      this.loadMigrationFiles(),
      this.loadExistingPaths(collectProductionReadinessPaths()),
      this.loadMigrationStatus(client),
    ]);

    for (const migrationFile of migrationFiles) {
      existingPaths.add(`database/migrations/${migrationFile}`);
    }

    return {
      envExampleSource,
      packageSource,
      dockerComposeSource,
      configSource,
      indexSource,
      serverSource,
      migrateScriptSource,
      s3StorageSource,
      healthRouteSource,
      loggingSource,
      migrationFiles,
      existingPaths,
      runtimeEnvKeys: this.runtimeEnvKeys,
      migrationStatus,
    };
  }

  private async loadMigrationFiles(): Promise<string[]> {
    const migrationsDir = path.join(this.rootDir, "database/migrations");
    try {
      const files = await readdir(migrationsDir);
      return files.filter((file) => file.endsWith(".sql")).sort();
    } catch {
      return [];
    }
  }

  private async loadMigrationStatus(client?: Queryable): Promise<MigrationStatusSnapshot> {
    const migrationFiles = await this.loadMigrationFiles();
    const totalMigrationFiles = migrationFiles.length;

    if (!client) {
      return {
        totalMigrationFiles,
        appliedMigrations: null,
        pendingMigrations: null,
        migrationsTablePresent: false,
      };
    }

    try {
      const result = await client.query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM platform.schema_migrations"
      );
      const appliedMigrations = Number(result.rows[0]?.count ?? 0);
      return {
        totalMigrationFiles,
        appliedMigrations,
        pendingMigrations: Math.max(0, totalMigrationFiles - appliedMigrations),
        migrationsTablePresent: true,
      };
    } catch {
      return {
        totalMigrationFiles,
        appliedMigrations: null,
        pendingMigrations: null,
        migrationsTablePresent: false,
      };
    }
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

export function createProductionReadinessRepository(input?: {
  rootDir?: string;
  runtimeEnvKeys?: Set<string>;
}): ProductionReadinessRepository {
  return new ProductionReadinessRepository(input?.rootDir, input?.runtimeEnvKeys);
}

export const productionReadinessRepository = createProductionReadinessRepository();
