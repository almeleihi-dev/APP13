import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import { RUNTIME_HEALTH_VERSION, buildRuntimeHealthDefinition } from "../domain/runtime-health.js";
import { RUNTIME_REGISTRY_VERSION } from "../../runtime-registry/domain/runtime-experience.js";
import { RUNTIME_COORDINATOR_VERSION } from "../../runtime-coordinator/domain/runtime-coordinator.js";
import { RUNTIME_JOURNEY_VERSION } from "../../runtime-journey/domain/runtime-journey.js";
import { RUNTIME_STATE_VERSION } from "../../runtime-state/domain/runtime-state.js";
import {
  RuntimeHealthRepository,
  createRuntimeHealthRepository,
} from "../infrastructure/runtime-health-repository.js";
import { HealthReporter, createHealthReporter } from "./health-reporter.js";
import { DiagnosticsService, createDiagnosticsService } from "./diagnostics-service.js";
import { validateRuntimeHealth } from "../validation/runtime-health-validator.js";
import { buildHealthDashboard } from "../presentation/health-dashboard.js";
import { buildHealthSummaryScreen } from "../presentation/health-summary-screen.js";
import { buildDiagnosticsScreen } from "../presentation/diagnostics-screen.js";
import { buildExperienceHealthScreen } from "../presentation/experience-health-screen.js";
import { buildValidationScreen } from "../presentation/validation-screen.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeHealthService {
  private readonly repository: RuntimeHealthRepository;
  private readonly reporter: HealthReporter;
  private readonly diagnostics: DiagnosticsService;

  constructor(
    private readonly runtimeRegistry: RuntimeRegistryService,
    repository?: RuntimeHealthRepository
  ) {
    this.repository = repository ?? createRuntimeHealthRepository();
    this.reporter = createHealthReporter();
    this.diagnostics = createDiagnosticsService(this.reporter);
    this.refreshSnapshot(new Date().toISOString());
  }

  getHealth(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const snapshot = this.ensureSnapshot(generatedAt);
    const summary = this.reporter.buildSummary(snapshot);
    return this.toHealthView(summary, snapshot, generatedAt);
  }

  getDashboard(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const snapshot = this.ensureSnapshot(generatedAt);
    const summary = this.reporter.buildSummary(snapshot);
    return {
      summary,
      dashboard: buildHealthDashboard(summary, snapshot),
      generated_at: generatedAt,
    };
  }

  getDiagnostics(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const snapshot = this.ensureSnapshot(generatedAt);
    return {
      diagnostics: this.diagnostics.listExperienceReports(snapshot),
      screen: buildDiagnosticsScreen(snapshot),
      snapshot,
      generated_at: generatedAt,
    };
  }

  getExperienceHealth(authContext: AuthContext, id: string, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const snapshot = this.ensureSnapshot(generatedAt);
    const report = this.diagnostics.getExperienceReport(snapshot, id);
    if (!report) {
      return { found: false, id, error: "Experience not found in health diagnostics" };
    }
    return {
      found: true,
      report,
      screen: buildExperienceHealthScreen(report),
      generated_at: generatedAt,
    };
  }

  getValidation(authContext: AuthContext) {
    requireAuth(authContext);
    const validation = validateRuntimeHealth();
    return {
      ...validation,
      screen: buildValidationScreen(validation),
    };
  }

  refresh(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    this.runtimeRegistry.reload(authContext, { generated_at: generatedAt });
    const snapshot = this.refreshSnapshot(generatedAt);
    const summary = this.reporter.buildSummary(snapshot);
    return this.toHealthView(summary, snapshot, generatedAt);
  }

  validateRuntime() {
    return validateRuntimeHealth();
  }

  private ensureSnapshot(generatedAt: string) {
    const existing = this.repository.getSnapshot();
    if (existing) return existing;
    return this.refreshSnapshot(generatedAt);
  }

  private refreshSnapshot(generatedAt: string) {
    const snapshot = this.diagnostics.runDiagnostics(generatedAt);
    return this.repository.saveSnapshot(snapshot);
  }

  private toHealthView(
    summary: ReturnType<HealthReporter["buildSummary"]>,
    snapshot: ReturnType<DiagnosticsService["runDiagnostics"]>,
    generatedAt: string
  ) {
    const definition = buildRuntimeHealthDefinition();
    return {
      version: RUNTIME_HEALTH_VERSION,
      runtime_registry_version: RUNTIME_REGISTRY_VERSION,
      runtime_coordinator_version: RUNTIME_COORDINATOR_VERSION,
      runtime_journey_version: RUNTIME_JOURNEY_VERSION,
      runtime_state_version: RUNTIME_STATE_VERSION,
      definition,
      summary,
      summary_screen: buildHealthSummaryScreen(summary),
      dashboard: buildHealthDashboard(summary, snapshot),
      diagnostics_count: snapshot.experiences.length,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: generatedAt,
      runtime_health: true,
      read_only: true,
      deterministic: true,
      delegates_only: true,
    };
  }
}

export function createRuntimeHealthService(
  runtimeRegistry: RuntimeRegistryService,
  repository?: RuntimeHealthRepository
) {
  return new RuntimeHealthService(runtimeRegistry, repository);
}
