import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { ProfessionOntologyEntry } from "../domain/profession-ontology.js";
import { collectProfessionOntologyPaths } from "../domain/profession-ontology.js";
import { buildSeedProfessionRegistry } from "../domain/profession-registry.js";

function entryKey(professionId: string): string {
  return professionId;
}

export class ProfessionOntologyRepository {
  private readonly entries = new Map<string, ProfessionOntologyEntry>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const seed of buildSeedProfessionRegistry()) {
      this.entries.set(entryKey(seed.professionId), seed);
    }
  }

  listEntries(): ProfessionOntologyEntry[] {
    return [...this.entries.values()].sort((left, right) =>
      left.professionId.localeCompare(right.professionId)
    );
  }

  getById(professionId: string): ProfessionOntologyEntry | undefined {
    return this.entries.get(entryKey(professionId));
  }

  getPublishedCount(): number {
    return this.listEntries().filter((entry) => entry.status === "published").length;
  }

  getRegistryCount(): number {
    return this.entries.size;
  }

  publishEntry(entry: ProfessionOntologyEntry): ProfessionOntologyEntry {
    if (this.entries.has(entryKey(entry.professionId)) && entry.status === "published") {
      const existing = this.entries.get(entryKey(entry.professionId))!;
      if (existing.status === "published" && existing.schemaVersion === entry.schemaVersion) {
        throw new Error(`Profession already published: ${entry.professionId}`);
      }
    }
    const published: ProfessionOntologyEntry = { ...entry, status: "published" };
    this.entries.set(entryKey(published.professionId), published);
    return published;
  }

  deprecateEntry(input: {
    professionId: string;
    successorProfessionId?: string;
  }): ProfessionOntologyEntry {
    const existing = this.entries.get(entryKey(input.professionId));
    if (!existing) {
      throw new Error(`Profession not found: ${input.professionId}`);
    }
    const deprecated: ProfessionOntologyEntry = {
      ...existing,
      status: "deprecated",
      deprecatedBy: input.successorProfessionId,
    };
    this.entries.set(entryKey(deprecated.professionId), deprecated);
    return deprecated;
  }

  async loadExistingPaths(): Promise<Set<string>> {
    const paths = collectProfessionOntologyPaths();
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

export function createProfessionOntologyRepository(input?: {
  rootDir?: string;
}): ProfessionOntologyRepository {
  return new ProfessionOntologyRepository(input?.rootDir);
}

export const professionOntologyRepository = createProfessionOntologyRepository();
