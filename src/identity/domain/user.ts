/** Identity domain model — aligned with identity schema + OpenAPI v1.1 */

export type AccountStatus = "active" | "suspended" | "deactivated";

export type VerificationTier = "T0" | "T1" | "T2" | "T3" | "T4";

export type VerificationStatus =
  | "pending"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

export type CredentialStatus = "pending" | "verified" | "expired" | "revoked";

export type ProviderStatus = "pending" | "active" | "suspended";

/** Primary account role stored on identity.users.role */
export type PrimaryUserRole = "customer" | "provider" | "admin";

/** OpenAPI PlatformRole — derived for JWT/session */
export type PlatformRole =
  | "customer"
  | "provider"
  | "verification_analyst"
  | "complaint_adjudicator"
  | "trust_ops"
  | "platform_admin"
  | "super_admin";

export interface User {
  id: string;
  email: string;
  phone: string | null;
  passwordHash: string | null;
  role: PrimaryUserRole;
  status: AccountStatus;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  verificationTier: VerificationTier;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  displayName: string;
  legalName: string | null;
  avatarStorageKey: string | null;
  companyId: string | null;
  defaultLocation: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  displayName: string;
  businessName: string | null;
  bio: string | null;
  primaryTrade: string | null;
  slug: string | null;
  status: ProviderStatus;
  avatarStorageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Verification {
  id: string;
  userId: string;
  tier: VerificationTier;
  status: VerificationStatus;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedByUserId: string | null;
  expiresAt: Date | null;
  rejectionReason: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Credential {
  id: string;
  providerId: string;
  verificationId: string | null;
  credentialType: string;
  credentialName: string;
  issuingAuthority: string | null;
  credentialNumber: string | null;
  status: CredentialStatus;
  issuedAt: Date | null;
  expiresAt: Date | null;
  storageKey: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export function platformRolesForUser(user: User): PlatformRole[] {
  if (user.role === "admin") {
    return ["platform_admin"];
  }
  if (user.role === "provider") {
    return ["provider"];
  }
  return ["customer"];
}

export function isEmailVerified(user: User): boolean {
  return user.emailVerifiedAt !== null;
}

export function meetsTier(user: User, required: VerificationTier): boolean {
  const order: VerificationTier[] = ["T0", "T1", "T2", "T3", "T4"];
  return order.indexOf(user.verificationTier) >= order.indexOf(required);
}
