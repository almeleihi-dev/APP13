-- S3.3 Trust Engine — canonical read aliases for application layer
-- Physical storage remains trust.trust_score_events and trust.trust_scores (ADR-003).

CREATE OR REPLACE VIEW trust.trust_events AS
SELECT
    id,
    provider_id,
    event_type,
    source_entity_type,
    source_entity_id,
    contract_id,
    payload,
    score_version,
    idempotency_key,
    occurred_at,
    created_at
FROM trust.trust_score_events;

CREATE OR REPLACE VIEW trust.provider_trust_scores AS
SELECT
    id,
    provider_id,
    score,
    execution_score,
    execution_score_version,
    score_version,
    verification_component,
    execution_component,
    time_component,
    complaints_component,
    evaluation_component,
    dimension_scores,
    contract_count,
    completed_contract_count,
    complaint_upheld_count,
    repeat_customer_rate,
    confidence_band,
    record_state,
    public_summary,
    computed_at,
    created_at,
    updated_at
FROM trust.trust_scores;

COMMENT ON VIEW trust.trust_events IS
    'S3.3 append-only trust lifecycle events (alias of trust.trust_score_events).';

COMMENT ON VIEW trust.provider_trust_scores IS
    'S3.3 provider trust score projection (alias of trust.trust_scores).';

-- Document supported S3.3 lifecycle event types (validation enforced in application layer).
COMMENT ON COLUMN trust.trust_score_events.event_type IS
    'Lifecycle types: contract_completed, milestone_accepted, issue_raised, issue_resolved, customer_evaluation_submitted, escrow_released, escrow_refunded';
