import { buildOfficialRuntimeCatalog, type RuntimeCatalog } from "../domain/runtime-catalog.js";
import { collectExperienceValidationStatus } from "./runtime-validator.js";
import type { RuntimeRegistryRepository } from "../infrastructure/runtime-registry-repository.js";

export class RuntimeLoader {
  constructor(private readonly repository: RuntimeRegistryRepository) {}

  load(generatedAt?: string): RuntimeCatalog {
    const validationStatus = collectExperienceValidationStatus();
    const catalog = buildOfficialRuntimeCatalog(validationStatus, generatedAt ?? new Date().toISOString());
    return this.repository.saveCatalog(catalog);
  }

  reload(generatedAt?: string): RuntimeCatalog {
    this.repository.clear();
    return this.load(generatedAt);
  }

  getLoadedCatalog(): RuntimeCatalog | null {
    return this.repository.getCatalog();
  }
}

export function createRuntimeLoader(repository: RuntimeRegistryRepository): RuntimeLoader {
  return new RuntimeLoader(repository);
}
