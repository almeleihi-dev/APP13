/**
 * Federation domain — Person.
 *
 * The Person answers exactly one question: "who is accessing the ecosystem?"
 * It holds identity-of-access ONLY. It must NEVER carry engine domain data
 * (contracts, actions, passports, reflections, Wegleiter patterns, trust
 * scores, behavioral data). See federation.person table comment.
 */

export type PersonStatus = "active" | "suspended" | "closed";

/** Coarse assurance of the entry identity — NOT a KYC/verification tier. */
export type AuthLevel = "L1" | "L2" | "L3";

export interface Person {
  id: string;
  primaryEmail: string;
  emailVerifiedAt: Date | null;
  status: PersonStatus;
  displayName: string | null;
  locale: string;
  authLevel: AuthLevel;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** The complete, exhaustive set of fields a Person is permitted to hold. */
export const PERSON_ALLOWED_FIELDS: readonly (keyof Person)[] = [
  "id",
  "primaryEmail",
  "emailVerifiedAt",
  "status",
  "displayName",
  "locale",
  "authLevel",
  "createdAt",
  "updatedAt",
  "deletedAt",
] as const;

/** Field name fragments that must never appear on the Person model. */
export const PERSON_FORBIDDEN_FIELD_MARKERS: readonly string[] = [
  "contract",
  "action",
  "passport",
  "reflection",
  "pattern",
  "trust",
  "behavior",
  "behaviour",
  "score",
  "history",
] as const;

export function isPersonActive(person: Person): boolean {
  return person.status === "active" && person.deletedAt === null;
}

export function isEmailVerified(person: Person): boolean {
  return person.emailVerifiedAt !== null;
}
