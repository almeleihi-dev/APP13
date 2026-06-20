-- APP13 PostgreSQL Schema v1.1
-- Migration 007: P0 integrity fixes (PostgreSQL Review v1)
-- Target: PostgreSQL 16+
-- Fixes: P0-D1..D5, P0-C1..C2, P0-CE1..CE2, P0-M1

BEGIN;

-- ---------------------------------------------------------------------------
-- P0-M1: Migration tracking
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS platform.schema_migrations (
    version     TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    description TEXT
);

ALTER TABLE platform.schema_migrations
    ADD COLUMN IF NOT EXISTS description TEXT;

INSERT INTO platform.schema_migrations (version, description)
VALUES
    ('001', 'Initial schema — extensions, schemas, 36 tables'),
    ('002', 'Domain enum types (idempotent CREATE TYPE)'),
    ('003', 'Foreign keys, uniqueness, check constraints'),
    ('004', 'Performance indexes and EL-6 partial uniques'),
    ('005', 'Triggers — updated_at, CK-2/3/10/11/13, junction sync'),
    ('006', 'Audit enforcement — append-only, ADR-003 trust guard'),
    ('007', 'Schema v1.1 — P0 integrity fixes')
ON CONFLICT (version) DO NOTHING;

-- ---------------------------------------------------------------------------
-- P0-CE2: Active contracts require denormalized parties (CK-11 extension)
-- ---------------------------------------------------------------------------

ALTER TABLE contract.contracts
    DROP CONSTRAINT IF EXISTS ck_contracts_active_parties_required;

ALTER TABLE contract.contracts
    ADD CONSTRAINT ck_contracts_active_parties_required
        CHECK (
            status <> 'active'
            OR (customer_id IS NOT NULL AND provider_id IS NOT NULL)
        );

-- ---------------------------------------------------------------------------
-- Shared: contract execution gate (CA-2 / Law 5 / P0-D1 / P0-CE1)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION contract.is_contract_execution_allowed(p_status contract.contract_status)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT p_status IN (
        'active', 'issue_raised', 'disputed', 'resolved',
        'completed', 'closed'
    );
$$;

CREATE OR REPLACE FUNCTION contract.is_contract_milestone_materialization_allowed(
    p_status contract.contract_status
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    IF contract.is_contract_execution_allowed(p_status) THEN
        RETURN TRUE;
    END IF;

    IF p_status = 'accepted'
       AND current_setting('app13.contract_materialization', true) = 'on' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION contract.enforce_milestone_insert_gate()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_status contract.contract_status;
BEGIN
    SELECT status INTO v_status
    FROM contract.contracts
    WHERE id = NEW.contract_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'contract % not found for milestone insert', NEW.contract_id;
    END IF;

    IF NOT contract.is_contract_milestone_materialization_allowed(v_status) THEN
        RAISE EXCEPTION
            'milestones may only be materialized when contract is active or during activation (status=%, set app13.contract_materialization=on when activating)',
            v_status;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_milestones_execution_gate ON execution.milestones;

CREATE TRIGGER trg_milestones_execution_gate
    BEFORE INSERT ON execution.milestones
    FOR EACH ROW EXECUTE FUNCTION contract.enforce_milestone_insert_gate();

CREATE OR REPLACE FUNCTION contract.enforce_execution_entity_gate()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_contract_id UUID;
    v_status contract.contract_status;
BEGIN
    v_contract_id := COALESCE(NEW.contract_id, OLD.contract_id);

    SELECT status INTO v_status
    FROM contract.contracts
    WHERE id = v_contract_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'contract % not found for execution entity write', v_contract_id;
    END IF;

    IF TG_TABLE_NAME = 'attestations'
       AND TG_OP = 'INSERT'
       AND current_setting('app13.complaint_outcome_apply', true) = 'on' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NOT contract.is_contract_milestone_materialization_allowed(v_status) THEN
            RAISE EXCEPTION
                'execution inserts require contract in executable state or activation materialization (current=%)',
                v_status;
        END IF;
    ELSIF NOT contract.is_contract_execution_allowed(v_status) THEN
        RAISE EXCEPTION
            'execution writes require contract in executable state (current=%)',
            v_status;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evidence_execution_gate ON execution.evidence;

CREATE TRIGGER trg_evidence_execution_gate
    BEFORE INSERT OR UPDATE ON execution.evidence
    FOR EACH ROW EXECUTE FUNCTION contract.enforce_execution_entity_gate();

DROP TRIGGER IF EXISTS trg_attestations_execution_gate ON execution.attestations;

CREATE TRIGGER trg_attestations_execution_gate
    BEFORE INSERT OR UPDATE ON execution.attestations
    FOR EACH ROW EXECUTE FUNCTION contract.enforce_execution_entity_gate();

DROP TRIGGER IF EXISTS trg_attestation_evidence_execution_gate ON execution.attestation_evidence;

CREATE TRIGGER trg_attestation_evidence_execution_gate
    BEFORE INSERT OR UPDATE ON execution.attestation_evidence
    FOR EACH ROW EXECUTE FUNCTION contract.enforce_execution_entity_gate();

DROP TRIGGER IF EXISTS trg_attestation_milestones_execution_gate ON execution.attestation_milestones;

CREATE TRIGGER trg_attestation_milestones_execution_gate
    BEFORE INSERT OR UPDATE ON execution.attestation_milestones
    FOR EACH ROW EXECUTE FUNCTION contract.enforce_execution_entity_gate();

-- ---------------------------------------------------------------------------
-- P0-D2 / Law 13: attestation row must have evidence when rating != PEN
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION execution.enforce_attestation_has_evidence_on_commit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_attestation_id UUID;
    v_rating execution.fulfillment_rating;
    v_evidence_count INT;
BEGIN
    v_attestation_id := COALESCE(NEW.id, OLD.id);

    SELECT fulfillment_rating INTO v_rating
    FROM execution.attestations
    WHERE id = v_attestation_id;

    IF v_rating IS NOT NULL AND v_rating <> 'PEN' THEN
        SELECT count(*) INTO v_evidence_count
        FROM execution.attestation_evidence
        WHERE attestation_id = v_attestation_id;

        IF v_evidence_count < 1 THEN
            RAISE EXCEPTION
                'attestation % requires at least one attestation_evidence row when rating is %',
                v_attestation_id, v_rating;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attestation_has_evidence_on_commit ON execution.attestations;

CREATE CONSTRAINT TRIGGER trg_attestation_has_evidence_on_commit
    AFTER INSERT OR UPDATE OF fulfillment_rating ON execution.attestations
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION execution.enforce_attestation_has_evidence_on_commit();

-- ---------------------------------------------------------------------------
-- P0-D3 / CK-13: issue must have dimension or milestone scope at commit
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complaint.enforce_issue_scope_on_issue_commit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_dimension_count INT;
    v_milestone_count INT;
BEGIN
    SELECT count(*) INTO v_dimension_count
    FROM complaint.issue_dimensions
    WHERE issue_id = NEW.id;

    SELECT count(*) INTO v_milestone_count
    FROM complaint.issue_milestones
    WHERE issue_id = NEW.id;

    IF v_dimension_count < 1 AND v_milestone_count < 1 THEN
        RAISE EXCEPTION
            'issue % requires at least one issue_dimensions or issue_milestones row (Invariant I-1)',
            NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_issue_scope_on_issue_commit ON complaint.issues;

CREATE CONSTRAINT TRIGGER trg_issue_scope_on_issue_commit
    AFTER INSERT OR UPDATE ON complaint.issues
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION complaint.enforce_issue_scope_on_issue_commit();

-- ---------------------------------------------------------------------------
-- P0-C1 / CK-7: complaint must have >=1 complaint_dimensions at commit
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complaint.enforce_complaint_dimensions_on_commit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_complaint_id UUID;
    v_dimension_count INT;
BEGIN
    v_complaint_id := COALESCE(NEW.id, NEW.complaint_id, OLD.complaint_id);

    SELECT count(*) INTO v_dimension_count
    FROM complaint.complaint_dimensions
    WHERE complaint_id = v_complaint_id;

    IF v_dimension_count < 1 THEN
        RAISE EXCEPTION
            'complaint % requires at least one complaint_dimensions row (CK-7 / Law 20)',
            v_complaint_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_complaint_dimensions_on_commit ON complaint.complaints;

CREATE CONSTRAINT TRIGGER trg_complaint_dimensions_on_commit
    AFTER INSERT OR UPDATE ON complaint.complaints
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION complaint.enforce_complaint_dimensions_on_commit();

DROP TRIGGER IF EXISTS trg_complaint_dimensions_junction_on_commit ON complaint.complaint_dimensions;

CREATE CONSTRAINT TRIGGER trg_complaint_dimensions_junction_on_commit
    AFTER INSERT OR DELETE ON complaint.complaint_dimensions
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION complaint.enforce_complaint_dimensions_on_commit();

-- ---------------------------------------------------------------------------
-- P0-C2: complaint_dimensions.contract_id must match parent complaint
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complaint.enforce_complaint_dimension_contract_match()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_parent_contract_id UUID;
BEGIN
    SELECT contract_id INTO v_parent_contract_id
    FROM complaint.complaints
    WHERE id = NEW.complaint_id;

    IF v_parent_contract_id IS NULL THEN
        RAISE EXCEPTION 'complaint % not found for complaint_dimensions', NEW.complaint_id;
    END IF;

    IF NEW.contract_id IS DISTINCT FROM v_parent_contract_id THEN
        RAISE EXCEPTION
            'complaint_dimensions.contract_id (%) must match complaints.contract_id (%)',
            NEW.contract_id, v_parent_contract_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_complaint_dimension_contract_match ON complaint.complaint_dimensions;

CREATE TRIGGER trg_complaint_dimension_contract_match
    BEFORE INSERT OR UPDATE OF contract_id, complaint_id ON complaint.complaint_dimensions
    FOR EACH ROW EXECUTE FUNCTION complaint.enforce_complaint_dimension_contract_match();

-- ---------------------------------------------------------------------------
-- P0-D4 / EL-6: advisory lock on active dimension insert
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complaint.lock_complaint_dimension_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_lock_key BIGINT;
    v_parent_status TEXT;
BEGIN
    v_parent_status := NEW.parent_status;

    IF v_parent_status IS NULL THEN
        SELECT status::text INTO v_parent_status
        FROM complaint.complaints
        WHERE id = NEW.complaint_id;
    END IF;

    IF v_parent_status NOT IN ('dismissed', 'closed') THEN
        v_lock_key := hashtextextended(NEW.contract_id::text || ':' || NEW.tekrr_dimension::text, 0);
        PERFORM pg_advisory_xact_lock(v_lock_key);

        IF EXISTS (
            SELECT 1
            FROM complaint.complaint_dimensions cd
            WHERE cd.contract_id = NEW.contract_id
              AND cd.tekrr_dimension = NEW.tekrr_dimension
              AND cd.parent_status NOT IN ('dismissed', 'closed')
              AND cd.id IS DISTINCT FROM NEW.id
        ) THEN
            RAISE EXCEPTION
                'active complaint already exists for contract % dimension % (EL-6)',
                NEW.contract_id, NEW.tekrr_dimension;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_complaint_dimension_el6_lock ON complaint.complaint_dimensions;
DROP TRIGGER IF EXISTS trg_z_complaint_dimension_el6_lock ON complaint.complaint_dimensions;

-- z-prefix ensures this runs after trg_complaint_dimensions_set_parent_status (005)
CREATE TRIGGER trg_z_complaint_dimension_el6_lock
    BEFORE INSERT OR UPDATE OF contract_id, tekrr_dimension, parent_status
    ON complaint.complaint_dimensions
    FOR EACH ROW EXECUTE FUNCTION complaint.lock_complaint_dimension_insert();

-- ---------------------------------------------------------------------------
-- P0-D5 / ADR-003: trust_scores INSERT guard
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
        RAISE EXCEPTION
            'trust_scores projection columns may only be updated by Trust Engine recompute (set app13.trust_recompute=on)';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trust_scores_projection_guard ON trust.trust_scores;

CREATE TRIGGER trg_trust_scores_projection_guard
    BEFORE INSERT OR UPDATE ON trust.trust_scores
    FOR EACH ROW EXECUTE FUNCTION trust.enforce_trust_score_projection_writes();

-- ---------------------------------------------------------------------------
-- Index: support EL-6 lookups under lock (P0-D4)
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_complaint_dimensions_active_lookup
    ON complaint.complaint_dimensions (contract_id, tekrr_dimension, parent_status);

COMMIT;
