import { SEMVER_PATTERN } from "./registry-schema.js";

export interface BlueprintVersionNode {
  blueprintId: string;
  version: string;
  status: string;
  publishedAt?: string;
  supersedes?: string;
  supersededBy?: string;
}

export interface BlueprintVersionGraph {
  blueprintId: string;
  nodes: BlueprintVersionNode[];
  canonicalVersion: string;
  latestPublishedVersion: string;
}

export function isValidSemanticVersion(version: string): boolean {
  return SEMVER_PATTERN.test(version);
}

export function compareSemanticVersions(left: string, right: string): number {
  if (!isValidSemanticVersion(left) || !isValidSemanticVersion(right)) {
    return left.localeCompare(right);
  }
  const leftParts = left.split(".").map(Number);
  const rightParts = right.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const delta = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (delta !== 0) {
      return delta;
    }
  }
  return 0;
}

export function selectCanonicalVersion(nodes: BlueprintVersionNode[]): string {
  const published = nodes.filter((node) => node.status === "published");
  if (published.length === 0) {
    const sorted = [...nodes].sort((left, right) =>
      compareSemanticVersions(right.version, left.version)
    );
    return sorted[0]?.version ?? "1.0.0";
  }
  const sorted = [...published].sort((left, right) =>
    compareSemanticVersions(right.version, left.version)
  );
  return sorted[0].version;
}

export function buildVersionGraph(blueprintId: string, nodes: BlueprintVersionNode[]): BlueprintVersionGraph {
  const sorted = [...nodes].sort((left, right) =>
    compareSemanticVersions(left.version, right.version)
  );

  const linked = sorted.map((node, index) => {
    const prior = index > 0 ? sorted[index - 1] : undefined;
    const next = index < sorted.length - 1 ? sorted[index + 1] : undefined;
    return {
      ...node,
      supersedes: node.supersedes ?? prior?.version,
      supersededBy: node.supersededBy ?? next?.version,
    };
  });

  const published = linked.filter((node) => node.status === "published");
  const latestPublished = published.length > 0
    ? [...published].sort((left, right) => compareSemanticVersions(right.version, left.version))[0].version
    : selectCanonicalVersion(linked);

  return {
    blueprintId,
    nodes: linked,
    canonicalVersion: selectCanonicalVersion(linked),
    latestPublishedVersion: latestPublished,
  };
}

export function validateVersionForPublish(version: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isValidSemanticVersion(version)) {
    errors.push(`Version ${version} is not valid semver (expected major.minor.patch)`);
  }
  return { valid: errors.length === 0, errors };
}
