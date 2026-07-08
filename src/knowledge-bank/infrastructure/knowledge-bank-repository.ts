import {
  compileKnowledgeRegistry,
  type CompiledKnowledgeRegistry,
} from "../domain/knowledge-bank-registry.js";
import {
  applyStatusOverrides,
  buildKnowledgeBankSummary,
  type KnowledgeApproval,
  type KnowledgeItem,
  type KnowledgeLifecycleState,
} from "../domain/knowledge-bank-profile.js";

export class KnowledgeBankRepository {
  private readonly registry: CompiledKnowledgeRegistry;
  private readonly statusOverrides = new Map<string, KnowledgeLifecycleState>();
  private readonly approvals: KnowledgeApproval[] = [];

  constructor() {
    this.registry = compileKnowledgeRegistry();
  }

  getRegistry(): CompiledKnowledgeRegistry {
    return this.registry;
  }

  getItems(): KnowledgeItem[] {
    return applyStatusOverrides(this.registry, this.statusOverrides);
  }

  getItem(itemId: string): KnowledgeItem | undefined {
    return this.getItems().find((item) => item.itemId === itemId);
  }

  getSummary() {
    return buildKnowledgeBankSummary(this.getItems(), this.registry);
  }

  setStatus(itemId: string, status: KnowledgeLifecycleState): void {
    this.statusOverrides.set(itemId, status);
  }

  recordApproval(approval: KnowledgeApproval): void {
    this.approvals.push(approval);
  }

  listApprovals(): KnowledgeApproval[] {
    return [...this.approvals];
  }
}

export function createKnowledgeBankRepository(): KnowledgeBankRepository {
  return new KnowledgeBankRepository();
}

export const knowledgeBankRepository = createKnowledgeBankRepository();
