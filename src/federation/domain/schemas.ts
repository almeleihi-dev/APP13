/**
 * Federation validation schemas (zod).
 * Normalizes and validates input at the module boundary.
 */
import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(320);

export const localeSchema = z.string().trim().min(2).max(10);

/** Register a new Person (email-first). Password optional at Phase 1A. */
export const registerPersonSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(200).optional(),
  displayName: z.string().trim().min(1).max(120).optional(),
  locale: localeSchema.optional(),
});

export type RegisterPersonInput = z.infer<typeof registerPersonSchema>;

/** Verify email/password credentials (used by later phases; not wired to any route in 1A). */
export const verifyCredentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export type VerifyCredentialsInput = z.infer<typeof verifyCredentialsSchema>;

/** Link a future Apple/Google provider credential to an existing Person. */
export const linkProviderCredentialSchema = z.object({
  type: z.enum(["apple", "google"]),
  providerSubject: z.string().trim().min(1).max(255),
});

export type LinkProviderCredentialInput = z.infer<
  typeof linkProviderCredentialSchema
>;
