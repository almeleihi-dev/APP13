import type { DbPool } from "../../shared/db/index.js";
import type { ActionService } from "../../action/application/action-service.js";
import { createActionService } from "../../action/application/action-service.js";
import type { TekrrDimension } from "../../action/domain/action.js";
import type { ContractEngineService } from "../../contract/application/contract-engine.service.js";
import { createContractEngineService } from "../../contract/application/contract-engine.service.js";
import type { Contract } from "../../contract/domain/contract.js";
import {
  ContractRepository,
  contractRepository,
} from "../../contract/infrastructure/contract-repository.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { identityRepository } from "../../identity/infrastructure/identity-repository.js";
import type { ContractDraftView } from "../domain/contract-initiation.js";
import type {
  ContractCreationRequest,
  ContractCreationResult,
  DraftValidationResult,
} from "../domain/contract-creation-bridge.js";
import {
  buildCommercialTermsFromRequest,
  buildContractCreationResult,
  DEFAULT_BRIDGE_TEKRR_PROFILE,
  mapDraftToCreationRequest,
  resolveEngineActionCode,
  validateDraftForCreation as validateDraftProjection,
} from "../domain/contract-creation-bridge.js";
import { createContractInitiationModule } from "./contract-initiation-service.js";

export interface CreateContractFromDraftInput {
  draft: ContractDraftView;
  customerId: string;
  customerUserId: string;
  providerId: string;
  idempotencyKey?: string;
  tekrrProfile?: Record<TekrrDimension, Record<string, unknown>>;
}

export type CreateContractFromDraftOutcome =
  | { ok: true; result: ContractCreationResult }
  | { ok: false; validation: DraftValidationResult };

export interface ContractCreationBridgeServiceDependencies {
  db: DbPool;
  actions: ActionService;
  contracts: ContractEngineService;
  contractRepository: ContractRepository;
  identityRepo: IdentityRepository;
}

export class ContractCreationBridgeService {
  constructor(private readonly deps: ContractCreationBridgeServiceDependencies) {}

  validateDraftForCreation(
    draft: ContractDraftView,
    context: { customerId: string; providerId: string }
  ): DraftValidationResult {
    return validateDraftProjection(draft, context);
  }

  buildContractCreationResult(
    contract: Contract,
    created: boolean
  ): ContractCreationResult {
    return buildContractCreationResult({
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: contract.status,
      providerId: contract.providerId ?? "",
      customerId: contract.customerId ?? "",
      actionId: contract.actionId,
      createdAt: contract.createdAt,
      created,
    });
  }

  mapDraftToCreationRequest(
    draft: ContractDraftView,
    context: { customerId: string; providerId: string }
  ): ContractCreationRequest {
    return mapDraftToCreationRequest(draft, context);
  }

  async createContractFromDraft(
    input: CreateContractFromDraftInput
  ): Promise<CreateContractFromDraftOutcome> {
    const validation = await this.validateDraftForCreationAsync(input.draft, {
      customerId: input.customerId,
      providerId: input.providerId,
    });
    if (!validation.valid || !validation.request) {
      return { ok: false, validation };
    }

    const engineActionCode = resolveEngineActionCode(validation.request.actionCode);
    if (!engineActionCode) {
      return {
        ok: false,
        validation: {
          valid: false,
          errors: ["action does not exist"],
          request: null,
        },
      };
    }

    const action = await this.deps.actions.createAction(input.customerUserId, {
      action_type_code: engineActionCode,
      title: validation.request.title,
      description: validation.request.description,
    });

    await this.deps.actions.assignProvider(
      action.id,
      input.customerUserId,
      input.providerId
    );

    const tekrrProfile = input.tekrrProfile ?? DEFAULT_BRIDGE_TEKRR_PROFILE;
    for (const [dimension, data] of Object.entries(tekrrProfile)) {
      await this.deps.actions.updateTekrrDimension(
        action.id,
        input.customerUserId,
        dimension as TekrrDimension,
        data
      );
    }

    const generated = await this.deps.contracts.generateContract(
      action.id,
      input.customerUserId,
      input.idempotencyKey
    );

    const contract = await this.deps.contractRepository.updateCommercialTerms(
      this.deps.db.pool,
      generated.contract.id,
      buildCommercialTermsFromRequest(validation.request, input.draft.draftId)
    );

    return {
      ok: true,
      result: this.buildContractCreationResult(contract, generated.created),
    };
  }

  private async validateDraftForCreationAsync(
    draft: ContractDraftView,
    context: { customerId: string; providerId: string }
  ): Promise<DraftValidationResult> {
    const validation = this.validateDraftForCreation(draft, context);
    if (!validation.valid) return validation;

    const provider = await this.deps.identityRepo.findProviderById(
      this.deps.db.pool,
      context.providerId
    );
    if (!provider) {
      return {
        valid: false,
        errors: ["provider does not exist"],
        request: null,
      };
    }

    return validation;
  }
}

export function createContractCreationBridgeService(
  deps: ContractCreationBridgeServiceDependencies
): ContractCreationBridgeService {
  return new ContractCreationBridgeService(deps);
}

export function createContractsExperienceModule(db: DbPool) {
  const experience = createContractInitiationModule(db);
  const contractBridge = createContractCreationBridgeService({
    db,
    actions: createActionService(db, identityRepository),
    contracts: createContractEngineService(db, identityRepository),
    contractRepository,
    identityRepo: identityRepository,
  });

  return {
    ...experience,
    contractBridge,
  };
}

export type ContractsExperienceModule = ReturnType<typeof createContractsExperienceModule>;
