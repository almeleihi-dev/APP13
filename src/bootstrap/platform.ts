import { loadConfig } from "../shared/config/index.js";
import { createLogger } from "../shared/logging/index.js";
import { createPool } from "../shared/db/index.js";
import { createIdempotencyService } from "../platform/idempotency/index.js";
import {
  createJwtService,
  createSessionStore,
  createTokenStore,
  createKycSandboxAdapter,
  identityRepository,
  verificationRepository,
} from "../identity/infrastructure/index.js";
import {
  createAuthService,
  createRegistrationService,
  createProfileService,
  createVerificationService,
  createIdentityRevalidationService,
} from "../identity/application/index.js";
import type { PlatformDependencies } from "./dependencies.js";

export function bootstrapPlatform(): PlatformDependencies {
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

  return {
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
  };
}
