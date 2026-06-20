-- APP13 PostgreSQL Schema — Financial Kernel
-- Migration 014: payment intents, settlement instructions, processor webhook log
-- Target: PostgreSQL 16+

BEGIN;

-- ---------------------------------------------------------------------------
-- Payment intents (processor funding sessions)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.payment_intents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id           UUID NOT NULL,
    customer_user_id    UUID NOT NULL,
    processor           TEXT NOT NULL DEFAULT 'stripe',
    processor_ref       TEXT,
    status              financial.payment_intent_status NOT NULL DEFAULT 'requires_payment_method',
    amount_minor        BIGINT NOT NULL,
    currency_code       CHAR(3) NOT NULL,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT ck_payment_intents_amount_minor CHECK (amount_minor > 0),
    CONSTRAINT ck_payment_intents_currency_code CHECK (char_length(currency_code) = 3),
    CONSTRAINT uq_payment_intents_processor_ref UNIQUE (processor_ref),
    CONSTRAINT fk_payment_intents_escrow
        FOREIGN KEY (escrow_id) REFERENCES financial.escrow_agreements (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_intents_customer
        FOREIGN KEY (customer_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_payment_intents_escrow_id ON financial.payment_intents (escrow_id);
CREATE INDEX idx_payment_intents_status ON financial.payment_intents (status);

ALTER TABLE financial.escrow_agreements
    ADD CONSTRAINT fk_escrow_agreements_payment_intent
        FOREIGN KEY (payment_intent_id) REFERENCES financial.payment_intents (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Settlement instructions (payout rail after ledger release)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.settlement_instructions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id               UUID NOT NULL,
    journal_id              UUID NOT NULL,
    beneficiary_user_id     UUID NOT NULL,
    amount_minor            BIGINT NOT NULL,
    currency_code           CHAR(3) NOT NULL,
    processor_transfer_ref  TEXT,
    status                  financial.settlement_status NOT NULL DEFAULT 'pending',
    idempotency_key         TEXT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT ck_settlement_instructions_amount_minor CHECK (amount_minor > 0),
    CONSTRAINT ck_settlement_instructions_currency_code CHECK (char_length(currency_code) = 3),
    CONSTRAINT uq_settlement_instructions_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT uq_settlement_instructions_processor_transfer_ref UNIQUE (processor_transfer_ref),
    CONSTRAINT fk_settlement_instructions_escrow
        FOREIGN KEY (escrow_id) REFERENCES financial.escrow_agreements (id) ON DELETE RESTRICT,
    CONSTRAINT fk_settlement_instructions_journal
        FOREIGN KEY (journal_id) REFERENCES financial.journals (id) ON DELETE RESTRICT,
    CONSTRAINT fk_settlement_instructions_beneficiary
        FOREIGN KEY (beneficiary_user_id) REFERENCES identity.users (id) ON DELETE RESTRICT
);

CREATE INDEX idx_settlement_instructions_escrow_id
    ON financial.settlement_instructions (escrow_id);

CREATE INDEX idx_settlement_instructions_status
    ON financial.settlement_instructions (status);

-- ---------------------------------------------------------------------------
-- Processor webhook log (append-only external event audit — FK-10)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.processor_webhook_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processor           TEXT NOT NULL,
    event_type          TEXT NOT NULL,
    processor_ref       TEXT,
    payload             JSONB NOT NULL DEFAULT '{}',
    processed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    journal_id          UUID,
    idempotency_key     TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_processor_webhook_log_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT fk_processor_webhook_log_journal
        FOREIGN KEY (journal_id) REFERENCES financial.journals (id) ON DELETE SET NULL
);

CREATE INDEX idx_processor_webhook_log_processor_ref
    ON financial.processor_webhook_log (processor_ref)
    WHERE processor_ref IS NOT NULL;

CREATE INDEX idx_processor_webhook_log_processed_at
    ON financial.processor_webhook_log (processed_at DESC);

COMMENT ON TABLE financial.processor_webhook_log IS
    'Append-only processor webhook audit log for reconciliation (FK-10).';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER trg_payment_intents_updated_at
    BEFORE UPDATE ON financial.payment_intents
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_settlement_instructions_updated_at
    BEFORE UPDATE ON financial.settlement_instructions
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

COMMIT;
