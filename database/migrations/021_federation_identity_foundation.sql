-- APP13 PostgreSQL Schema
-- Migration 021: Federation identity foundation (Person + Credential)
-- Federation Spine — Phase 1A. Ecosystem-level identity that sits ABOVE the
-- engines (AN ACT / Wegleiter / R ACT). Answers only "who is accessing the
-- ecosystem". Contains NO engine domain data.
--
-- SAFETY: additive only. Creates a new `federation` schema and two tables.
-- Does NOT touch identity/action/contract/execution/complaint/trust/platform
-- schemas. No data migration, no backfill, no changes to existing rows.
-- Target: PostgreSQL 16+

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS federation;

COMMENT ON SCHEMA federation IS
    'Federation Spine — ecosystem-level identity (Person, Credential). Holds ONLY identity-of-access. No contracts, actions, passports, reflections, patterns, trust scores, or behavioral data.';

-- ---------------------------------------------------------------------------
-- federation.person — Global human identity ("who is accessing the ecosystem")
-- ---------------------------------------------------------------------------
CREATE TABLE federation.person (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_email       TEXT NOT NULL,
    email_verified_at   TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'active',
    display_name        TEXT,
    locale              TEXT NOT NULL DEFAULT 'en',
    auth_level          TEXT NOT NULL DEFAULT 'L1',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT chk_person_status
        CHECK (status IN ('active', 'suspended', 'closed')),
    CONSTRAINT chk_person_auth_level
        CHECK (auth_level IN ('L1', 'L2', 'L3'))
);

-- One live Person per email (case-insensitive), mirroring identity.users' lower(email) convention.
CREATE UNIQUE INDEX uq_person_primary_email
    ON federation.person (lower(primary_email))
    WHERE deleted_at IS NULL;

COMMENT ON TABLE federation.person IS
    'Global human identity. Allowed: id, primary_email, verification state, status, display_name, locale, auth_level, timestamps. Forbidden: contracts, actions, passports, reflections, Wegleiter patterns, trust scores, behavioral data.';

-- ---------------------------------------------------------------------------
-- federation.credential — Authentication providers for a Person.
-- Secrets live ONLY here (password hash / provider subject). No engine data.
-- ---------------------------------------------------------------------------
CREATE TABLE federation.credential (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL,
    type                TEXT NOT NULL,
    secret_ref          TEXT,
    provider_subject    TEXT,
    status              TEXT NOT NULL DEFAULT 'active',
    last_used_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT fk_credential_person
        FOREIGN KEY (person_id) REFERENCES federation.person (id) ON DELETE CASCADE,
    CONSTRAINT chk_credential_type
        CHECK (type IN ('password', 'apple', 'google', 'passkey')),
    CONSTRAINT chk_credential_status
        CHECK (status IN ('active', 'revoked')),
    -- password carries a secret_ref; apple/google carry a provider_subject.
    CONSTRAINT chk_credential_shape CHECK (
        (type = 'password' AND secret_ref IS NOT NULL)
        OR (type IN ('apple', 'google') AND provider_subject IS NOT NULL)
        OR (type = 'passkey')
    )
);

CREATE INDEX idx_credential_person
    ON federation.credential (person_id)
    WHERE deleted_at IS NULL;

-- At most one active password/passkey credential per person.
CREATE UNIQUE INDEX uq_credential_person_type_active
    ON federation.credential (person_id, type)
    WHERE deleted_at IS NULL AND type IN ('password', 'passkey');

-- A provider subject (Apple/Google) maps to exactly one active credential.
CREATE UNIQUE INDEX uq_credential_provider_subject
    ON federation.credential (type, provider_subject)
    WHERE deleted_at IS NULL AND provider_subject IS NOT NULL;

COMMENT ON TABLE federation.credential IS
    'Authentication providers for a Person (email/password now; Apple/Google/passkey later). Secrets live ONLY here. No engine domain data.';

COMMIT;
