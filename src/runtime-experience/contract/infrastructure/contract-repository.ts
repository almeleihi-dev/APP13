import type { ContractSummaryModel } from "../domain/contract-summary.js";
import { buildDefaultContractSummary } from "../domain/contract-summary.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";

export class ContractRepository {
  private readonly summaries = new Map<string, ContractSummaryModel>();
  private readonly handoffs = new Map<string, NeedRequestDraft>();

  getOrCreate(userId: string): ContractSummaryModel {
    const existing = this.summaries.get(userId);
    if (existing) return { ...existing };
    const summary = buildDefaultContractSummary(`contract-${userId.slice(-6)}`);
    this.summaries.set(userId, summary);
    return { ...summary };
  }

  save(userId: string, summary: ContractSummaryModel): ContractSummaryModel {
    const copy = { ...summary };
    this.summaries.set(userId, copy);
    return { ...copy };
  }

  applyHandoffs(userId: string, needHandoff?: NeedRequestDraft, actionContract?: Partial<ContractSummaryModel>): ContractSummaryModel {
    if (needHandoff) this.handoffs.set(userId, { ...needHandoff });
    const draft = needHandoff ?? this.handoffs.get(userId);
    const base = this.getOrCreate(userId);
    const summary: ContractSummaryModel = {
      ...base,
      actionTitle: draft?.actionSummary ?? actionContract?.actionTitle ?? base.actionTitle,
      location: draft?.location ?? actionContract?.location ?? base.location,
      estimatedCostSar: draft?.estimatedCost ?? actionContract?.estimatedCostSar ?? base.estimatedCostSar,
      estimatedMinutes: actionContract?.estimatedMinutes ?? base.estimatedMinutes,
      review: {
        ...base.review,
        actionSummary: draft?.actionSummary ?? base.review.actionSummary,
        requestDetails: draft?.notes ? `${base.review.requestDetails} ${draft.notes}`.trim() : base.review.requestDetails,
      },
      timeline: {
        ...base.timeline,
        startTime: draft?.schedule ?? base.timeline.startTime,
      },
      cost: {
        ...base.cost,
        estimatedCostSar: draft?.estimatedCost ?? base.cost.estimatedCostSar,
      },
      ...actionContract,
    };
    return this.save(userId, summary);
  }

  setStatus(userId: string, status: ContractSummaryModel["status"]): ContractSummaryModel {
    const summary = this.getOrCreate(userId);
    summary.status = status;
    return this.save(userId, summary);
  }

  setUserConfirmed(userId: string, confirmed: boolean): ContractSummaryModel {
    const summary = this.getOrCreate(userId);
    summary.userConfirmed = confirmed;
    if (confirmed) summary.status = "confirmed";
    return this.save(userId, summary);
  }

  advanceToReviewing(userId: string): ContractSummaryModel {
    const summary = this.getOrCreate(userId);
    if (summary.status === "draft") summary.status = "reviewing";
    return this.save(userId, summary);
  }

  activateContract(userId: string): ContractSummaryModel {
    const summary = this.getOrCreate(userId);
    summary.status = "active";
    return this.save(userId, summary);
  }
}

export function createContractRepository(): ContractRepository {
  return new ContractRepository();
}

let singleton: ContractRepository | undefined;

export function contractRepository(): ContractRepository {
  if (!singleton) singleton = createContractRepository();
  return singleton;
}
