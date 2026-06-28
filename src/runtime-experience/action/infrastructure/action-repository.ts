import type { ActionContractSummary, ActionMilestone, WaitingReason } from "../domain/action-state.js";
import type { NeedRequestDraft } from "../../need/domain/need-state.js";

export interface ActionQuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export interface ActionLiveStatus {
  status: "ready" | "active" | "waiting" | "complete";
  label: string;
  updatedAt: string;
}

export interface ActionCustomerSummary {
  name: string;
  location: string;
  rating?: number;
}

export interface ActionExecutionContext {
  contract: ActionContractSummary;
  liveStatus: ActionLiveStatus;
  customer: ActionCustomerSummary;
  milestones: ActionMilestone[];
  completionPercentage: number;
  remainingMinutes: number;
  currentStage: string;
  liveFrameTier: "bronze" | "silver" | "gold" | "platinum";
}

const DEFAULT_QUICK_ACTIONS: ActionQuickAction[] = [
  { id: "contract", label: "Contract", icon: "contract", route: "/action/contract" },
  { id: "progress", label: "Progress", icon: "timeline", route: "/action/progress" },
  { id: "contact", label: "Contact", icon: "chat", route: "/action/active" },
];

export class ActionRepository {
  private readonly contexts = new Map<string, ActionExecutionContext>();
  private readonly handoffs = new Map<string, NeedRequestDraft>();

  applyNeedHandoff(userId: string, handoff?: NeedRequestDraft): ActionExecutionContext {
    if (handoff) {
      this.handoffs.set(userId, { ...handoff });
    }
    const draft = this.handoffs.get(userId);
    const contract: ActionContractSummary = {
      actionSummary: draft?.actionSummary ?? "Certified Electrician — Panel Upgrade",
      customerName: "Customer",
      providerName: "Licensed Professional",
      schedule: draft?.schedule ?? "Mon 10:00",
      location: draft?.location ?? "Riyadh",
      notes: draft?.notes ?? "",
      estimatedCostSar: draft?.estimatedCost ?? 850,
      agreementStatus: "pending",
    };
    const context: ActionExecutionContext = {
      contract,
      liveStatus: { status: "ready", label: "Action Ready", updatedAt: new Date().toISOString() },
      customer: { name: "Customer", location: contract.location, rating: 4.8 },
      milestones: [
        { id: "ms-1", label: "Arrive on site", status: "pending" },
        { id: "ms-2", label: "Assess panel", status: "pending" },
        { id: "ms-3", label: "Complete upgrade", status: "pending" },
        { id: "ms-4", label: "Final inspection", status: "pending" },
      ],
      completionPercentage: 0,
      remainingMinutes: 120,
      currentStage: "Ready to execute",
      liveFrameTier: "gold",
    };
    this.contexts.set(userId, context);
    return context;
  }

  getContext(userId: string): ActionExecutionContext {
    return this.contexts.get(userId) ?? this.applyNeedHandoff(userId);
  }

  getQuickActions(): ActionQuickAction[] {
    return [...DEFAULT_QUICK_ACTIONS];
  }

  activateContract(userId: string): ActionExecutionContext {
    const context = this.getContext(userId);
    context.contract.agreementStatus = "active";
    context.liveStatus = { status: "active", label: "Contract active", updatedAt: new Date().toISOString() };
    this.contexts.set(userId, context);
    return context;
  }

  startExecution(userId: string): ActionExecutionContext {
    const context = this.getContext(userId);
    context.liveStatus = { status: "active", label: "In progress", updatedAt: new Date().toISOString() };
    context.currentStage = "On site — assess panel";
    context.milestones[0]!.status = "complete";
    context.milestones[1]!.status = "active";
    context.completionPercentage = 25;
    context.remainingMinutes = 90;
    this.contexts.set(userId, context);
    return context;
  }

  advanceProgress(userId: string, milestoneId?: string): ActionExecutionContext {
    const context = this.getContext(userId);
    const activeIndex = context.milestones.findIndex((m) => m.id === milestoneId || m.status === "active");
    if (activeIndex >= 0) {
      context.milestones[activeIndex]!.status = "complete";
      const next = context.milestones[activeIndex + 1];
      if (next) next.status = "active";
    }
    const completed = context.milestones.filter((m) => m.status === "complete").length;
    context.completionPercentage = Math.round((completed / context.milestones.length) * 100);
    context.remainingMinutes = Math.max(0, context.remainingMinutes - 20);
    context.currentStage = context.milestones.find((m) => m.status === "active")?.label ?? "Completing";
    this.contexts.set(userId, context);
    return context;
  }

  completeAction(userId: string): ActionExecutionContext {
    const context = this.getContext(userId);
    context.milestones = context.milestones.map((m) => ({ ...m, status: "complete" as const }));
    context.completionPercentage = 100;
    context.remainingMinutes = 0;
    context.currentStage = "Action complete";
    context.liveStatus = { status: "complete", label: "Completed", updatedAt: new Date().toISOString() };
    context.contract.agreementStatus = "complete";
    this.contexts.set(userId, context);
    return context;
  }

  setWaiting(userId: string, reason: WaitingReason): ActionExecutionContext {
    const context = this.getContext(userId);
    const labels: Record<WaitingReason, string> = {
      customer: "Waiting for customer",
      confirmation: "Waiting for confirmation",
      payment: "Waiting for payment",
    };
    context.liveStatus = { status: "waiting", label: labels[reason], updatedAt: new Date().toISOString() };
    this.contexts.set(userId, context);
    return context;
  }

  getWaitingLabel(reason: WaitingReason): string {
    const labels: Record<WaitingReason, string> = {
      customer: "Waiting for customer",
      confirmation: "Waiting for confirmation",
      payment: "Waiting for payment",
    };
    return labels[reason];
  }
}

export function createActionRepository(): ActionRepository {
  return new ActionRepository();
}

let singleton: ActionRepository | undefined;

export function actionRepository(): ActionRepository {
  if (!singleton) singleton = createActionRepository();
  return singleton;
}
