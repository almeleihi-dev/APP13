-- APP13 PostgreSQL Schema v1.1
-- Migration 010: Tenancy-bound upload intents (P0-S4 evidence upload-intent/confirm)
-- Target: PostgreSQL 16+

BEGIN;

CREATE TABLE platform.upload_intents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_kind         TEXT NOT NULL DEFAULT 'evidence',
    contract_id         UUID NOT NULL,
    milestone_id        UUID NOT NULL,
    user_id             UUID NOT NULL,
    storage_key         TEXT NOT NULL,
    content_hash        TEXT NOT NULL,
    evidence_type       execution.evidence_type NOT NULL,
    filename            TEXT,
    content_type        TEXT,
    idempotency_key     TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'pending',
    expires_at          TIMESTAMPTZ NOT NULL,
    confirmed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_upload_intents_status CHECK (
        status IN ('pending', 'confirmed', 'expired')
    ),
    CONSTRAINT chk_upload_intents_kind CHECK (intent_kind IN ('evidence')),
    CONSTRAINT uq_upload_intents_idempotency_key UNIQUE (idempotency_key)
);

CREATE INDEX idx_upload_intents_contract_milestone
    ON platform.upload_intents (contract_id, milestone_id, status)
    WHERE status = 'pending';

COMMENT ON TABLE platform.upload_intents IS
    'Server-bound presigned upload intents (P0-S4). storage_key is server-generated.';

COMMIT;
