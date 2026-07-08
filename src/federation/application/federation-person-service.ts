import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
// Reuse the identity password hasher — DO NOT duplicate credential hashing logic.
import {
  hashPassword,
  verifyPassword,
} from "../../identity/infrastructure/password-hasher.js";
import type { Person } from "../domain/person.js";
import type { Credential } from "../domain/credential.js";
import {
  linkProviderCredentialSchema,
  registerPersonSchema,
  verifyCredentialsSchema,
  type LinkProviderCredentialInput,
  type RegisterPersonInput,
} from "../domain/schemas.js";
import { PersonRepository } from "../infrastructure/person-repository.js";
import { CredentialRepository } from "../infrastructure/credential-repository.js";

/** Postgres unique_violation. */
const PG_UNIQUE_VIOLATION = "23505";

function emailAlreadyRegistered(): AppError {
  return new AppError(
    problem({
      title: "Email already registered",
      status: 409,
      code: ErrorCodes.VALIDATION_ERROR,
      engine: "platform",
      detail: "A Person already exists for this email.",
    })
  );
}

export interface FederationPersonServiceDeps {
  db: DbPool;
  persons?: PersonRepository;
  credentials?: CredentialRepository;
}

/**
 * FederationPersonService — Phase 1A.
 *
 * Owns Person + Credential lifecycle at the ecosystem level. It does NOT
 * create engine identities, links, consent, sessions, or tokens (later phases),
 * and is intentionally not wired into the HTTP server in Phase 1A.
 */
export class FederationPersonService {
  private readonly db: DbPool;
  private readonly persons: PersonRepository;
  private readonly credentials: CredentialRepository;

  constructor(deps: FederationPersonServiceDeps) {
    this.db = deps.db;
    this.persons = deps.persons ?? new PersonRepository();
    this.credentials = deps.credentials ?? new CredentialRepository();
  }

  /**
   * Register a new Person (email-first). Optionally attaches a password
   * credential. Prevents duplicate accounts by email (checked + unique index).
   */
  async registerPerson(input: RegisterPersonInput): Promise<Person> {
    const parsed = registerPersonSchema.parse(input);
    const secretRef = parsed.password
      ? await hashPassword(parsed.password)
      : null;

    try {
      return await this.db.withTransaction(async (tx) => {
        const existing = await this.persons.findByEmail(tx, parsed.email);
        if (existing) {
          throw emailAlreadyRegistered();
        }
        const person = await this.persons.insert(tx, {
          primaryEmail: parsed.email,
          displayName: parsed.displayName ?? null,
          locale: parsed.locale ?? "en",
          authLevel: "L1",
          status: "active",
        });
        if (secretRef) {
          await this.credentials.insert(tx, {
            personId: person.id,
            type: "password",
            secretRef,
          });
        }
        return person;
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === PG_UNIQUE_VIOLATION
      ) {
        // Race: another request created the same email between check and insert.
        throw emailAlreadyRegistered();
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Person | null> {
    const parsed = registerPersonSchema.pick({ email: true }).parse({ email });
    return this.persons.findByEmail(this.db.pool,parsed.email);
  }

  async findById(personId: string): Promise<Person | null> {
    return this.persons.findById(this.db.pool,personId);
  }

  async listCredentials(personId: string): Promise<Credential[]> {
    return this.credentials.findByPerson(this.db.pool,personId);
  }

  async markEmailVerified(personId: string): Promise<void> {
    await this.persons.markEmailVerified(this.db.pool,personId);
  }

  /**
   * Verify email + password. Returns the Person on success, else null.
   * (Provided for later phases; not exposed via any route in Phase 1A.)
   */
  async verifyEmailCredentials(input: {
    email: string;
    password: string;
  }): Promise<Person | null> {
    const parsed = verifyCredentialsSchema.parse(input);
    const person = await this.persons.findByEmail(this.db.pool,parsed.email);
    if (!person) return null;
    const credential = await this.credentials.findPasswordCredential(
      this.db.pool,
      person.id
    );
    if (!credential?.secretRef) return null;
    const ok = await verifyPassword(parsed.password, credential.secretRef);
    if (!ok) return null;
    await this.credentials.touchLastUsed(this.db.pool,credential.id);
    return person;
  }

  /**
   * Link a future Apple/Google provider credential to an existing Person.
   * Structure is ready now; enabling the providers is a later phase.
   */
  async linkProviderCredential(
    personId: string,
    input: LinkProviderCredentialInput
  ): Promise<Credential> {
    const parsed = linkProviderCredentialSchema.parse(input);
    return this.credentials.insert(this.db.pool,{
      personId,
      type: parsed.type,
      providerSubject: parsed.providerSubject,
    });
  }
}
