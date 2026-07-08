-- APP13 PostgreSQL Schema — Financial Kernel
-- Migration 012: journals, ledger_entries, append-only + balanced journal triggers
-- Target: PostgreSQL 16+

BEGIN;

-- ---------------------------------------------------------------------------
-- Journals (atomic double-entry transactions)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.journals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_type        financial.journal_type NOT NULL,
    idempotency_key     TEXT NOT NULL,
    escrow_id           UUID,
    contract_id         UUID,
    actor_user_id       UUID,
    engine_source       TEXT NOT NULL DEFAULT 'financial',
    description         TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}',
    posted_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_journals_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT ck_journals_engine_source CHECK (engine_source = 'financial'),
    CONSTRAINT fk_journals_escrow
        FOREIGN KEY (escrow_id) REFERENCES financial.escrow_agreements (id) ON DELETE RESTRICT,
    CONSTRAINT fk_journals_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_journals_actor
        FOREIGN KEY (actor_user_id) REFERENCES identity.users (id) ON DELETE SET NULL
);

COMMENT ON TABLE financial.journals IS
    'Balanced journal header; idempotency_key enforces FK-4 replay safety.';

-- ---------------------------------------------------------------------------
-- Ledger entries (append-only source of truth)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.ledger_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id          UUID NOT NULL,
    account_id          UUID NOT NULL,
    direction           financial.ledger_direction NOT NULL,
    amount_minor        BIGINT NOT NULL,
    currency_code       CHAR(3) NOT NULL,
    entry_type          financial.ledger_entry_type NOT NULL,
    sequence_no         INT NOT NULL,
    metadata            JSONB NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT ck_ledger_entries_amount_minor CHECK (amount_minor > 0),
    CONSTRAINT ck_ledger_entries_currency_code CHECK (char_length(currency_code) = 3),
    CONSTRAINT uq_ledger_entries_journal_sequence UNIQUE (journal_id, sequence_no),
    CONSTRAINT fk_ledger_entries_journal
        FOREIGN KEY (journal_id) REFERENCES financial.journals (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ledger_entries_account
        FOREIGN KEY (account_id) REFERENCES financial.accounts (id) ON DELETE RESTRICT
);

COMMENT ON TABLE financial.ledger_entries IS
    'Append-only ledger lines; balances computed via SUM at query time (FK-2).';

CREATE INDEX idx_ledger_entries_journal_id ON financial.ledger_entries (journal_id);
CREATE INDEX idx_ledger_entries_account_id ON financial.ledger_entries (account_id);

-- ---------------------------------------------------------------------------
-- Append-only protection (Law 24 / FK-1)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION financial.reject_ledger_entry_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'financial.ledger_entries are append-only; % is forbidden', TG_OP;
END;
$$;

CREATE TRIGGER trg_ledger_entries_no_update
    BEFORE UPDATE ON financial.ledger_entries
    FOR EACH ROW EXECUTE FUNCTION financial.reject_ledger_entry_mutation();

CREATE TRIGGER trg_ledger_entries_no_delete
    BEFORE DELETE ON financial.ledger_entries
    FOR EACH ROW EXECUTE FUNCTION financial.reject_ledger_entry_mutation();

-- ---------------------------------------------------------------------------
-- Journal must balance: SUM(debits) = SUM(credits) per currency (FK-3)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION financial.enforce_journal_balanced_on_commit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_journal_id UUID;
    v_row RECORD;
BEGIN
    v_journal_id := COALESCE(NEW.journal_id, OLD.journal_id);

    FOR v_row IN
        SELECT
            le.currency_code,
            SUM(
                CASE
                    WHEN le.direction = 'debit'::financial.ledger_direction
                        THEN le.amount_minor
                    ELSE -le.amount_minor
                END
            ) AS net_minor
        FROM financial.ledger_entries le
        WHERE le.journal_id = v_journal_id
        GROUP BY le.currency_code
    LOOP
        IF v_row.net_minor <> 0 THEN
            RAISE EXCEPTION
                'journal % is not balanced for currency % (net=% minor units)',
                v_journal_id, v_row.currency_code, v_row.net_minor;
        END IF;
    END LOOP;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_journal_balanced_on_commit
    AFTER INSERT OR UPDATE OR DELETE ON financial.ledger_entries
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION financial.enforce_journal_balanced_on_commit();

-- ---------------------------------------------------------------------------
-- Currency consistency: one currency per journal; entry currency matches account
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION financial.enforce_ledger_currency_consistency()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_journal_id UUID;
    v_currency_count INT;
    v_mismatch_count INT;
BEGIN
    v_journal_id := COALESCE(NEW.journal_id, OLD.journal_id);

    SELECT COUNT(DISTINCT le.currency_code) INTO v_currency_count
    FROM financial.ledger_entries le
    WHERE le.journal_id = v_journal_id;

    IF v_currency_count > 1 THEN
        RAISE EXCEPTION
            'journal % contains ledger entries with multiple currencies',
            v_journal_id;
    END IF;

    SELECT COUNT(*) INTO v_mismatch_count
    FROM financial.ledger_entries le
    JOIN financial.accounts a ON a.id = le.account_id
    WHERE le.journal_id = v_journal_id
      AND le.currency_code <> a.currency_code;

    IF v_mismatch_count > 0 THEN
        RAISE EXCEPTION
            'journal % has ledger entry currency mismatch with account currency',
            v_journal_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_ledger_currency_consistency
    AFTER INSERT OR UPDATE OR DELETE ON financial.ledger_entries
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION financial.enforce_ledger_currency_consistency();

COMMIT;
