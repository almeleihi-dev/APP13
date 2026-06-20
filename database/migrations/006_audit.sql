-- APP13 PostgreSQL Schema v1.1
-- Migration 006: Audit tables enforcement (Law 24, ADR-003)
-- Target: PostgreSQL 16+

BEGIN;

-- ---------------------------------------------------------------------------
-- Append-only enforcement (ADR-003, Law 24)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION platform.deny_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'mutations forbidden on append-only table %.%. Use correction workflow.',
        TG_TABLE_SCHEMA, TG_TABLE_NAME;
END;
$$;

-- Trust events: append-only (ADR-003)
CREATE TRIGGER trg_trust_score_events_deny_update
    BEFORE UPDATE ON trust.trust_score_events
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_trust_score_events_deny_delete
    BEFORE DELETE ON trust.trust_score_events
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

-- Trust snapshots: append-only (Law 24, FR-20)
CREATE TRIGGER trg_trust_score_snapshots_deny_update
    BEFORE UPDATE ON trust.trust_score_snapshots
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_trust_score_snapshots_deny_delete
    BEFORE DELETE ON trust.trust_score_snapshots
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

-- Trust corrections: append-only
CREATE TRIGGER trg_trust_score_event_corrections_deny_update
    BEFORE UPDATE ON trust.trust_score_event_corrections
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_trust_score_event_corrections_deny_delete
    BEFORE DELETE ON trust.trust_score_event_corrections
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

-- Status history tables: append-only (Law 24)
CREATE TRIGGER trg_action_status_history_deny_update
    BEFORE UPDATE ON action.action_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_action_status_history_deny_delete
    BEFORE DELETE ON action.action_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_contract_status_history_deny_update
    BEFORE UPDATE ON contract.contract_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_contract_status_history_deny_delete
    BEFORE DELETE ON contract.contract_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_milestone_status_history_deny_update
    BEFORE UPDATE ON execution.milestone_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_milestone_status_history_deny_delete
    BEFORE DELETE ON execution.milestone_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_issue_status_history_deny_update
    BEFORE UPDATE ON complaint.issue_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_issue_status_history_deny_delete
    BEFORE DELETE ON complaint.issue_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_case_status_history_deny_update
    BEFORE UPDATE ON complaint.case_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_case_status_history_deny_delete
    BEFORE DELETE ON complaint.case_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_complaint_status_history_deny_update
    BEFORE UPDATE ON complaint.complaint_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_complaint_status_history_deny_delete
    BEFORE DELETE ON complaint.complaint_status_history
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

-- Audit events: append-only (Law 24)
CREATE TRIGGER trg_audit_events_deny_update
    BEFORE UPDATE ON platform.audit_events
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

CREATE TRIGGER trg_audit_events_deny_delete
    BEFORE DELETE ON platform.audit_events
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

-- ---------------------------------------------------------------------------
-- ADR-003: trust_scores projection — score columns writable only via recompute
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trust.enforce_trust_score_projection_writes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF current_setting('app13.trust_recompute', true) = 'on' THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.record_state = 'uninitialized'
           AND NEW.score = 0
           AND NEW.execution_score = 0
           AND NEW.verification_component = 0
           AND NEW.execution_component = 0
           AND NEW.time_component = 0
           AND NEW.complaints_component = 0
           AND NEW.evaluation_component = 0 THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION
            'trust_scores INSERT allowed only for uninitialized zero bootstrap or with app13.trust_recompute=on (ADR-003)';
    END IF;

    IF NEW.score IS DISTINCT FROM OLD.score
       OR NEW.execution_score IS DISTINCT FROM OLD.execution_score
       OR NEW.execution_score_version IS DISTINCT FROM OLD.execution_score_version
       OR NEW.score_version IS DISTINCT FROM OLD.score_version
       OR NEW.execution_score IS DISTINCT FROM OLD.execution_score
       OR NEW.verification_component IS DISTINCT FROM OLD.verification_component
       OR NEW.execution_component IS DISTINCT FROM OLD.execution_component
       OR NEW.time_component IS DISTINCT FROM OLD.time_component
       OR NEW.complaints_component IS DISTINCT FROM OLD.complaints_component
       OR NEW.evaluation_component IS DISTINCT FROM OLD.evaluation_component
       OR NEW.dimension_scores IS DISTINCT FROM OLD.dimension_scores
       OR NEW.confidence_band IS DISTINCT FROM OLD.confidence_band
       OR NEW.record_state IS DISTINCT FROM OLD.record_state
       OR NEW.public_summary IS DISTINCT FROM OLD.public_summary
       OR NEW.contract_count IS DISTINCT FROM OLD.contract_count
       OR NEW.completed_contract_count IS DISTINCT FROM OLD.completed_contract_count
       OR NEW.complaint_upheld_count IS DISTINCT FROM OLD.complaint_upheld_count
       OR NEW.repeat_customer_rate IS DISTINCT FROM OLD.repeat_customer_rate
       OR NEW.computed_at IS DISTINCT FROM OLD.computed_at THEN
        RAISE EXCEPTION 'trust_scores projection columns may only be updated by Trust Engine recompute (set app13.trust_recompute=on)';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_trust_scores_projection_guard
    BEFORE INSERT OR UPDATE ON trust.trust_scores
    FOR EACH ROW EXECUTE FUNCTION trust.enforce_trust_score_projection_writes();

-- ---------------------------------------------------------------------------
-- Audit helper functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION platform.record_audit_event(
    p_actor_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_engine TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO platform.audit_events (
        actor_user_id, action, entity_type, entity_id, engine, metadata, ip_address
    ) VALUES (
        p_actor_user_id, p_action, p_entity_type, p_entity_id, p_engine, p_metadata, p_ip_address
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION platform.record_status_transition(
    p_schema TEXT,
    p_table TEXT,
    p_entity_id UUID,
    p_from_status TEXT,
    p_to_status TEXT,
    p_actor_user_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_id UUID;
    v_sql TEXT;
BEGIN
    v_sql := format(
        'INSERT INTO %I.%I (id, %I, from_status, to_status, actor_user_id, reason, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())
         RETURNING id',
        p_schema,
        p_table,
        CASE p_table
            WHEN 'action_status_history' THEN 'action_id'
            WHEN 'contract_status_history' THEN 'contract_id'
            WHEN 'milestone_status_history' THEN 'milestone_id'
            WHEN 'issue_status_history' THEN 'issue_id'
            WHEN 'case_status_history' THEN 'case_id'
            WHEN 'complaint_status_history' THEN 'complaint_id'
            ELSE 'entity_id'
        END
    );

    EXECUTE v_sql INTO v_id USING p_entity_id, p_from_status, p_to_status, p_actor_user_id, p_reason;

    RETURN v_id;
END;
$$;

COMMENT ON FUNCTION platform.record_audit_event IS
    'Append cross-engine audit event (Law 24).';

COMMENT ON FUNCTION platform.record_status_transition IS
    'Append lifecycle status history row for state machine entities.';

COMMENT ON FUNCTION trust.enforce_trust_score_projection_writes IS
    'ADR-003: Trust projection columns writable only when app13.trust_recompute=on; INSERT limited to uninitialized zero bootstrap.';

-- ---------------------------------------------------------------------------
-- Domain outbox: allow UPDATE of published_at only
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION platform.enforce_domain_outbox_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.event_type IS DISTINCT FROM OLD.event_type
       OR NEW.payload IS DISTINCT FROM OLD.payload
       OR NEW.engine_source IS DISTINCT FROM OLD.engine_source
       OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'domain_outbox rows are immutable except published_at';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_domain_outbox_immutable_payload
    BEFORE UPDATE ON platform.domain_outbox
    FOR EACH ROW EXECUTE FUNCTION platform.enforce_domain_outbox_update();

CREATE TRIGGER trg_domain_outbox_deny_delete
    BEFORE DELETE ON platform.domain_outbox
    FOR EACH ROW EXECUTE FUNCTION platform.deny_mutation();

COMMIT;
