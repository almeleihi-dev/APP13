-- APP13 PostgreSQL Schema v1.1
-- Migration 008: Async operations table (P1-B1, Backend Review)
-- Target: PostgreSQL 16+
-- Backs GET /operations/{id} polling for async 202 chains

BEGIN;

CREATE TABLE platform.operations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type      TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'queued',
    resource_type       TEXT,
    resource_id         UUID,
    payload             JSONB NOT NULL DEFAULT '{}',
    error               TEXT,
    idempotency_key     TEXT,
    request_id          TEXT,
    actor_user_id       UUID,
    attempts            INT NOT NULL DEFAULT 0,
    max_retries         INT NOT NULL DEFAULT 3,
    claimed_by          TEXT,
    claimed_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_operations_status CHECK (
        status IN ('queued', 'in_progress', 'completed', 'failed')
    ),
    CONSTRAINT chk_operations_attempts_nonneg CHECK (attempts >= 0),
    CONSTRAINT chk_operations_max_retries_positive CHECK (max_retries > 0)
);

COMMENT ON TABLE platform.operations IS
    'Async operation status for 202 + poll chains (activate, complete, apply-outcome)';

CREATE INDEX idx_operations_status_created
    ON platform.operations (status, created_at)
    WHERE status IN ('queued', 'in_progress');

CREATE INDEX idx_operations_resource
    ON platform.operations (resource_type, resource_id)
    WHERE resource_id IS NOT NULL;

CREATE INDEX idx_operations_idempotency_key
    ON platform.operations (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE TRIGGER trg_operations_updated_at
    BEFORE UPDATE ON platform.operations
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

COMMIT;
