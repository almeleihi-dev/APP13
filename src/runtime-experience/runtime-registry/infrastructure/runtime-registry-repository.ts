import type { RuntimeCatalog } from "../domain/runtime-catalog.js";

export class RuntimeRegistryRepository {
  private catalog: RuntimeCatalog | null = null;

  getCatalog(): RuntimeCatalog | null {
    return this.catalog;
  }

  saveCatalog(catalog: RuntimeCatalog): RuntimeCatalog {
    this.catalog = catalog;
    return catalog;
  }

  clear(): void {
    this.catalog = null;
  }
}

export function createRuntimeRegistryRepository(): RuntimeRegistryRepository {
  return new RuntimeRegistryRepository();
}
