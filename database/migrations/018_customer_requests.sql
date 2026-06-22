-- S7 Customer Request Experience — persisted customer request drafts

CREATE SCHEMA IF NOT EXISTS experience;

CREATE TABLE IF NOT EXISTS experience.customer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_user_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    request_text TEXT NOT NULL,
    budget_minor INTEGER,
    preferred_days INTEGER,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_customer_requests_user
        FOREIGN KEY (customer_user_id) REFERENCES identity.users (id),
    CONSTRAINT fk_customer_requests_customer
        FOREIGN KEY (customer_id) REFERENCES identity.customers (id),
    CONSTRAINT chk_customer_requests_status
        CHECK (status IN ('open', 'matched', 'closed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_customer_requests_customer_user
    ON experience.customer_requests (customer_user_id, created_at DESC);

COMMENT ON TABLE experience.customer_requests IS
    'S7 customer request drafts for deterministic matching and provider discovery.';
