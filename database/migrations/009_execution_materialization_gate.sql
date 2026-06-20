-- APP13 PostgreSQL Schema v1.1
-- Migration 009: Allow execution entity INSERTs during activation materialization
-- Aligns enforce_execution_entity_gate with is_contract_milestone_materialization_allowed

BEGIN;

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

COMMIT;
