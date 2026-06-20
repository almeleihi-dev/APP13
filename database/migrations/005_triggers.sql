-- APP13 PostgreSQL Schema v1
-- Migration 005: Triggers and integrity functions
-- Target: PostgreSQL 16+
-- CK-2, CK-10, CK-11, CK-13; Law 11, Law 13

BEGIN;

-- ---------------------------------------------------------------------------
-- Shared: updated_at maintenance
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION platform.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON identity.users
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON identity.companies
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON identity.customers
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_providers_updated_at
    BEFORE UPDATE ON identity.providers
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_verifications_updated_at
    BEFORE UPDATE ON identity.verifications
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_credentials_updated_at
    BEFORE UPDATE ON identity.credentials
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_actions_updated_at
    BEFORE UPDATE ON action.actions
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_contracts_updated_at
    BEFORE UPDATE ON contract.contracts
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_contract_parties_updated_at
    BEFORE UPDATE ON contract.contract_parties
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_milestones_updated_at
    BEFORE UPDATE ON execution.milestones
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_evidence_updated_at
    BEFORE UPDATE ON execution.evidence
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_attestations_updated_at
    BEFORE UPDATE ON execution.attestations
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_customer_evaluations_updated_at
    BEFORE UPDATE ON execution.customer_evaluations
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_cases_updated_at
    BEFORE UPDATE ON complaint.cases
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_issues_updated_at
    BEFORE UPDATE ON complaint.issues
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_complaints_updated_at
    BEFORE UPDATE ON complaint.complaints
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_mediation_records_updated_at
    BEFORE UPDATE ON complaint.mediation_records
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

CREATE TRIGGER trg_trust_scores_updated_at
    BEFORE UPDATE ON trust.trust_scores
    FOR EACH ROW EXECUTE FUNCTION platform.set_updated_at();

-- ---------------------------------------------------------------------------
-- CK-2: evidence.contract_id must match milestone.contract_id (Law 11)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION execution.enforce_evidence_contract_milestone_match()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_milestone_contract_id UUID;
BEGIN
    SELECT contract_id INTO v_milestone_contract_id
    FROM execution.milestones
    WHERE id = NEW.milestone_id;

    IF v_milestone_contract_id IS NULL THEN
        RAISE EXCEPTION 'milestone % not found for evidence', NEW.milestone_id;
    END IF;

    IF NEW.contract_id IS DISTINCT FROM v_milestone_contract_id THEN
        RAISE EXCEPTION 'evidence.contract_id (%) must match milestone.contract_id (%)',
            NEW.contract_id, v_milestone_contract_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evidence_contract_milestone_match
    BEFORE INSERT OR UPDATE OF contract_id, milestone_id ON execution.evidence
    FOR EACH ROW EXECUTE FUNCTION execution.enforce_evidence_contract_milestone_match();

-- ---------------------------------------------------------------------------
-- CK-10: attestation_evidence contract consistency (Law 13)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION execution.enforce_attestation_evidence_contract_match()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_attestation_contract_id UUID;
    v_evidence_contract_id UUID;
BEGIN
    SELECT contract_id INTO v_attestation_contract_id
    FROM execution.attestations
    WHERE id = NEW.attestation_id;

    SELECT contract_id INTO v_evidence_contract_id
    FROM execution.evidence
    WHERE id = NEW.evidence_id;

    IF v_attestation_contract_id IS NULL OR v_evidence_contract_id IS NULL THEN
        RAISE EXCEPTION 'attestation or evidence not found for attestation_evidence row';
    END IF;

    IF NEW.contract_id IS DISTINCT FROM v_attestation_contract_id
       OR NEW.contract_id IS DISTINCT FROM v_evidence_contract_id THEN
        RAISE EXCEPTION 'attestation_evidence.contract_id must match attestation and evidence contract_id';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_attestation_evidence_contract_match
    BEFORE INSERT OR UPDATE ON execution.attestation_evidence
    FOR EACH ROW EXECUTE FUNCTION execution.enforce_attestation_evidence_contract_match();

-- ---------------------------------------------------------------------------
-- CK-11: contract party denormalization at activation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION contract.enforce_contract_party_denorm_on_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_action_customer_id UUID;
    v_action_provider_id UUID;
BEGIN
    IF NEW.activated_at IS NOT NULL
       AND (OLD.activated_at IS NULL OR NEW.customer_id IS DISTINCT FROM OLD.customer_id OR NEW.provider_id IS DISTINCT FROM OLD.provider_id) THEN
        SELECT customer_id, provider_id
        INTO v_action_customer_id, v_action_provider_id
        FROM action.actions
        WHERE id = NEW.action_id;

        IF NEW.customer_id IS DISTINCT FROM v_action_customer_id THEN
            RAISE EXCEPTION 'contracts.customer_id must match actions.customer_id at activation';
        END IF;

        IF NEW.provider_id IS DISTINCT FROM v_action_provider_id THEN
            RAISE EXCEPTION 'contracts.provider_id must match actions.provider_id at activation';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_contract_party_denorm
    BEFORE INSERT OR UPDATE OF activated_at, customer_id, provider_id, action_id ON contract.contracts
    FOR EACH ROW EXECUTE FUNCTION contract.enforce_contract_party_denorm_on_activation();

-- ---------------------------------------------------------------------------
-- Junction parent_status sync for EL-6 partial uniques
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complaint.sync_complaint_dimension_parent_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE complaint.complaint_dimensions
    SET parent_status = NEW.status::text
    WHERE complaint_id = NEW.id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_complaints_sync_dimension_status
    AFTER INSERT OR UPDATE OF status ON complaint.complaints
    FOR EACH ROW EXECUTE FUNCTION complaint.sync_complaint_dimension_parent_status();

CREATE OR REPLACE FUNCTION complaint.sync_issue_dimension_parent_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE complaint.issue_dimensions
    SET parent_status = NEW.status::text
    WHERE issue_id = NEW.id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_issues_sync_dimension_status
    AFTER INSERT OR UPDATE OF status ON complaint.issues
    FOR EACH ROW EXECUTE FUNCTION complaint.sync_issue_dimension_parent_status();

CREATE OR REPLACE FUNCTION complaint.sync_case_dimension_parent_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE complaint.case_dimensions
    SET parent_status = NEW.status::text
    WHERE case_id = NEW.id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cases_sync_dimension_status
    AFTER INSERT OR UPDATE OF status ON complaint.cases
    FOR EACH ROW EXECUTE FUNCTION complaint.sync_case_dimension_parent_status();

-- Set parent_status on dimension insert from parent row
CREATE OR REPLACE FUNCTION complaint.set_complaint_dimension_parent_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT status::text INTO NEW.parent_status
    FROM complaint.complaints
    WHERE id = NEW.complaint_id;

    IF NEW.parent_status IS NULL THEN
        RAISE EXCEPTION 'complaint % not found for complaint_dimensions', NEW.complaint_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_complaint_dimensions_set_parent_status
    BEFORE INSERT ON complaint.complaint_dimensions
    FOR EACH ROW EXECUTE FUNCTION complaint.set_complaint_dimension_parent_status();

CREATE OR REPLACE FUNCTION complaint.set_issue_dimension_parent_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT status::text INTO NEW.parent_status
    FROM complaint.issues
    WHERE id = NEW.issue_id;

    IF NEW.parent_status IS NULL THEN
        RAISE EXCEPTION 'issue % not found for issue_dimensions', NEW.issue_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_issue_dimensions_set_parent_status
    BEFORE INSERT ON complaint.issue_dimensions
    FOR EACH ROW EXECUTE FUNCTION complaint.set_issue_dimension_parent_status();

CREATE OR REPLACE FUNCTION complaint.set_case_dimension_parent_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT status::text INTO NEW.parent_status
    FROM complaint.cases
    WHERE id = NEW.case_id;

    IF NEW.parent_status IS NULL THEN
        RAISE EXCEPTION 'case % not found for case_dimensions', NEW.case_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_case_dimensions_set_parent_status
    BEFORE INSERT ON complaint.case_dimensions
    FOR EACH ROW EXECUTE FUNCTION complaint.set_case_dimension_parent_status();

-- ---------------------------------------------------------------------------
-- CK-3: attestation requires evidence when rating is not PEN (Law 13)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION execution.enforce_attestation_evidence_on_commit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rating execution.fulfillment_rating;
    v_evidence_count INT;
BEGIN
    SELECT fulfillment_rating INTO v_rating
    FROM execution.attestations
    WHERE id = COALESCE(NEW.attestation_id, OLD.attestation_id);

    IF v_rating IS NOT NULL AND v_rating <> 'PEN' THEN
        SELECT count(*) INTO v_evidence_count
        FROM execution.attestation_evidence
        WHERE attestation_id = COALESCE(NEW.attestation_id, OLD.attestation_id);

        IF v_evidence_count < 1 THEN
            RAISE EXCEPTION 'attestation % requires at least one evidence row when rating is not PEN', COALESCE(NEW.attestation_id, OLD.attestation_id);
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_attestation_evidence_required
    AFTER INSERT OR UPDATE OR DELETE ON execution.attestation_evidence
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION execution.enforce_attestation_evidence_on_commit();

-- ---------------------------------------------------------------------------
-- CK-13: issue requires dimension or milestone scope (Invariant I-1)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION complaint.enforce_issue_scope_on_commit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_issue_id UUID;
    v_dimension_count INT;
    v_milestone_count INT;
BEGIN
    v_issue_id := COALESCE(NEW.issue_id, OLD.issue_id);

    SELECT count(*) INTO v_dimension_count
    FROM complaint.issue_dimensions WHERE issue_id = v_issue_id;

    SELECT count(*) INTO v_milestone_count
    FROM complaint.issue_milestones WHERE issue_id = v_issue_id;

    IF v_dimension_count < 1 AND v_milestone_count < 1 THEN
        RAISE EXCEPTION 'issue % requires at least one issue_dimensions or issue_milestones row', v_issue_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_issue_scope_required
    AFTER INSERT OR UPDATE OR DELETE ON complaint.issue_dimensions
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION complaint.enforce_issue_scope_on_commit();

CREATE CONSTRAINT TRIGGER trg_issue_milestone_scope_required
    AFTER INSERT OR UPDATE OR DELETE ON complaint.issue_milestones
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION complaint.enforce_issue_scope_on_commit();

COMMIT;
