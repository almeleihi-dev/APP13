export {
  type AccountStatus,
  type VerificationTier,
  type VerificationStatus,
  type CredentialStatus,
  type ProviderStatus,
  type PrimaryUserRole,
  type PlatformRole,
  type User,
  type CustomerProfile,
  type ProviderProfile,
  type Verification,
  type Credential,
  platformRolesForUser,
  isEmailVerified,
  meetsTier,
} from "./user.js";

export {
  validatePassword,
  PASSWORD_MIN_LENGTH,
} from "./password-policy.js";

export {
  requireEmailVerifiedForActionCreate,
  TierGateError,
} from "./tier-gates.js";
