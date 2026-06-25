import { buildSeedRegistry } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { compileExecutionBlueprint } from "../domain/execution-compiler.js";
import {
  collectExecutionBlueprintPaths,
  validateExecutionBlueprint,
  type ExecutionBlueprint,
  type ExecutionBlueprintStatus,
} from "../domain/execution-blueprint.js";

export interface ExecutionPatternEntry {
  executionBlueprint: ExecutionBlueprint;
  status: ExecutionBlueprintStatus;
  label: string;
  publishedAt?: string;
  deprecatedAt?: string;
  deprecatedBy?: string;
}

function patternKey(primaryTaxonomyCode: string, blueprintId: string): string {
  return `${primaryTaxonomyCode}@${blueprintId}`;
}

export class ExecutionBlueprintRepository {
  private readonly patterns = new Map<string, ExecutionPatternEntry>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const blueprint of buildSeedRegistry()) {
      const executionBlueprint = compileExecutionBlueprint({ blueprint });
      const key = patternKey(blueprint.primaryTaxonomyCode, blueprint.blueprintId);
      this.patterns.set(key, {
        executionBlueprint: { ...executionBlueprint, status: "published" },
        status: "published",
        label: blueprint.title,
        publishedAt: "2026-06-20T00:00:00.000Z",
      });
    }
  }

  listPatterns(): ExecutionPatternEntry[] {
    return [...this.patterns.values()].sort((left, right) =>
      left.executionBlueprint.primaryTaxonomyCode.localeCompare(
        right.executionBlueprint.primaryTaxonomyCode
      )
    );
  }

  getPatternCount(): number {
    return this.patterns.size;
  }

  getPublishedPatternCount(): number {
    return this.listPatterns().filter((entry) => entry.status === "published").length;
  }

  getPatternByTaxonomyCode(code: string): ExecutionPatternEntry | undefined {
    return this.listPatterns().find((entry) => entry.executionBlueprint.primaryTaxonomyCode === code);
  }

  publishPattern(input: { executionBlueprint: ExecutionBlueprint; label: string }): ExecutionPatternEntry {
    const report = validateExecutionBlueprint(input.executionBlueprint);
    if (!report.valid) {
      throw new Error(report.summary);
    }

    const publishedBlueprint: ExecutionBlueprint = {
      ...input.executionBlueprint,
      status: "published",
    };
    const key = patternKey(
      publishedBlueprint.primaryTaxonomyCode,
      publishedBlueprint.blueprintId
    );
    if (this.patterns.has(key) && this.patterns.get(key)?.status === "published") {
      throw new Error(`Execution pattern already published: ${key}`);
    }

    const entry: ExecutionPatternEntry = {
      executionBlueprint: publishedBlueprint,
      status: "published",
      label: input.label,
      publishedAt: new Date().toISOString(),
    };
    this.patterns.set(key, entry);
    return entry;
  }

  deprecatePattern(input: {
    primaryTaxonomyCode: string;
    blueprintId: string;
    successorTaxonomyCode?: string;
  }): ExecutionPatternEntry {
    const key = patternKey(input.primaryTaxonomyCode, input.blueprintId);
    const existing = this.patterns.get(key);
    if (!existing) {
      throw new Error(`Execution pattern not found: ${key}`);
    }

    const deprecated: ExecutionPatternEntry = {
      ...existing,
      status: "deprecated",
      executionBlueprint: {
        ...existing.executionBlueprint,
        status: "deprecated",
      },
      deprecatedAt: new Date().toISOString(),
      deprecatedBy: input.successorTaxonomyCode,
    };
    this.patterns.set(key, deprecated);
    return deprecated;
  }

  async verifyArtifacts(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = [];
    for (const artifactPath of collectExecutionBlueprintPaths()) {
      try {
        const { access } = await import("node:fs/promises");
        const path = await import("node:path");
        await access(path.join(this.rootDir, artifactPath));
      } catch {
        missing.push(artifactPath);
      }
    }
    return { ok: missing.length === 0, missing };
  }
}

export function createExecutionBlueprintRepository(deps?: {
  rootDir?: string;
}): ExecutionBlueprintRepository {
  return new ExecutionBlueprintRepository(deps?.rootDir);
}

export const executionBlueprintRepository = createExecutionBlueprintRepository();
