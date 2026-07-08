-- APP13 PostgreSQL Schema — Financial Kernel
-- Migration 011: financial schema, enums, accounts, escrow_agreements
-- Target: PostgreSQL 16+
-- Source: docs/architecture/B6-Financial-Kernel.md (FK-2: no balance columns)

BEGIN;

CREATE SCHEMA IF NOT EXISTS financial;

COMMENT ON SCHEMA financial IS 'Financial Engine — ledger-first escrow and payments';

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE financial.account_type AS ENUM (
        'customer_wallet',
        'provider_wallet',
        'escrow_contract',
        'platform_revenue',
        'processor_clearing',
        'refund_payable',
        'suspense'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.owner_entity_type AS ENUM (
        'user', 'contract', 'escrow', 'platform'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.escrow_status AS ENUM (
        'pending_funding',
        'funded',
        'held',
        'in_execution',
        'awaiting_acceptance',
        'released',
        'partially_refunded',
        'refunded',
        'frozen'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.frozen_reason AS ENUM (
        'issue_raised', 'disputed', 'admin_hold'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.journal_type AS ENUM (
        'fund_capture',
        'escrow_hold',
        'escrow_release',
        'platform_fee',
        'escrow_refund',
        'escrow_partial_refund',
        'escrow_chargeback',
        'payout_settlement',
        'freeze_memo'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.ledger_direction AS ENUM ('debit', 'credit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.ledger_entry_type AS ENUM (
        'capture',
        'hold',
        'release',
        'fee',
        'refund',
        'partial_refund',
        'chargeback',
        'payout',
        'memo',
        'adjustment'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.payment_intent_status AS ENUM (
        'requires_payment_method',
        'processing',
        'succeeded',
        'failed',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE financial.settlement_status AS ENUM (
        'pending', 'submitted', 'paid', 'failed'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Chart of accounts (no balance columns — FK-2)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code        TEXT NOT NULL,
    account_type        financial.account_type NOT NULL,
    owner_entity_type   financial.owner_entity_type,
    owner_entity_id     UUID,
    currency_code       CHAR(3) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_accounts_account_code UNIQUE (account_code),
    CONSTRAINT ck_accounts_currency_code CHECK (char_length(currency_code) = 3)
);

COMMENT ON TABLE financial.accounts IS
    'Ledger account nodes; balances derived from ledger_entries only (FK-2).';

-- ---------------------------------------------------------------------------
-- Escrow agreements (lifecycle status — not inferred from ledger alone)
-- ---------------------------------------------------------------------------

CREATE TABLE financial.escrow_agreements (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id             UUID NOT NULL,
    status                  financial.escrow_status NOT NULL DEFAULT 'pending_funding',
    gross_amount_minor      BIGINT NOT NULL,
    platform_fee_minor      BIGINT NOT NULL DEFAULT 0,
    currency_code           CHAR(3) NOT NULL,
    fee_policy_snapshot     JSONB NOT NULL DEFAULT '{}',
    payment_intent_id       UUID,
    frozen_at               TIMESTAMPTZ,
    frozen_reason           financial.frozen_reason,
    frozen_by_issue_id      UUID,
    funded_at               TIMESTAMPTZ,
    released_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_escrow_agreements_contract_id UNIQUE (contract_id),
    CONSTRAINT ck_escrow_gross_amount_minor CHECK (gross_amount_minor >= 0),
    CONSTRAINT ck_escrow_platform_fee_minor CHECK (platform_fee_minor >= 0),
    CONSTRAINT ck_escrow_currency_code CHECK (char_length(currency_code) = 3),
    CONSTRAINT fk_escrow_agreements_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_escrow_agreements_frozen_by_issue
        FOREIGN KEY (frozen_by_issue_id) REFERENCES complaint.issues (id) ON DELETE SET NULL
);

COMMENT ON TABLE financial.escrow_agreements IS
    'Contract-bound escrow lifecycle aggregate; one active escrow per contract.';

COMMIT;
