import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  buildKnowledgeBankStatistics,
  buildKnowledgeLifecycle,
  buildKnowledgeRegistry,
  getCategoryCatalog,
  toKnowledgeBankStatisticsView,
  toKnowledgeBankSummaryView,
  toKnowledgeContributionView,
  toKnowledgeItemView,
  toKnowledgeLifecycleView,
  toKnowledgeRelationshipView,
  toKnowledgeValidationView,
  toKnowledgeVersionView,
  toKnowledgeApprovalView,
  transitionLifecycle,
  validateKnowledgeItem,
  type KnowledgeApproval,
} from "../domain/knowledge-bank-profile.js";
import {
  createKnowledgeBankRepository,
  type KnowledgeBankRepository,
} from "../infrastructure/knowledge-bank-repository.js";

export class KnowledgeBankService {
  private readonly repository: KnowledgeBankRepository;

  constructor(deps?: { repository?: KnowledgeBankRepository }) {
    this.repository = deps?.repository ?? createKnowledgeBankRepository();
  }

  getOverview(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const summary = this.repository.getSummary();
    return {
      ...toKnowledgeBankSummaryView(summary),
      explainable: true,
      read_only: true,
    };
  }

  getCategories(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const items = this.repository.getItems();
    const catalog = getCategoryCatalog();
    return {
      categories: catalog.map((entry) => ({
        category: entry.category,
        label: entry.label,
        item_count: items.filter((item) => item.category === entry.category).length,
      })),
      count: catalog.length,
    };
  }

  getItems(authContext: AuthContext, query?: { category?: string; source_engine?: string; status?: string }) {
    this.assertAuthenticated(authContext);
    let items = this.repository.getItems();
    if (query?.category) {
      items = items.filter((item) => item.category === query.category);
    }
    if (query?.source_engine) {
      items = items.filter((item) => item.sourceEngine === query.source_engine);
    }
    if (query?.status) {
      items = items.filter((item) => item.status === query.status);
    }
    return {
      items: items.map(toKnowledgeItemView),
      count: items.length,
    };
  }

  getRelationships(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const registry = this.repository.getRegistry();
    return {
      relationships: registry.relationships.map(toKnowledgeRelationshipView),
      count: registry.relationships.length,
    };
  }

  getContributions(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const registry = this.repository.getRegistry();
    const items = this.repository.getItems();
    const contributions = registry.contributions.map((contribution) => {
      const item = items.find((entry) => entry.itemId === contribution.itemId);
      return toKnowledgeContributionView({
        ...contribution,
        status: item?.status ?? contribution.status,
      });
    });
    return {
      contributions,
      count: contributions.length,
    };
  }

  getVersions(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const registry = this.repository.getRegistry();
    return {
      versions: registry.versions.map(toKnowledgeVersionView),
      count: registry.versions.length,
    };
  }

  getLifecycle(authContext: AuthContext, itemId?: string) {
    this.assertAuthenticated(authContext);
    const registry = this.repository.getRegistry();
    if (itemId) {
      const item = this.repository.getItem(itemId);
      if (!item) return { error: "Item not found" };
      return toKnowledgeLifecycleView(buildKnowledgeLifecycle(item, registry.relationships));
    }
    const items = this.repository.getItems().slice(0, 10);
    return {
      lifecycles: items.map((item) =>
        toKnowledgeLifecycleView(buildKnowledgeLifecycle(item, registry.relationships))
      ),
      count: items.length,
    };
  }

  getSummary(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return toKnowledgeBankSummaryView(this.repository.getSummary());
  }

  validate(authContext: AuthContext, body: { item_id: string }) {
    this.assertAuthenticated(authContext);
    const item = this.repository.getItem(body.item_id);
    if (!item) {
      return { valid: false, error: "Item not found" };
    }
    const validation = validateKnowledgeItem(item);
    if (validation.valid && item.status === "draft") {
      this.repository.setStatus(item.itemId, "validated");
    }
    return {
      ...toKnowledgeValidationView(validation),
      transitioned: validation.valid && item.status === "draft",
      new_state: validation.valid && item.status === "draft" ? "validated" : item.status,
    };
  }

  publish(authContext: AuthContext, body: { item_id: string }) {
    this.assertAuthenticated(authContext);
    const item = this.repository.getItem(body.item_id);
    if (!item) {
      return { success: false, error: "Item not found" };
    }
    const result = transitionLifecycle(item, "publish");
    if (result.success) {
      this.repository.setStatus(item.itemId, result.newState);
    }
    return {
      ...result,
      read_only: true,
    };
  }

  approve(authContext: AuthContext, body: { item_id: string }) {
    requireRole(authContext, "platform_admin");
    const item = this.repository.getItem(body.item_id);
    if (!item) {
      return { success: false, error: "Item not found" };
    }
    const result = transitionLifecycle(item, "approve");
    if (result.success) {
      this.repository.setStatus(item.itemId, result.newState);
      const approval: KnowledgeApproval = {
        approvalId: `approval://${item.itemId}/${Date.now()}`,
        itemId: item.itemId,
        approvedBy: authContext.userId,
        approvedAt: new Date().toISOString(),
        fromState: result.previousState,
        toState: result.newState,
        explanation: result.explanation,
      };
      this.repository.recordApproval(approval);
      return {
        ...result,
        approval: toKnowledgeApprovalView(approval),
        read_only: true,
      };
    }
    return { ...result, read_only: true };
  }

  archive(authContext: AuthContext, body: { item_id: string }) {
    requireRole(authContext, "platform_admin");
    const item = this.repository.getItem(body.item_id);
    if (!item) {
      return { success: false, error: "Item not found" };
    }
    const result = transitionLifecycle(item, "archive");
    if (result.success) {
      this.repository.setStatus(item.itemId, result.newState);
    }
    return {
      ...result,
      read_only: true,
    };
  }

  getStatistics(authContext: AuthContext) {
    requireRole(authContext, "platform_admin");
    const stats = buildKnowledgeBankStatistics(
      this.repository.getItems(),
      this.repository.getRegistry()
    );
    return toKnowledgeBankStatisticsView(stats);
  }

  getRegistryView(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return buildKnowledgeRegistry(this.repository.getItems(), this.repository.getRegistry());
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createKnowledgeBankService(deps?: {
  repository?: KnowledgeBankRepository;
}): KnowledgeBankService {
  return new KnowledgeBankService(deps);
}

export interface KnowledgeBankModule {
  knowledgeBank: KnowledgeBankService;
}

export function createKnowledgeBankModule(deps?: {
  repository?: KnowledgeBankRepository;
}): KnowledgeBankModule {
  const repository = deps?.repository ?? createKnowledgeBankRepository();
  const knowledgeBank = createKnowledgeBankService({ repository });
  return { knowledgeBank };
}
