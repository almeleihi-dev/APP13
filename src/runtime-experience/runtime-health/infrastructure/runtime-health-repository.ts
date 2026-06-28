import type { HealthCheckSnapshot } from "../domain/health-check.js";

export class RuntimeHealthRepository {
  private snapshot: HealthCheckSnapshot | null = null;

  getSnapshot(): HealthCheckSnapshot | null {
    return this.snapshot;
  }

  saveSnapshot(snapshot: HealthCheckSnapshot): HealthCheckSnapshot {
    this.snapshot = snapshot;
    return snapshot;
  }

  clear(): void {
    this.snapshot = null;
  }
}

export function createRuntimeHealthRepository(): RuntimeHealthRepository {
  return new RuntimeHealthRepository();
}
