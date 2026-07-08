-- APP13 PostgreSQL Schema — Financial Kernel
-- Migration 013: escrow status history, disbursement guard, escrow/ledger indexes
-- Target: PostgreSQL 16+

BEGIN;

-- ---------------------------------------------------------------------------
-- Escrow status history (Law 24)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.escrow_status_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id           UUID NOT NULL,
    from_status         financial.escrow_status,
    to_status           financial.escrow_status NOT NULL,
    actor_user_id       UUID,
    reason              TEXT,
    journal_id          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_escrow_status_history_escrow
        FOREIGN KEY (escrow_id) REFERENCES financial.escrow_agreements (id) ON DELETE RESTRICT,
    CONSTRAINT fk_escrow_status_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL,
    CONSTRAINT fk_escrow_status_history_journal
        FOREIGN KEY (journal_id) REFERENCES financial.journals (id) ON DELETE SET NULL
);

CREATE INDEX idx_escrow_status_history_escrow_created
    ON financial.escrow_status_history (escrow_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- EI-1: disbursement journals forbidden while escrow is frozen
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION financial.enforce_no_disbursement_while_frozen()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_status financial.escrow_status;
BEGIN
    IF NEW.escrow_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.journal_type IN (
        'escrow_release'::financial.journal_type,
        'escrow_refund'::financial.journal_type,
        'escrow_partial_refund'::financial.journal_type,
        'payout_settlement'::financial.journal_type,
        'platform_fee'::financial.journal_type
    ) THEN
        SELECT ea.status INTO v_status
        FROM financial.escrow_agreements ea
        WHERE ea.id = NEW.escrow_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'escrow % not found for journal', NEW.escrow_id;
        END IF;

        IF v_status = 'frozen'::financial.escrow_status THEN
            RAISE EXCEPTION
                'disbursement journal type % forbidden while escrow % is frozen (EI-1)',
                NEW.journal_type, NEW.escrow_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_journals_no_disbursement_while_frozen
    BEFORE INSERT OR UPDATE OF journal_type, escrow_id ON financial.journals
    FOR EACH ROW EXECUTE FUNCTION financial.enforce_no_disbursement_while_frozen();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_accounts_type_owner
    ON financial.accounts (account_type, owner_entity_id);

CREATE INDEX idx_escrow_agreements_status
    ON financial.escrow_agreements (status);

CREATE INDEX idx_escrow_agreements_frozen_by_issue
    ON financial.escrow_agreements (frozen_by_issue_id)
    WHERE frozen_by_issue_id IS NOT NULL;

CREATE INDEX idx_journals_escrow_id ON financial.journals (escrow_id)
    WHERE escrow_id IS NOT NULL;

CREATE INDEX idx_journals_contract_id ON financial.journals (contract_id)
    WHERE contract_id IS NOT NULL;

CREATE INDEX idx_journals_posted_at ON financial.journals (posted_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

CREATE TRIGGER trg_escrow_agreements_updated_at
    BEFORE UPDATE ON financial.escrow_agreements
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

COMMIT;
