import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { ProjectBlueprintGraph } from "../domain/project-decomposition.js";
import { collectProjectDecompositionPaths } from "../domain/project-decomposition.js";
import {
  listProjectTemplateSpecs,
  type ProjectTemplateSpec,
} from "../domain/project-templates.js";

export interface PublishedProjectTemplate {
  template: ProjectTemplateSpec;
  status: "published" | "deprecated" | "archived";
  publishedAt: string;
  deprecatedAt?: string;
  deprecatedBy?: string;
}

export class ProjectDecompositionRepository {
  private readonly templates = new Map<string, PublishedProjectTemplate>();
  private readonly graphs = new Map<string, ProjectBlueprintGraph>();

  constructor(private readonly rootDir: string = process.cwd()) {
    for (const template of listProjectTemplateSpecs()) {
      this.templates.set(template.templateId, {
        template,
        status: "published",
        publishedAt: "2026-06-20T00:00:00.000Z",
      });
    }
  }

  listTemplates(): PublishedProjectTemplate[] {
    return [...this.templates.values()].sort((left, right) =>
      left.template.templateId.localeCompare(right.template.templateId)
    );
  }

  getTemplate(templateId: string): PublishedProjectTemplate | undefined {
    return this.templates.get(templateId);
  }

  getTemplateCount(): number {
    return this.templates.size;
  }

  getPublishedTemplateCount(): number {
    return this.listTemplates().filter((entry) => entry.status === "published").length;
  }

  saveGraph(graph: ProjectBlueprintGraph): void {
    this.graphs.set(graph.projectId, graph);
  }

  getGraph(projectId: string): ProjectBlueprintGraph | undefined {
    return this.graphs.get(projectId);
  }

  publishTemplate(template: ProjectTemplateSpec): PublishedProjectTemplate {
    const key = template.templateId;
    if (this.templates.has(key) && this.templates.get(key)!.status === "published") {
      throw new Error(`Template already published: ${key}`);
    }
    const entry: PublishedProjectTemplate = {
      template,
      status: "published",
      publishedAt: new Date().toISOString(),
    };
    this.templates.set(key, entry);
    return entry;
  }

  deprecateTemplate(input: {
    templateId: string;
    successorTemplateId?: string;
  }): PublishedProjectTemplate {
    const existing = this.templates.get(input.templateId);
    if (!existing) {
      throw new Error(`Template not found: ${input.templateId}`);
    }
    const entry: PublishedProjectTemplate = {
      ...existing,
      status: "deprecated",
      deprecatedAt: new Date().toISOString(),
      deprecatedBy: input.successorTemplateId,
    };
    this.templates.set(input.templateId, entry);
    return entry;
  }

  async loadExistingPaths(): Promise<Set<string>> {
    const paths = collectProjectDecompositionPaths();
    const existingPaths = new Set<string>();
    await Promise.all(
      paths.map(async (relativePath) => {
        try {
          await access(path.join(this.rootDir, relativePath));
          existingPaths.add(relativePath);
        } catch {
          // missing
        }
      })
    );
    return existingPaths;
  }

  async readOptional(relativePath: string): Promise<string> {
    try {
      return await readFile(path.join(this.rootDir, relativePath), "utf8");
    } catch {
      return "";
    }
  }
}

export function createProjectDecompositionRepository(input?: {
  rootDir?: string;
}): ProjectDecompositionRepository {
  return new ProjectDecompositionRepository(input?.rootDir);
}

export const projectDecompositionRepository = createProjectDecompositionRepository();
