export interface ProductionReadinessSources {
  envExampleSource: string;
  packageSource: string;
  dockerComposeSource: string;
  configSource: string;
  indexSource: string;
  serverSource: string;
  migrateScriptSource: string;
  s3StorageSource: string;
  healthRouteSource: string;
  loggingSource: string;
  migrationFiles: string[];
  existingPaths: Set<string>;
  runtimeEnvKeys: Set<string>;
  migrationStatus: MigrationStatusSnapshot;
}

export interface MigrationStatusSnapshot {
  totalMigrationFiles: number;
  appliedMigrations: number | null;
  pendingMigrations: number | null;
  migrationsTablePresent: boolean;
}

export interface ProductionReadinessRawSnapshot {
  sources: ProductionReadinessSources;
}

export type ReadinessLevel = "ready" | "attention_required" | "blocked";
export type RiskLevel = "critical" | "high" | "medium" | "low";
export type ProductionRiskCategory =
  | "infrastructure"
  | "security"
  | "deployment"
  | "storage"
  | "database"
  | "monitoring";

export interface ProductionOverview {
  headline: string;
  productionReadinessScore: number;
  launchReadiness: ReadinessLevel;
  operationalReadiness: ReadinessLevel;
  deploymentReadiness: ReadinessLevel;
  riskLevel: RiskLevel;
  summary: string;
}

export interface EnvironmentAudit {
  envFiles: string[];
  requiredVariables: string[];
  missingVariables: string[];
  environmentCoverageScore: number;
  summary: string;
}

export interface DatabaseReadiness {
  postgresReadiness: ReadinessLevel;
  migrationsStatus: ReadinessLevel;
  connectionConfiguration: ReadinessLevel;
  backupReadiness: ReadinessLevel;
  summary: string;
}

export interface StorageReadiness {
  objectStorageConfiguration: ReadinessLevel;
  bucketReadiness: ReadinessLevel;
  uploadSupport: ReadinessLevel;
  retentionReadiness: ReadinessLevel;
  summary: string;
}

export interface SecurityReadiness {
  authCoverage: ReadinessLevel;
  secretManagement: ReadinessLevel;
  roleProtection: ReadinessLevel;
  securityScore: number;
  summary: string;
}

export interface MonitoringReadiness {
  loggingSupport: ReadinessLevel;
  monitoringSupport: ReadinessLevel;
  healthChecks: ReadinessLevel;
  observabilityScore: number;
  summary: string;
}

export interface DeploymentReadiness {
  deploymentArtifacts: ReadinessLevel;
  startupScripts: ReadinessLevel;
  runtimeRequirements: ReadinessLevel;
  deploymentScore: number;
  summary: string;
}

export interface DisasterRecoveryReadiness {
  backupCoverage: ReadinessLevel;
  recoveryGuidance: ReadinessLevel;
  operationalResilience: ReadinessLevel;
  recoveryScore: number;
  summary: string;
}

export interface ProductionRisk {
  category: ProductionRiskCategory;
  severity: RiskLevel;
  message: string;
  mitigation: string;
}

export interface ProductionRiskRegister {
  risks: ProductionRisk[];
  summary: string;
}

export interface LaunchRecommendation {
  group: "blockers" | "before_launch" | "after_launch";
  title: string;
  reason: string;
  action: string;
}

export interface LaunchRecommendations {
  blockers: LaunchRecommendation[];
  beforeLaunch: LaunchRecommendation[];
  afterLaunch: LaunchRecommendation[];
  summary: string;
}

export interface ProductionReadinessScore {
  score: number;
  status: ReadinessLevel;
  environmentWeight: number;
  databaseWeight: number;
  storageWeight: number;
  securityWeight: number;
  monitoringWeight: number;
  deploymentWeight: number;
  disasterRecoveryWeight: number;
  summary: string;
}

export interface ProductionReadinessSnapshot {
  overview: ProductionOverview;
  environment: EnvironmentAudit;
  database: DatabaseReadiness;
  storage: StorageReadiness;
  security: SecurityReadiness;
  monitoring: MonitoringReadiness;
  deployment: DeploymentReadiness;
  disasterRecovery: DisasterRecoveryReadiness;
  riskRegister: ProductionRiskRegister;
  recommendations: LaunchRecommendations;
  readinessScore: ProductionReadinessScore;
  generatedAt: Date;
}

export interface ProductionReadinessCenter {
  overview: ProductionOverview;
  environment: EnvironmentAudit;
  database: DatabaseReadiness;
  storage: StorageReadiness;
  security: SecurityReadiness;
  monitoring: MonitoringReadiness;
  deployment: DeploymentReadiness;
  disasterRecovery: DisasterRecoveryReadiness;
  riskRegister: ProductionRiskRegister;
  recommendations: LaunchRecommendations;
  readinessScore: ProductionReadinessScore;
  generatedAt: Date;
}

export const PRODUCTION_READINESS_ROUTES = [
  "/production-readiness",
  "/production-readiness/overview",
  "/production-readiness/environment",
  "/production-readiness/database",
  "/production-readiness/storage",
  "/production-readiness/security",
  "/production-readiness/monitoring",
  "/production-readiness/deployment",
  "/production-readiness/disaster-recovery",
  "/production-readiness/risks",
  "/production-readiness/recommendations",
];

export const REQUIRED_ENV_VARIABLES = [
  "APP13_ENV",
  "APP13_SERVICE_ID",
  "APP13_HOST",
  "APP13_PORT",
  "APP13_LOG_LEVEL",
  "DATABASE_URL",
  "REDIS_URL",
  "S3_BUCKET",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_REGION",
  "JWT_SECRET",
  "JWT_ACCESS_TTL_SECONDS",
  "JWT_ISSUER",
  "SESSION_COOKIE_NAME",
  "SESSION_TTL_SECONDS",
  "REFRESH_TTL_SECONDS",
  "KYC_WEBHOOK_SECRET",
  "KYC_SANDBOX_BASE_URL",
  "IDEMPOTENCY_TTL_SECONDS",
];

export const PRODUCTION_ARTIFACT_PATHS = [
  ".env.example",
  "docker-compose.yml",
  "package.json",
  "tsconfig.json",
  "scripts/migrate.ts",
  "database/migrations",
  "src/index.ts",
  "src/api/server.ts",
  "src/shared/config/index.ts",
  "src/shared/logging/index.ts",
  "src/platform/storage/s3-storage.ts",
  "src/api/routes/health.ts",
  "docs/experience/X25-Production-Readiness-Center.md",
  "src/api/routes/production-readiness.ts",
  "src/experience/production-readiness/module.ts",
  "test/x25-production-readiness.test.ts",
  "scripts/verify-x25.sh",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseEnvExampleKeys(source: string): string[] {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.split("=")[0]?.trim() ?? "")
    .filter(Boolean);
}

function levelFromScore(score: number): ReadinessLevel {
  if (score >= 75) return "ready";
  if (score >= 55) return "attention_required";
  return "blocked";
}

function scoreFromLevels(levels: ReadinessLevel[]): number {
  if (levels.length === 0) return 0;
  const points = levels.map((level) => {
    if (level === "ready") return 100;
    if (level === "attention_required") return 65;
    return 25;
  });
  return Math.round(points.reduce((sum, value) => sum + value, 0) / levels.length);
}

function highestRiskLevel(risks: ProductionRisk[]): RiskLevel {
  const order: RiskLevel[] = ["critical", "high", "medium", "low"];
  for (const level of order) {
    if (risks.some((risk) => risk.severity === level)) {
      return level;
    }
  }
  return "low";
}

export function buildEnvironmentAudit(sources: ProductionReadinessSources): EnvironmentAudit {
  const envFiles = [".env.example"].filter((file) => sources.existingPaths.has(file));
  const documentedKeys = new Set(parseEnvExampleKeys(sources.envExampleSource));
  const missingVariables = REQUIRED_ENV_VARIABLES.filter(
    (variable) => !documentedKeys.has(variable)
  );

  const runtimeMissing = REQUIRED_ENV_VARIABLES.filter(
    (variable) => !sources.runtimeEnvKeys.has(variable)
  );

  const documentedCoverage =
    ((REQUIRED_ENV_VARIABLES.length - missingVariables.length) /
      Math.max(1, REQUIRED_ENV_VARIABLES.length)) *
    100;
  const runtimeCoverage =
    ((REQUIRED_ENV_VARIABLES.length - runtimeMissing.length) /
      Math.max(1, REQUIRED_ENV_VARIABLES.length)) *
    100;
  const environmentCoverageScore = clamp(
    Math.round(documentedCoverage * 0.6 + runtimeCoverage * 0.4),
    0,
    100
  );

  return {
    envFiles,
    requiredVariables: [...REQUIRED_ENV_VARIABLES],
    missingVariables: [...new Set([...missingVariables, ...runtimeMissing])],
    environmentCoverageScore,
    summary: `Environment audit covers ${envFiles.length} env files with ${environmentCoverageScore}% variable coverage.`,
  };
}

export function buildDatabaseReadiness(sources: ProductionReadinessSources): DatabaseReadiness {
  const postgresReady =
    sources.dockerComposeSource.includes("postgres:") &&
    sources.dockerComposeSource.includes("healthcheck:");
  const connectionReady =
    sources.configSource.includes("databaseUrl") &&
    sources.envExampleSource.includes("DATABASE_URL=");
  const migrateReady =
    sources.migrateScriptSource.includes("schema_migrations") &&
    sources.migrationFiles.length > 0;
  const backupReady =
    sources.dockerComposeSource.includes("postgres_data:") &&
    sources.existingPaths.has("docker-compose.yml");

  let migrationsStatus: ReadinessLevel = "attention_required";
  if (migrateReady && sources.migrationStatus.totalMigrationFiles > 0) {
    if (sources.migrationStatus.appliedMigrations === null) {
      migrationsStatus = "attention_required";
    } else if (
      sources.migrationStatus.pendingMigrations === 0 &&
      sources.migrationStatus.appliedMigrations === sources.migrationStatus.totalMigrationFiles
    ) {
      migrationsStatus = "ready";
    } else if ((sources.migrationStatus.pendingMigrations ?? 0) > 0) {
      migrationsStatus = "blocked";
    } else {
      migrationsStatus = "ready";
    }
  } else if (!migrateReady) {
    migrationsStatus = "blocked";
  }

  return {
    postgresReadiness: postgresReady ? "ready" : "blocked",
    migrationsStatus,
    connectionConfiguration: connectionReady ? "ready" : "blocked",
    backupReadiness: backupReady ? "attention_required" : "blocked",
    summary: `Database readiness evaluated postgres, migrations, connection config, and backup posture.`,
  };
}

export function buildStorageReadiness(sources: ProductionReadinessSources): StorageReadiness {
  const objectStorageConfiguration =
    sources.s3StorageSource.includes("createObjectStorage") &&
    sources.envExampleSource.includes("S3_BUCKET=")
      ? "ready"
      : "blocked";
  const bucketReadiness =
    sources.dockerComposeSource.includes("minio-init") &&
    sources.dockerComposeSource.includes("app13-evidence")
      ? "ready"
      : "attention_required";
  const uploadSupport =
    sources.existingPaths.has("database/migrations/010_upload_intents.sql") &&
    sources.s3StorageSource.includes("createPresignedPut")
      ? "ready"
      : "attention_required";
  const retentionReadiness =
    sources.s3StorageSource.includes("HeadObjectCommand") &&
    sources.existingPaths.has("database/migrations/010_upload_intents.sql")
      ? "attention_required"
      : "blocked";

  return {
    objectStorageConfiguration,
    bucketReadiness,
    uploadSupport,
    retentionReadiness,
    summary: `Storage readiness reviewed object storage configuration, bucket bootstrap, uploads, and retention support.`,
  };
}

export function buildSecurityReadiness(sources: ProductionReadinessSources): SecurityReadiness {
  const authCoverage =
    sources.serverSource.includes("requireAuthMiddleware") &&
    sources.serverSource.includes("createAuthenticateMiddleware")
      ? "ready"
      : "blocked";
  const secretManagement =
    sources.configSource.includes('secret: z.string().min(32)') &&
    sources.envExampleSource.includes("JWT_SECRET=")
      ? "ready"
      : "blocked";
  const roleProtection =
    sources.serverSource.includes("securityAuth") &&
    sources.existingPaths.has("database/migrations/015_security_kernel.sql")
      ? "ready"
      : "attention_required";
  const securityScore = scoreFromLevels([authCoverage, secretManagement, roleProtection]);

  return {
    authCoverage,
    secretManagement,
    roleProtection,
    securityScore,
    summary: `Security readiness scored ${securityScore} across auth coverage, secret management, and role protection.`,
  };
}

export function buildMonitoringReadiness(sources: ProductionReadinessSources): MonitoringReadiness {
  const loggingSupport =
    sources.loggingSource.includes("createLogger") &&
    sources.indexSource.includes("createLogger")
      ? "ready"
      : "blocked";
  const healthChecks =
    sources.healthRouteSource.includes('app.get("/health"') &&
    sources.dockerComposeSource.includes("healthcheck:")
      ? "ready"
      : "attention_required";
  const monitoringSupport =
    sources.existingPaths.has("database/migrations/006_audit.sql") &&
    sources.serverSource.includes("errorHandler")
      ? "ready"
      : "attention_required";
  const observabilityScore = scoreFromLevels([
    loggingSupport,
    monitoringSupport,
    healthChecks,
  ]);

  return {
    loggingSupport,
    monitoringSupport,
    healthChecks,
    observabilityScore,
    summary: `Monitoring readiness scored ${observabilityScore} across logging, monitoring hooks, and health checks.`,
  };
}

export function buildDeploymentReadiness(sources: ProductionReadinessSources): DeploymentReadiness {
  const deploymentArtifacts =
    sources.packageSource.includes('"build"') &&
    sources.packageSource.includes('"start"') &&
    sources.existingPaths.has("docker-compose.yml")
      ? "ready"
      : "attention_required";
  const startupScripts =
    sources.packageSource.includes('"migrate"') &&
    sources.indexSource.includes("buildServer") &&
    sources.existingPaths.has("scripts/migrate.ts")
      ? "ready"
      : "blocked";
  const runtimeRequirements =
    sources.packageSource.includes('"node": ">=20"') &&
    sources.configSource.includes("loadConfig")
      ? "ready"
      : "attention_required";
  const deploymentScore = scoreFromLevels([
    deploymentArtifacts,
    startupScripts,
    runtimeRequirements,
  ]);

  return {
    deploymentArtifacts,
    startupScripts,
    runtimeRequirements,
    deploymentScore,
    summary: `Deployment readiness scored ${deploymentScore} across artifacts, startup scripts, and runtime requirements.`,
  };
}

export function buildDisasterRecoveryReadiness(
  sources: ProductionReadinessSources
): DisasterRecoveryReadiness {
  const backupCoverage =
    sources.dockerComposeSource.includes("postgres_data:") &&
    sources.dockerComposeSource.includes("minio_data:")
      ? "ready"
      : "blocked";
  const recoveryGuidance =
    sources.existingPaths.has("docs/experience/X25-Production-Readiness-Center.md") &&
    sources.migrateScriptSource.includes("migrations complete")
      ? "attention_required"
      : "blocked";
  const operationalResilience =
    sources.dockerComposeSource.includes("redis:") &&
    sources.dockerComposeSource.includes("healthcheck:")
      ? "ready"
      : "attention_required";
  const recoveryScore = scoreFromLevels([
    backupCoverage,
    recoveryGuidance,
    operationalResilience,
  ]);

  return {
    backupCoverage,
    recoveryGuidance,
    operationalResilience,
    recoveryScore,
    summary: `Disaster recovery readiness scored ${recoveryScore} across backup coverage, recovery guidance, and resilience.`,
  };
}

export function buildProductionRiskRegister(input: {
  environment: EnvironmentAudit;
  database: DatabaseReadiness;
  storage: StorageReadiness;
  security: SecurityReadiness;
  monitoring: MonitoringReadiness;
  deployment: DeploymentReadiness;
  disasterRecovery: DisasterRecoveryReadiness;
}): ProductionRiskRegister {
  const risks: ProductionRisk[] = [];

  if (input.environment.missingVariables.length > 0) {
    risks.push({
      category: "infrastructure",
      severity: "high",
      message: `${input.environment.missingVariables.length} required environment variables are missing from documentation or runtime.`,
      mitigation: "Document and configure all required environment variables before launch.",
    });
  }

  if (input.database.migrationsStatus === "blocked") {
    risks.push({
      category: "database",
      severity: "critical",
      message: "Database migrations are not fully applied.",
      mitigation: "Run npm run migrate against the production database before launch.",
    });
  }

  if (input.database.backupReadiness === "blocked") {
    risks.push({
      category: "database",
      severity: "high",
      message: "Automated database backup coverage is not evidenced.",
      mitigation: "Configure scheduled PostgreSQL backups and verify restore procedures.",
    });
  }

  if (input.storage.objectStorageConfiguration === "blocked") {
    risks.push({
      category: "storage",
      severity: "high",
      message: "Object storage configuration is incomplete.",
      mitigation: "Configure S3-compatible storage credentials and bucket bootstrap.",
    });
  }

  if (input.security.secretManagement === "blocked") {
    risks.push({
      category: "security",
      severity: "critical",
      message: "Secret management requirements are not satisfied.",
      mitigation: "Use production-grade secrets with minimum JWT secret length enforcement.",
    });
  }

  if (input.security.authCoverage === "blocked") {
    risks.push({
      category: "security",
      severity: "critical",
      message: "Authentication middleware coverage is incomplete.",
      mitigation: "Ensure authenticate and require-auth middleware are registered globally.",
    });
  }

  if (input.monitoring.healthChecks !== "ready") {
    risks.push({
      category: "monitoring",
      severity: "medium",
      message: "Health check coverage requires attention.",
      mitigation: "Validate /health endpoint and infrastructure health checks in deployment.",
    });
  }

  if (input.deployment.startupScripts === "blocked") {
    risks.push({
      category: "deployment",
      severity: "high",
      message: "Startup and migration scripts are incomplete.",
      mitigation: "Verify migrate script and server startup path in deployment pipeline.",
    });
  }

  if (input.disasterRecovery.backupCoverage === "blocked") {
    risks.push({
      category: "infrastructure",
      severity: "high",
      message: "Disaster recovery backup coverage is insufficient.",
      mitigation: "Persist postgres and object storage volumes with backup retention policies.",
    });
  }

  return {
    risks,
    summary: `Production risk register tracks ${risks.length} infrastructure, security, deployment, storage, database, and monitoring risks.`,
  };
}

export function buildLaunchRecommendations(input: {
  riskRegister: ProductionRiskRegister;
  environment: EnvironmentAudit;
  database: DatabaseReadiness;
  deployment: DeploymentReadiness;
  disasterRecovery: DisasterRecoveryReadiness;
}): LaunchRecommendations {
  const blockers = input.riskRegister.risks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 5)
    .map((risk) => ({
      group: "blockers" as const,
      title: risk.message,
      reason: risk.category,
      action: risk.mitigation,
    }));

  const beforeLaunch: LaunchRecommendation[] = [];
  if (input.environment.environmentCoverageScore < 100) {
    beforeLaunch.push({
      group: "before_launch",
      title: "Complete environment variable coverage",
      reason: "environment audit",
      action: "Document and inject all required runtime variables in production.",
    });
  }
  if (input.database.migrationsStatus !== "ready") {
    beforeLaunch.push({
      group: "before_launch",
      title: "Apply pending database migrations",
      reason: "database readiness",
      action: "Run migrations and verify schema_migrations parity.",
    });
  }
  if (input.deployment.deploymentScore < 75) {
    beforeLaunch.push({
      group: "before_launch",
      title: "Validate deployment artifacts and startup path",
      reason: "deployment readiness",
      action: "Confirm build, start, migrate, and compose artifacts in CI/CD.",
    });
  }

  const afterLaunch = [
    {
      group: "after_launch" as const,
      title: "Expand backup and restore drills",
      reason: "disaster recovery",
      action: "Schedule periodic restore tests for database and object storage backups.",
    },
    {
      group: "after_launch" as const,
      title: "Monitor observability signals",
      reason: "monitoring readiness",
      action: "Track health checks, audit logs, and service-level alerts post launch.",
    },
  ];

  if (input.disasterRecovery.recoveryScore >= 75) {
    afterLaunch.unshift({
      group: "after_launch",
      title: "Maintain disaster recovery posture",
      reason: "disaster recovery strength",
      action: "Keep backup coverage and resilience checks in operational runbooks.",
    });
  }

  return {
    blockers,
    beforeLaunch,
    afterLaunch,
    summary: `Launch recommendations grouped ${blockers.length} blockers, ${beforeLaunch.length} before launch, and ${afterLaunch.length} after launch actions.`,
  };
}

export function computeProductionReadinessScore(input: {
  environment: EnvironmentAudit;
  database: DatabaseReadiness;
  storage: StorageReadiness;
  security: SecurityReadiness;
  monitoring: MonitoringReadiness;
  deployment: DeploymentReadiness;
  disasterRecovery: DisasterRecoveryReadiness;
}): ProductionReadinessScore {
  const environmentWeight = 15;
  const databaseWeight = 15;
  const storageWeight = 14;
  const securityWeight = 14;
  const monitoringWeight = 14;
  const deploymentWeight = 14;
  const disasterRecoveryWeight = 14;

  const databaseScore = scoreFromLevels([
    input.database.postgresReadiness,
    input.database.migrationsStatus,
    input.database.connectionConfiguration,
    input.database.backupReadiness,
  ]);
  const storageScore = scoreFromLevels([
    input.storage.objectStorageConfiguration,
    input.storage.bucketReadiness,
    input.storage.uploadSupport,
    input.storage.retentionReadiness,
  ]);

  const score = Math.round(
    input.environment.environmentCoverageScore * (environmentWeight / 100) +
      databaseScore * (databaseWeight / 100) +
      storageScore * (storageWeight / 100) +
      input.security.securityScore * (securityWeight / 100) +
      input.monitoring.observabilityScore * (monitoringWeight / 100) +
      input.deployment.deploymentScore * (deploymentWeight / 100) +
      input.disasterRecovery.recoveryScore * (disasterRecoveryWeight / 100)
  );

  return {
    score,
    status: levelFromScore(score),
    environmentWeight,
    databaseWeight,
    storageWeight,
    securityWeight,
    monitoringWeight,
    deploymentWeight,
    disasterRecoveryWeight,
    summary: `Production readiness score ${score} (${levelFromScore(score).replace("_", " ")}) across environment, database, storage, security, monitoring, deployment, and disaster recovery.`,
  };
}

export function buildProductionOverview(input: {
  readinessScore: ProductionReadinessScore;
  database: DatabaseReadiness;
  monitoring: MonitoringReadiness;
  deployment: DeploymentReadiness;
  riskRegister: ProductionRiskRegister;
}): ProductionOverview {
  const operationalReadiness = levelFromScore(
    scoreFromLevels([
      input.database.postgresReadiness,
      input.database.connectionConfiguration,
      input.monitoring.healthChecks,
    ])
  );

  return {
    headline: "APP13 production readiness center",
    productionReadinessScore: input.readinessScore.score,
    launchReadiness: input.readinessScore.status,
    operationalReadiness,
    deploymentReadiness: levelFromScore(input.deployment.deploymentScore),
    riskLevel: highestRiskLevel(input.riskRegister.risks),
    summary: `Production overview: score ${input.readinessScore.score}, launch ${input.readinessScore.status}, risk ${highestRiskLevel(input.riskRegister.risks)}.`,
  };
}

export function buildProductionReadinessSnapshot(input: {
  raw: ProductionReadinessRawSnapshot;
  generatedAt?: Date;
}): ProductionReadinessSnapshot {
  const generatedAt = input.generatedAt ?? new Date();
  const sources = input.raw.sources;
  const environment = buildEnvironmentAudit(sources);
  const database = buildDatabaseReadiness(sources);
  const storage = buildStorageReadiness(sources);
  const security = buildSecurityReadiness(sources);
  const monitoring = buildMonitoringReadiness(sources);
  const deployment = buildDeploymentReadiness(sources);
  const disasterRecovery = buildDisasterRecoveryReadiness(sources);
  const riskRegister = buildProductionRiskRegister({
    environment,
    database,
    storage,
    security,
    monitoring,
    deployment,
    disasterRecovery,
  });
  const recommendations = buildLaunchRecommendations({
    riskRegister,
    environment,
    database,
    deployment,
    disasterRecovery,
  });
  const readinessScore = computeProductionReadinessScore({
    environment,
    database,
    storage,
    security,
    monitoring,
    deployment,
    disasterRecovery,
  });
  const overview = buildProductionOverview({
    readinessScore,
    database,
    monitoring,
    deployment,
    riskRegister,
  });

  return {
    overview,
    environment,
    database,
    storage,
    security,
    monitoring,
    deployment,
    disasterRecovery,
    riskRegister,
    recommendations,
    readinessScore,
    generatedAt,
  };
}

export function buildProductionReadinessCenter(input: {
  snapshot: ProductionReadinessSnapshot;
}): ProductionReadinessCenter {
  return {
    overview: input.snapshot.overview,
    environment: input.snapshot.environment,
    database: input.snapshot.database,
    storage: input.snapshot.storage,
    security: input.snapshot.security,
    monitoring: input.snapshot.monitoring,
    deployment: input.snapshot.deployment,
    disasterRecovery: input.snapshot.disasterRecovery,
    riskRegister: input.snapshot.riskRegister,
    recommendations: input.snapshot.recommendations,
    readinessScore: input.snapshot.readinessScore,
    generatedAt: input.snapshot.generatedAt,
  };
}

export function collectProductionReadinessPaths(): string[] {
  return PRODUCTION_ARTIFACT_PATHS;
}

export interface ProductionOverviewView {
  headline: string;
  production_readiness_score: number;
  launch_readiness: ReadinessLevel;
  operational_readiness: ReadinessLevel;
  deployment_readiness: ReadinessLevel;
  risk_level: RiskLevel;
  summary: string;
}

export interface EnvironmentAuditView {
  env_files: string[];
  required_variables: string[];
  missing_variables: string[];
  environment_coverage_score: number;
  summary: string;
}

export interface DatabaseReadinessView {
  postgres_readiness: ReadinessLevel;
  migrations_status: ReadinessLevel;
  connection_configuration: ReadinessLevel;
  backup_readiness: ReadinessLevel;
  summary: string;
}

export interface StorageReadinessView {
  object_storage_configuration: ReadinessLevel;
  bucket_readiness: ReadinessLevel;
  upload_support: ReadinessLevel;
  retention_readiness: ReadinessLevel;
  summary: string;
}

export interface SecurityReadinessView {
  auth_coverage: ReadinessLevel;
  secret_management: ReadinessLevel;
  role_protection: ReadinessLevel;
  security_score: number;
  summary: string;
}

export interface MonitoringReadinessView {
  logging_support: ReadinessLevel;
  monitoring_support: ReadinessLevel;
  health_checks: ReadinessLevel;
  observability_score: number;
  summary: string;
}

export interface DeploymentReadinessView {
  deployment_artifacts: ReadinessLevel;
  startup_scripts: ReadinessLevel;
  runtime_requirements: ReadinessLevel;
  deployment_score: number;
  summary: string;
}

export interface DisasterRecoveryReadinessView {
  backup_coverage: ReadinessLevel;
  recovery_guidance: ReadinessLevel;
  operational_resilience: ReadinessLevel;
  recovery_score: number;
  summary: string;
}

export interface ProductionRiskView {
  category: ProductionRiskCategory;
  severity: RiskLevel;
  message: string;
  mitigation: string;
}

export interface ProductionRiskRegisterView {
  risks: ProductionRiskView[];
  summary: string;
}

export interface LaunchRecommendationView {
  group: LaunchRecommendation["group"];
  title: string;
  reason: string;
  action: string;
}

export interface LaunchRecommendationsView {
  blockers: LaunchRecommendationView[];
  before_launch: LaunchRecommendationView[];
  after_launch: LaunchRecommendationView[];
  summary: string;
}

export interface ProductionReadinessScoreView {
  score: number;
  status: ReadinessLevel;
  environment_weight: number;
  database_weight: number;
  storage_weight: number;
  security_weight: number;
  monitoring_weight: number;
  deployment_weight: number;
  disaster_recovery_weight: number;
  summary: string;
}

export interface ProductionReadinessCenterView {
  overview: ProductionOverviewView;
  environment: EnvironmentAuditView;
  database: DatabaseReadinessView;
  storage: StorageReadinessView;
  security: SecurityReadinessView;
  monitoring: MonitoringReadinessView;
  deployment: DeploymentReadinessView;
  disaster_recovery: DisasterRecoveryReadinessView;
  risk_register: ProductionRiskRegisterView;
  recommendations: LaunchRecommendationsView;
  readiness_score: ProductionReadinessScoreView;
  generated_at: string;
}

export function toProductionOverviewView(overview: ProductionOverview): ProductionOverviewView {
  return {
    headline: overview.headline,
    production_readiness_score: overview.productionReadinessScore,
    launch_readiness: overview.launchReadiness,
    operational_readiness: overview.operationalReadiness,
    deployment_readiness: overview.deploymentReadiness,
    risk_level: overview.riskLevel,
    summary: overview.summary,
  };
}

export function toEnvironmentAuditView(audit: EnvironmentAudit): EnvironmentAuditView {
  return {
    env_files: audit.envFiles,
    required_variables: audit.requiredVariables,
    missing_variables: audit.missingVariables,
    environment_coverage_score: audit.environmentCoverageScore,
    summary: audit.summary,
  };
}

export function toDatabaseReadinessView(readiness: DatabaseReadiness): DatabaseReadinessView {
  return {
    postgres_readiness: readiness.postgresReadiness,
    migrations_status: readiness.migrationsStatus,
    connection_configuration: readiness.connectionConfiguration,
    backup_readiness: readiness.backupReadiness,
    summary: readiness.summary,
  };
}

export function toStorageReadinessView(readiness: StorageReadiness): StorageReadinessView {
  return {
    object_storage_configuration: readiness.objectStorageConfiguration,
    bucket_readiness: readiness.bucketReadiness,
    upload_support: readiness.uploadSupport,
    retention_readiness: readiness.retentionReadiness,
    summary: readiness.summary,
  };
}

export function toSecurityReadinessView(readiness: SecurityReadiness): SecurityReadinessView {
  return {
    auth_coverage: readiness.authCoverage,
    secret_management: readiness.secretManagement,
    role_protection: readiness.roleProtection,
    security_score: readiness.securityScore,
    summary: readiness.summary,
  };
}

export function toMonitoringReadinessView(readiness: MonitoringReadiness): MonitoringReadinessView {
  return {
    logging_support: readiness.loggingSupport,
    monitoring_support: readiness.monitoringSupport,
    health_checks: readiness.healthChecks,
    observability_score: readiness.observabilityScore,
    summary: readiness.summary,
  };
}

export function toDeploymentReadinessView(readiness: DeploymentReadiness): DeploymentReadinessView {
  return {
    deployment_artifacts: readiness.deploymentArtifacts,
    startup_scripts: readiness.startupScripts,
    runtime_requirements: readiness.runtimeRequirements,
    deployment_score: readiness.deploymentScore,
    summary: readiness.summary,
  };
}

export function toDisasterRecoveryReadinessView(
  readiness: DisasterRecoveryReadiness
): DisasterRecoveryReadinessView {
  return {
    backup_coverage: readiness.backupCoverage,
    recovery_guidance: readiness.recoveryGuidance,
    operational_resilience: readiness.operationalResilience,
    recovery_score: readiness.recoveryScore,
    summary: readiness.summary,
  };
}

export function toProductionRiskView(risk: ProductionRisk): ProductionRiskView {
  return {
    category: risk.category,
    severity: risk.severity,
    message: risk.message,
    mitigation: risk.mitigation,
  };
}

export function toProductionRiskRegisterView(
  register: ProductionRiskRegister
): ProductionRiskRegisterView {
  return {
    risks: register.risks.map(toProductionRiskView),
    summary: register.summary,
  };
}

export function toLaunchRecommendationView(
  recommendation: LaunchRecommendation
): LaunchRecommendationView {
  return {
    group: recommendation.group,
    title: recommendation.title,
    reason: recommendation.reason,
    action: recommendation.action,
  };
}

export function toLaunchRecommendationsView(
  recommendations: LaunchRecommendations
): LaunchRecommendationsView {
  return {
    blockers: recommendations.blockers.map(toLaunchRecommendationView),
    before_launch: recommendations.beforeLaunch.map(toLaunchRecommendationView),
    after_launch: recommendations.afterLaunch.map(toLaunchRecommendationView),
    summary: recommendations.summary,
  };
}

export function toProductionReadinessScoreView(
  score: ProductionReadinessScore
): ProductionReadinessScoreView {
  return {
    score: score.score,
    status: score.status,
    environment_weight: score.environmentWeight,
    database_weight: score.databaseWeight,
    storage_weight: score.storageWeight,
    security_weight: score.securityWeight,
    monitoring_weight: score.monitoringWeight,
    deployment_weight: score.deploymentWeight,
    disaster_recovery_weight: score.disasterRecoveryWeight,
    summary: score.summary,
  };
}

export function toProductionReadinessCenterView(
  center: ProductionReadinessCenter
): ProductionReadinessCenterView {
  return {
    overview: toProductionOverviewView(center.overview),
    environment: toEnvironmentAuditView(center.environment),
    database: toDatabaseReadinessView(center.database),
    storage: toStorageReadinessView(center.storage),
    security: toSecurityReadinessView(center.security),
    monitoring: toMonitoringReadinessView(center.monitoring),
    deployment: toDeploymentReadinessView(center.deployment),
    disaster_recovery: toDisasterRecoveryReadinessView(center.disasterRecovery),
    risk_register: toProductionRiskRegisterView(center.riskRegister),
    recommendations: toLaunchRecommendationsView(center.recommendations),
    readiness_score: toProductionReadinessScoreView(center.readinessScore),
    generated_at: center.generatedAt.toISOString(),
  };
}
