import type {
  BlueprintCompositionEdge,
  BlueprintCompositionNode,
  CriticalPathResult,
  ParallelExecutionGroup,
  ProjectBlueprintGraph,
} from "./project-decomposition.js";

export function detectCycle(
  nodes: BlueprintCompositionNode[],
  edges: BlueprintCompositionEdge[]
): string[] | null {
  const nodeIds = new Set(nodes.map((node) => node.nodeId));
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  for (const nodeId of nodeIds) {
    adjacency.set(nodeId, []);
    indegree.set(nodeId, 0);
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) continue;
    adjacency.get(edge.fromNodeId)!.push(edge.toNodeId);
    indegree.set(edge.toNodeId, (indegree.get(edge.toNodeId) ?? 0) + 1);
  }

  const queue = [...indegree.entries()].filter(([, count]) => count === 0).map(([id]) => id);
  const visited: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    visited.push(current);
    for (const next of adjacency.get(current) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) queue.push(next);
    }
  }

  if (visited.length !== nodeIds.size) {
    return [...nodeIds].filter((id) => !visited.includes(id));
  }
  return null;
}

export function topologicalOrder(graph: ProjectBlueprintGraph): string[] {
  const cycle = detectCycle(graph.nodes, graph.edges);
  if (cycle) {
    throw new Error(`Dependency cycle detected: ${cycle.join(", ")}`);
  }

  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    indegree.set(node.nodeId, 0);
    adjacency.set(node.nodeId, []);
  }
  for (const edge of graph.edges) {
    adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);
    indegree.set(edge.toNodeId, (indegree.get(edge.toNodeId) ?? 0) + 1);
  }

  const queue = [...indegree.entries()].filter(([, count]) => count === 0).map(([id]) => id);
  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const next of adjacency.get(current) ?? []) {
      const nextDegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) queue.push(next);
    }
  }
  return order;
}

export function buildParallelExecutionGroups(graph: ProjectBlueprintGraph): ParallelExecutionGroup[] {
  const nodeById = new Map(graph.nodes.map((node) => [node.nodeId, node]));
  const predecessors = new Map<string, Set<string>>();
  for (const node of graph.nodes) predecessors.set(node.nodeId, new Set());
  for (const edge of graph.edges) {
    predecessors.get(edge.toNodeId)?.add(edge.fromNodeId);
  }

  const depth = new Map<string, number>();
  const order = topologicalOrder(graph);
  for (const nodeId of order) {
    const preds = predecessors.get(nodeId) ?? new Set();
    const predDepths = [...preds].map((pred) => depth.get(pred) ?? 0);
    depth.set(nodeId, predDepths.length === 0 ? 0 : Math.max(...predDepths) + 1);
  }

  const groups = new Map<number, string[]>();
  for (const [nodeId, nodeDepth] of depth.entries()) {
    const list = groups.get(nodeDepth) ?? [];
    list.push(nodeId);
    groups.set(nodeDepth, list);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([groupOrder, nodeIds]) => ({
      groupOrder,
      nodeIds,
      labels: nodeIds.map((nodeId) => nodeById.get(nodeId)?.label ?? nodeId),
      parallelizable: nodeIds.length > 1,
    }));
}

export function calculateCriticalPath(graph: ProjectBlueprintGraph): CriticalPathResult {
  const nodeById = new Map(graph.nodes.map((node) => [node.nodeId, node]));
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) adjacency.set(node.nodeId, []);
  for (const edge of graph.edges) adjacency.get(edge.fromNodeId)?.push(edge.toNodeId);

  const order = topologicalOrder(graph);
  const weight = (nodeId: string) => nodeById.get(nodeId)?.durationWeight ?? 1;
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();

  for (const nodeId of order) {
    const preds = graph.edges.filter((edge) => edge.toNodeId === nodeId).map((edge) => edge.fromNodeId);
    if (preds.length === 0) {
      dist.set(nodeId, weight(nodeId));
      prev.set(nodeId, null);
      continue;
    }
    let bestPred = preds[0];
    let bestDist = (dist.get(bestPred) ?? 0) + weight(nodeId);
    for (const pred of preds.slice(1)) {
      const candidate = (dist.get(pred) ?? 0) + weight(nodeId);
      if (candidate > bestDist) {
        bestDist = candidate;
        bestPred = pred;
      }
    }
    dist.set(nodeId, bestDist);
    prev.set(nodeId, bestPred);
  }

  let endNode = order[0];
  let maxDist = dist.get(endNode) ?? 0;
  for (const nodeId of order) {
    const nodeDist = dist.get(nodeId) ?? 0;
    if (nodeDist >= maxDist) {
      maxDist = nodeDist;
      endNode = nodeId;
    }
  }

  const path: string[] = [];
  let cursor: string | null = endNode;
  while (cursor) {
    path.unshift(cursor);
    cursor = prev.get(cursor) ?? null;
  }

  return {
    nodeIds: path,
    totalDurationWeight: maxDist,
    summary: `Critical path spans ${path.length} nodes with total weight ${maxDist}.`,
  };
}

export function buildDependencyAudit(graph: ProjectBlueprintGraph) {
  const cycle = detectCycle(graph.nodes, graph.edges);
  return {
    node_count: graph.nodes.length,
    edge_count: graph.edges.length,
    has_cycle: cycle !== null,
    cycle_nodes: cycle ?? [],
    topological_order: cycle ? [] : topologicalOrder(graph),
    summary: cycle
      ? `Dependency graph invalid: cycle at ${cycle.join(", ")}`
      : `Dependency graph valid with ${graph.edges.length} edges.`,
  };
}
