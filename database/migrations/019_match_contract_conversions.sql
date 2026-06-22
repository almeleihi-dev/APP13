-- S8 Match-to-Contract Conversion — contract offers from customer request matches

CREATE TABLE IF NOT EXISTS experience.match_contract_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_request_id UUID NOT NULL,
    customer_user_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    provider_user_id UUID NOT NULL,
    selected_action_id UUID NOT NULL,
    selected_action_code TEXT NOT NULL,
    commercial_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
    draft_preview JSONB,
    status TEXT NOT NULL DEFAULT 'offer_created',
    contract_id UUID,
    idempotency_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_match_contract_offers_request
        FOREIGN KEY (customer_request_id) REFERENCES experience.customer_requests (id),
    CONSTRAINT fk_match_contract_offers_customer_user
        FOREIGN KEY (customer_user_id) REFERENCES identity.users (id),
    CONSTRAINT fk_match_contract_offers_customer
        FOREIGN KEY (customer_id) REFERENCES identity.customers (id),
    CONSTRAINT fk_match_contract_offers_provider
        FOREIGN KEY (provider_id) REFERENCES identity.providers (id),
    CONSTRAINT fk_match_contract_offers_provider_user
        FOREIGN KEY (provider_user_id) REFERENCES identity.users (id),
    CONSTRAINT fk_match_contract_offers_action
        FOREIGN KEY (selected_action_id) REFERENCES action.actions (id),
    CONSTRAINT fk_match_contract_offers_contract
        FOREIGN KEY (contract_id) REFERENCES contract.contracts (id),
    CONSTRAINT uq_match_contract_offers_idempotency
        UNIQUE (idempotency_key),
    CONSTRAINT chk_match_contract_offers_status
        CHECK (status IN (
            'offer_created',
            'draft_previewed',
            'accepted',
            'contract_created',
            'cancelled'
        ))
);

CREATE INDEX IF NOT EXISTS idx_match_contract_offers_request
    ON experience.match_contract_offers (customer_request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_contract_offers_customer_user
    ON experience.match_contract_offers (customer_user_id, created_at DESC);

COMMENT ON TABLE experience.match_contract_offers IS
    'S8 contract offers linking customer requests to provider matches and eventual contracts.';
