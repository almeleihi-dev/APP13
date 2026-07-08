import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type {
  ActionBlueprint,
  BlueprintRegistryEntry,
} from "../domain/action-blueprint.js";
import {
  applyValidatedStatus,
  canTransitionStatus,
  validateBlueprint,
} from "../domain/action-blueprint.js";
import { buildSeedRegistry } from "../domain/taxonomy-bridge.js";
import { collectActionBlueprintPaths } from "../domain/action-blueprint.js";

function registryKey(blueprintId: string, version: string): string {
  return `${blueprintId}@${version}`;
}

export class ActionBlueprintRepository {
  private readonly published = new Map<string, BlueprintRegistryEntry>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const seed of buildSeedRegistry()) {
      const key = registryKey(seed.blueprintId, seed.version);
      this.published.set(key, {
        blueprint: seed,
        publishedAt: "2026-06-20T00:00:00.000Z",
      });
    }
  }

  listRegistryEntries(): BlueprintRegistryEntry[] {
    return [...this.published.values()].sort((left, right) =>
      left.blueprint.blueprintId.localeCompare(right.blueprint.blueprintId)
    );
  }

  getLatestPublished(blueprintId: string): BlueprintRegistryEntry | undefined {
    const entries = this.listRegistryEntries().filter(
      (entry) => entry.blueprint.blueprintId === blueprintId && entry.blueprint.status === "published"
    );
    return entries.sort((left, right) => right.blueprint.version.localeCompare(left.blueprint.version))[0];
  }

  getPublishedVersion(blueprintId: string, version: string): BlueprintRegistryEntry | undefined {
    return this.published.get(registryKey(blueprintId, version));
  }

  publishBlueprint(blueprint: ActionBlueprint): BlueprintRegistryEntry {
    const report = validateBlueprint(blueprint);
    if (!report.valid) {
      throw new Error(report.summary);
    }
    if (!canTransitionStatus(report.valid ? "validated" : blueprint.status, "published")) {
      throw new Error(`Cannot publish blueprint in status ${blueprint.status}`);
    }

    const validated = applyValidatedStatus(blueprint, report);
    const publishedBlueprint: ActionBlueprint = {
      ...validated,
      status: "published",
    };
    const key = registryKey(publishedBlueprint.blueprintId, publishedBlueprint.version);
    if (this.published.has(key)) {
      throw new Error(`Blueprint already published: ${key}`);
    }

    const entry: BlueprintRegistryEntry = {
      blueprint: publishedBlueprint,
      publishedAt: new Date().toISOString(),
    };
    this.published.set(key, entry);
    return entry;
  }

  deprecateBlueprint(input: {
    blueprintId: string;
    version: string;
    successorBlueprintId?: string;
    successorVersion?: string;
  }): BlueprintRegistryEntry {
    const key = registryKey(input.blueprintId, input.version);
    const existing = this.published.get(key);
    if (!existing) {
      throw new Error(`Published blueprint not found: ${key}`);
    }
    if (!canTransitionStatus(existing.blueprint.status, "deprecated")) {
      throw new Error(`Cannot deprecate blueprint in status ${existing.blueprint.status}`);
    }

    const deprecatedBy =
      input.successorBlueprintId && input.successorVersion
        ? registryKey(input.successorBlueprintId, input.successorVersion)
        : undefined;

    const entry: BlueprintRegistryEntry = {
      blueprint: {
        ...existing.blueprint,
        status: "deprecated",
        deprecatedBy,
        supersedes: deprecatedBy,
      },
      publishedAt: existing.publishedAt,
      deprecatedAt: new Date().toISOString(),
    };
    this.published.set(key, entry);
    return entry;
  }

  getSeedRegistryCount(): number {
    return buildSeedRegistry().length;
  }

  getPublishedCount(): number {
    return this.listRegistryEntries().filter((entry) => entry.blueprint.status === "published").length;
  }

  async loadExistingPaths(): Promise<Set<string>> {
    const paths = collectActionBlueprintPaths();
    const existingPaths = new Set<string>();
    await Promise.all(
      paths.map(async (relativePath) => {
        try {
          await access(path.join(this.rootDir, relativePath));
          existingPaths.add(relativePath);
        } catch {
          // missing
        }
      })
    );
    return existingPaths;
  }

  async readOptional(relativePath: string): Promise<string> {
    try {
      return await readFile(path.join(this.rootDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }
}

export function createActionBlueprintRepository(input?: {
  rootDir?: string;
}): ActionBlueprintRepository {
  return new ActionBlueprintRepository(input?.rootDir);
}

export const actionBlueprintRepository = createActionBlueprintRepository();
