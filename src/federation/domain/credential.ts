/**
 * Federation domain — Credential.
 *
 * Authentication providers for a Person. Secrets (password hashes, provider
 * subjects) live ONLY here — never on Person and never inside an engine.
 * Email/password is supported now; Apple/Google/passkey are future-ready.
 */

export type CredentialType = "password" | "apple" | "google" | "passkey";

export type CredentialStatus = "active" | "revoked";

export interface Credential {
  id: string;
  personId: string;
  type: CredentialType;
  /** Password hash for type=password (via identity password-hasher); null for OAuth. */
  secretRef: string | null;
  /** Stable provider subject for apple/google; null otherwise. */
  providerSubject: string | null;
  status: CredentialStatus;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export function isCredentialActive(credential: Credential): boolean {
  return credential.status === "active" && credential.deletedAt === null;
}
