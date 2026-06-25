import { buildSeedRegistry } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { collectBlueprintGovernancePaths } from "../domain/blueprint-governance.js";
import {
  detectDuplicates,
  seedRegistryFromBlueprints,
  selectCanonicalEntries,
  type GlobalRegistryEntry,
} from "../domain/blueprint-registry.js";
import { publishToRegistry, deprecateFromRegistry, certifyRegistryEntry } from "../domain/blueprint-publication.js";
import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { CertificationLevel } from "../domain/blueprint-certification.js";

function entryKey(blueprintId: string, version: string): string {
  return `${blueprintId}@${version}`;
}

export class BlueprintGovernanceRepository {
  private readonly entries = new Map<string, GlobalRegistryEntry>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const entry of seedRegistryFromBlueprints(buildSeedRegistry())) {
      this.entries.set(entryKey(entry.blueprintId, entry.version), entry);
    }
    this.refreshCanonicalFlags();
  }

  listEntries(): GlobalRegistryEntry[] {
    return [...this.entries.values()].sort((left, right) =>
      left.blueprintId.localeCompare(right.blueprintId)
    );
  }

  getEntry(blueprintId: string, version?: string): GlobalRegistryEntry | undefined {
    if (version) {
      return this.entries.get(entryKey(blueprintId, version));
    }
    const matches = this.listEntries().filter((entry) => entry.blueprintId === blueprintId);
    const canonical = matches.find((entry) => entry.canonical);
    return canonical ?? matches[0];
  }

  getRegistryCount(): number {
    return this.entries.size;
  }

  getPublishedCount(): number {
    return this.listEntries().filter((entry) => entry.status === "published").length;
  }

  getCanonicalCount(): number {
    return this.listEntries().filter((entry) => entry.canonical).length;
  }

  getDuplicateGroupCount(): number {
    return detectDuplicates(this.listEntries()).length;
  }

  publish(blueprint: ActionBlueprint): GlobalRegistryEntry {
    const result = publishToRegistry({
      blueprint,
      existingEntries: this.listEntries(),
    });
    this.entries.set(entryKey(result.entry.blueprintId, result.entry.version), result.entry);
    this.refreshCanonicalFlags();
    return result.entry;
  }

  deprecate(input: {
    blueprintId: string;
    version: string;
    successorRegistryId?: string;
  }): GlobalRegistryEntry {
    const existing = this.entries.get(entryKey(input.blueprintId, input.version));
    if (!existing) {
      throw new Error(`Registry entry not found: ${input.blueprintId}@${input.version}`);
    }
    const result = deprecateFromRegistry({
      entry: existing,
      successorRegistryId: input.successorRegistryId,
    });
    this.entries.set(entryKey(result.entry.blueprintId, result.entry.version), result.entry);
    this.refreshCanonicalFlags();
    return result.entry;
  }

  certify(input: {
    blueprint: ActionBlueprint;
    blueprintId: string;
    version: string;
    targetLevel: CertificationLevel;
  }): GlobalRegistryEntry {
    const existing = this.entries.get(entryKey(input.blueprintId, input.version));
    if (!existing) {
      throw new Error(`Registry entry not found: ${input.blueprintId}@${input.version}`);
    }
    const certified = certifyRegistryEntry({
      blueprint: input.blueprint,
      entry: existing,
      targetLevel: input.targetLevel,
    });
    this.entries.set(entryKey(certified.blueprintId, certified.version), certified);
    this.refreshCanonicalFlags();
    return certified;
  }

  private refreshCanonicalFlags(): void {
    const canonicalEntries = selectCanonicalEntries(this.listEntries());
    const canonicalIds = new Set(canonicalEntries.map((entry) => entry.registryId));

    for (const [key, entry] of this.entries.entries()) {
      this.entries.set(key, {
        ...entry,
        canonical: canonicalIds.has(entry.registryId),
      });
    }
  }

  async verifyArtifacts(): Promise<{ ok: boolean; missing: string[] }> {
    const missing: string[] = [];
    for (const artifactPath of collectBlueprintGovernancePaths()) {
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

export function createBlueprintGovernanceRepository(deps?: {
  rootDir?: string;
}): BlueprintGovernanceRepository {
  return new BlueprintGovernanceRepository(deps?.rootDir);
}

export const blueprintGovernanceRepository = createBlueprintGovernanceRepository();
