import { loadConfig } from "./shared/config/index.js";
import { createLogger } from "./shared/logging/index.js";
import { createPool } from "./shared/db/index.js";
import { createIdempotencyService } from "./platform/idempotency/index.js";
import {
  createJwtService,
  createSessionStore,
  createTokenStore,
  createKycSandboxAdapter,
  identityRepository,
  verificationRepository,
} from "./identity/infrastructure/index.js";
import {
  createAuthService,
  createRegistrationService,
  createProfileService,
  createVerificationService,
  createIdentityRevalidationService,
} from "./identity/application/index.js";
import { buildServer } from "./api/server.js";
import { createActionService } from "./action/application/action-service.js";
import { createContractEngineService } from "./contract/application/contract-engine.service.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config);
  const db = createPool(config, logger);
  const idempotency = createIdempotencyService(config);

  const jwt = createJwtService(config);
  const sessions = createSessionStore(config);
  const tokenStore = createTokenStore(config);
  const kyc = createKycSandboxAdapter(config, logger);

  const auth = createAuthService({
    db,
    identityRepo: identityRepository,
    jwt,
    sessions,
    tokenStore,
    config,
    logger,
  });

  const registration = createRegistrationService({
    db,
    identityRepo: identityRepository,
    auth,
    tokenStore,
    logger,
  });

  const profile = createProfileService(db, identityRepository);
  const verification = createVerificationService({
    db,
    identityRepo: identityRepository,
    verificationRepo: verificationRepository,
    tokenStore,
    kyc,
    config,
    logger,
  });

  const revalidation = createIdentityRevalidationService(db, identityRepository);

  const actions = createActionService(db, identityRepository);
  const contracts = createContractEngineService(db, identityRepository);

  const app = await buildServer({
    config,
    logger,
    db,
    idempotency,
    jwt,
    sessions,
    auth,
    registration,
    profile,
    verification,
    revalidation,
    actions,
    contracts,
  });

  try {
    await app.listen({ host: config.host, port: config.port });
    logger.info({ port: config.port }, "app13-api listening");
  } catch (error) {
    logger.fatal({ err: error }, "failed to start server");
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutting down");
    await app.close();
    await db.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
