import { buildSeedRegistry } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { createBlueprintGovernanceRepository } from "../../blueprint-governance/infrastructure/blueprint-governance-repository.js";
import { compileMarketplaceListing } from "../../marketplace-compilation/domain/marketplace-compiler.js";
import { SEED_NETWORK_EXPERTS } from "../../expert-network/domain/expert-network-seed.js";
import { BLUEPRINT_SCHEMA_VERSION } from "../../action-blueprint/domain/blueprint-schema.js";
import { EXECUTION_BLUEPRINT_SCHEMA_VERSION } from "../../execution-blueprint/domain/execution-schema.js";
import { TEKRR_INTELLIGENCE_SCHEMA_VERSION } from "../../tekrr-intelligence/domain/tekrr-schema.js";
import { REGISTRY_SCHEMA_VERSION } from "../../blueprint-governance/domain/registry-schema.js";
import { MARKETPLACE_COMPILATION_SCHEMA_VERSION } from "../../marketplace-compilation/domain/marketplace-schema.js";
import { INTELLIGENT_PRICING_SCHEMA_VERSION } from "../../intelligent-pricing/domain/pricing-schema.js";
import { INTELLIGENT_COMMISSION_SCHEMA_VERSION } from "../../intelligent-commission/domain/commission-schema.js";
import { PERSONAL_ASSISTANT_SCHEMA_VERSION } from "../../personal-assistant/domain/assistant-schema.js";
import { DEVELOP_ME_SCHEMA_VERSION } from "../../develop-me/domain/development-schema.js";
import { LEARN_BY_ACTION_SCHEMA_VERSION } from "../../learn-by-action/domain/learning-schema.js";
import { EXPERT_NETWORK_SCHEMA_VERSION } from "../../expert-network/domain/expert-network-schema.js";
import { TEAM_BUILDER_SCHEMA_VERSION } from "../../team-builder/domain/team-builder-schema.js";
import type {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_CONFIDENCE_LEVELS,
  KNOWLEDGE_LIFECYCLE_STATES,
  KNOWLEDGE_SOURCE_ENGINES,
} from "./knowledge-bank-schema.js";

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];
export type KnowledgeSourceEngine = (typeof KNOWLEDGE_SOURCE_ENGINES)[number];
export type KnowledgeLifecycleState = (typeof KNOWLEDGE_LIFECYCLE_STATES)[number];
export type KnowledgeConfidenceLevel = (typeof KNOWLEDGE_CONFIDENCE_LEVELS)[number];

export interface KnowledgeItem {
  itemId: string;
  title: string;
  summary: string;
  category: KnowledgeCategory;
  sourceEngine: KnowledgeSourceEngine;
  confidence: KnowledgeConfidenceLevel;
  confidenceScore: number;
  version: string;
  status: KnowledgeLifecycleState;
  author: string;
  contributedAt: string;
  relatedObjects: string[];
  readOnly: true;
}

export interface KnowledgeContribution {
  contributionId: string;
  itemId: string;
  sourceEngine: KnowledgeSourceEngine;
  category: KnowledgeCategory;
  confidence: KnowledgeConfidenceLevel;
  version: string;
  status: KnowledgeLifecycleState;
  author: string;
  timestamp: string;
  relatedObjects: string[];
  summary: string;
}

export interface KnowledgeRelationship {
  relationshipId: string;
  fromItemId: string;
  toItemId: string;
  relationshipType: string;
  label: string;
}

export interface KnowledgeVersion {
  versionId: string;
  itemId: string;
  version: string;
  status: KnowledgeLifecycleState;
  createdAt: string;
  summary: string;
}

export interface CompiledKnowledgeRegistry {
  items: KnowledgeItem[];
  contributions: KnowledgeContribution[];
  relationships: KnowledgeRelationship[];
  versions: KnowledgeVersion[];
  compiledAt: string;
}

const COMPILED_AT = "2026-06-20T12:00:00.000Z";

function engineItem(input: {
  itemId: string;
  title: string;
  summary: string;
  category: KnowledgeCategory;
  sourceEngine: KnowledgeSourceEngine;
  schemaVersion: string;
  relatedObjects?: string[];
}): KnowledgeItem {
  return {
    itemId: input.itemId,
    title: input.title,
    summary: input.summary,
    category: input.category,
    sourceEngine: input.sourceEngine,
    confidence: "very_high",
    confidenceScore: 95,
    version: input.schemaVersion,
    status: "published",
    author: `engine://${input.sourceEngine}`,
    contributedAt: COMPILED_AT,
    relatedObjects: input.relatedObjects ?? [],
    readOnly: true,
  };
}

function toContribution(item: KnowledgeItem): KnowledgeContribution {
  return {
    contributionId: `contrib://${item.itemId}`,
    itemId: item.itemId,
    sourceEngine: item.sourceEngine,
    category: item.category,
    confidence: item.confidence,
    version: item.version,
    status: item.status,
    author: item.author,
    timestamp: item.contributedAt,
    relatedObjects: item.relatedObjects,
    summary: item.summary,
  };
}

function toVersion(item: KnowledgeItem): KnowledgeVersion {
  return {
    versionId: `ver://${item.itemId}/${item.version}`,
    itemId: item.itemId,
    version: item.version,
    status: item.status,
    createdAt: item.contributedAt,
    summary: `Version ${item.version} from ${item.sourceEngine}`,
  };
}

export function compileKnowledgeRegistry(): CompiledKnowledgeRegistry {
  const items: KnowledgeItem[] = [];
  const relationships: KnowledgeRelationship[] = [];

  const engineSchemas: Array<{
    sourceEngine: KnowledgeSourceEngine;
    category: KnowledgeCategory;
    schemaVersion: string;
    title: string;
  }> = [
    {
      sourceEngine: "action_blueprint",
      category: "action_knowledge",
      schemaVersion: BLUEPRINT_SCHEMA_VERSION,
      title: "Action Blueprint Schema",
    },
    {
      sourceEngine: "execution_blueprint",
      category: "blueprint_knowledge",
      schemaVersion: EXECUTION_BLUEPRINT_SCHEMA_VERSION,
      title: "Execution Blueprint Schema",
    },
    {
      sourceEngine: "tekrr_intelligence",
      category: "blueprint_knowledge",
      schemaVersion: TEKRR_INTELLIGENCE_SCHEMA_VERSION,
      title: "TEKRR Intelligence Schema",
    },
    {
      sourceEngine: "governance",
      category: "governance_knowledge",
      schemaVersion: REGISTRY_SCHEMA_VERSION,
      title: "Blueprint Governance Registry",
    },
    {
      sourceEngine: "marketplace_compilation",
      category: "marketplace_knowledge",
      schemaVersion: MARKETPLACE_COMPILATION_SCHEMA_VERSION,
      title: "Marketplace Compilation Schema",
    },
    {
      sourceEngine: "intelligent_pricing",
      category: "pricing_knowledge",
      schemaVersion: INTELLIGENT_PRICING_SCHEMA_VERSION,
      title: "Intelligent Pricing Schema",
    },
    {
      sourceEngine: "intelligent_commission",
      category: "pricing_knowledge",
      schemaVersion: INTELLIGENT_COMMISSION_SCHEMA_VERSION,
      title: "Intelligent Commission Schema",
    },
    {
      sourceEngine: "personal_assistant",
      category: "professional_knowledge",
      schemaVersion: PERSONAL_ASSISTANT_SCHEMA_VERSION,
      title: "Personal Assistant Guidance Schema",
    },
    {
      sourceEngine: "develop_me",
      category: "learning_knowledge",
      schemaVersion: DEVELOP_ME_SCHEMA_VERSION,
      title: "Develop Me Roadmap Schema",
    },
    {
      sourceEngine: "learn_by_action",
      category: "learning_knowledge",
      schemaVersion: LEARN_BY_ACTION_SCHEMA_VERSION,
      title: "Learn by Action Schema",
    },
    {
      sourceEngine: "expert_network",
      category: "expert_knowledge",
      schemaVersion: EXPERT_NETWORK_SCHEMA_VERSION,
      title: "Expert Network Schema",
    },
    {
      sourceEngine: "team_builder",
      category: "team_knowledge",
      schemaVersion: TEAM_BUILDER_SCHEMA_VERSION,
      title: "Team Builder Schema",
    },
  ];

  for (const engine of engineSchemas) {
    items.push(
      engineItem({
        itemId: `kb://engine/${engine.sourceEngine}`,
        title: engine.title,
        summary: `Trusted schema knowledge contributed by ${engine.sourceEngine.replace(/_/g, " ")}.`,
        category: engine.category,
        sourceEngine: engine.sourceEngine,
        schemaVersion: engine.schemaVersion,
      })
    );
  }

  const governance = createBlueprintGovernanceRepository();
  const blueprintItemIds: string[] = [];

  for (const blueprint of buildSeedRegistry()) {
    const registryEntry = governance.getEntry(blueprint.blueprintId, blueprint.version);
    if (!registryEntry) continue;

    const itemId = `kb://blueprint/${blueprint.blueprintId}@${blueprint.version}`;
    blueprintItemIds.push(itemId);
    items.push(
      engineItem({
        itemId,
        title: blueprint.title,
        summary: blueprint.summary,
        category: "action_knowledge",
        sourceEngine: "action_blueprint",
        schemaVersion: `${blueprint.version}`,
        relatedObjects: [blueprint.blueprintId, blueprint.primaryTaxonomyCode],
      })
    );

    items.push(
      engineItem({
        itemId: `kb://execution/${blueprint.blueprintId}@${blueprint.version}`,
        title: `Execution: ${blueprint.title}`,
        summary: `Execution blueprint knowledge for ${blueprint.primaryTaxonomyCode}.`,
        category: "blueprint_knowledge",
        sourceEngine: "execution_blueprint",
        schemaVersion: EXECUTION_BLUEPRINT_SCHEMA_VERSION,
        relatedObjects: [itemId],
      })
    );

    relationships.push({
      relationshipId: `rel://blueprint-execution/${blueprint.blueprintId}`,
      fromItemId: itemId,
      toItemId: `kb://execution/${blueprint.blueprintId}@${blueprint.version}`,
      relationshipType: "derives_from",
      label: "Action blueprint derives execution knowledge",
    });

    try {
      const listing = compileMarketplaceListing({ blueprint, registryEntry });
      const listingItemId = `kb://listing/${listing.id}`;
      items.push(
        engineItem({
          itemId: listingItemId,
          title: listing.title,
          summary: listing.summary,
          category: "marketplace_knowledge",
          sourceEngine: "marketplace_compilation",
          schemaVersion: listing.publicationVersion,
          relatedObjects: [listing.id, listing.blueprintId],
        })
      );
      relationships.push({
        relationshipId: `rel://blueprint-listing/${listing.id}`,
        fromItemId: itemId,
        toItemId: listingItemId,
        relationshipType: "compiles_to",
        label: "Blueprint compiles to marketplace listing",
      });
      relationships.push({
        relationshipId: `rel://listing-pricing/${listing.id}`,
        fromItemId: listingItemId,
        toItemId: "kb://engine/intelligent_pricing",
        relationshipType: "priced_by",
        label: "Listing priced by intelligent pricing engine",
      });
    } catch {
      // Skip listings that fail compilation prerequisites
    }
  }

  for (const expert of SEED_NETWORK_EXPERTS) {
    const itemId = `kb://expert/${expert.expertId}`;
    items.push(
      engineItem({
        itemId,
        title: expert.displayName,
        summary: expert.summary,
        category: "expert_knowledge",
        sourceEngine: "expert_network",
        schemaVersion: EXPERT_NETWORK_SCHEMA_VERSION,
        relatedObjects: [expert.expertId, ...expert.skills],
      })
    );
    relationships.push({
      relationshipId: `rel://expert-learning/${expert.expertId}`,
      fromItemId: itemId,
      toItemId: "kb://engine/learn_by_action",
      relationshipType: "teaches_via",
      label: "Expert contributes to learn-by-action recommendations",
    });
  }

  items.push(
    engineItem({
      itemId: "kb://trust/live-frame",
      title: "Live Frame Trust Signals",
      summary: "Trust score and Live Frame tier knowledge for professional readiness.",
      category: "trust_knowledge",
      sourceEngine: "validation",
      schemaVersion: "trust-v1",
      relatedObjects: ["live_frame", "trust_score"],
    })
  );

  items.push({
    itemId: "kb://draft/community-feedback",
    title: "Community Feedback Insights",
    summary: "Future-ready community contribution knowledge awaiting validation.",
    category: "professional_knowledge",
    sourceEngine: "community_contributions",
    confidence: "moderate",
    confidenceScore: 55,
    version: "draft-v1",
    status: "draft",
    author: "engine://community_contributions",
    contributedAt: COMPILED_AT,
    relatedObjects: ["community_feedback"],
    readOnly: true,
  });

  const contributions = items.map(toContribution);
  const versions = items.map(toVersion);

  return {
    items: items.sort((left, right) => left.itemId.localeCompare(right.itemId)),
    contributions: contributions.sort((left, right) => left.contributionId.localeCompare(right.contributionId)),
    relationships: relationships.sort((left, right) =>
      left.relationshipId.localeCompare(right.relationshipId)
    ),
    versions: versions.sort((left, right) => left.versionId.localeCompare(right.versionId)),
    compiledAt: COMPILED_AT,
  };
}
