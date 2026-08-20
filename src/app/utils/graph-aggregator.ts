import {
  CodeFileNode,
  GraphEdge,
  AggregatedGraphNode,
  AggregatedGraphEdge,
  AggregatedGraphResult,
  BreadcrumbItem,
} from '../models/code-visualizer.models';

export type {
  AggregatedGraphNode,
  AggregatedGraphEdge,
  AggregatedGraphResult,
  BreadcrumbItem,
};

/**
 * Returns the immediate child folder or file key under currentPath for a given filePath.
 * Returns null if filePath does not reside within currentPath.
 */
export function getDirectChildKey(
  filePath: string,
  currentDirPath: string | null | undefined
): string | null {
  const current = (currentDirPath || '').trim().replace(/^\/+|\/+$/g, '');
  const normalizedFile = filePath.trim().replace(/^\/+|\/+$/g, '');

  if (current === '') {
    const parts = normalizedFile.split('/');
    return parts[0] || null;
  }

  if (normalizedFile === current) {
    return normalizedFile;
  }

  if (normalizedFile.startsWith(current + '/')) {
    const remaining = normalizedFile.slice(current.length + 1);
    const parts = remaining.split('/');
    return `${current}/${parts[0]}`;
  }

  return null;
}

/**
 * Computes breadcrumb trail items for a given directory path.
 */
export function getBreadcrumbsForPath(
  currentDirPath: string | null | undefined
): BreadcrumbItem[] {
  const normalized = (currentDirPath || '').trim().replace(/^\/+|\/+$/g, '');
  const crumbs: BreadcrumbItem[] = [{ label: 'Root', path: null }];

  if (!normalized) {
    return crumbs;
  }

  const parts = normalized.split('/');
  let currentAcc = '';

  for (const part of parts) {
    if (!part) continue;
    currentAcc = currentAcc ? `${currentAcc}/${part}` : part;
    crumbs.push({
      label: part,
      path: currentAcc,
    });
  }

  return crumbs;
}

export interface GraphAggregatorOptions {
  includeExternalBoundaries?: boolean;
  circularDependencies?: string[][];
}

/**
 * Aggregates file-level graph nodes and edges into directory/module level nodes
 * and weighted cross-directory dependency links with optional boundary preservation.
 */
export function computeAggregatedGraph(
  files: Record<string, CodeFileNode>,
  edges: GraphEdge[],
  currentDirPath: string | null | undefined,
  options: GraphAggregatorOptions = {}
): AggregatedGraphResult {
  const currentPath = (currentDirPath || '').trim().replace(/^\/+|\/+$/g, '');
  const includeExternal = options.includeExternalBoundaries !== false;
  const cycleSet = new Set<string>();

  if (options.circularDependencies) {
    for (const cycle of options.circularDependencies) {
      for (const path of cycle) {
        cycleSet.add(path);
      }
    }
  }

  // 1. Group files into immediate child buckets under currentPath
  interface ChildBucket {
    key: string;
    files: CodeFileNode[];
    isFile: boolean;
  }

  const buckets = new Map<string, ChildBucket>();

  for (const [filePath, fileNode] of Object.entries(files)) {
    const childKey = getDirectChildKey(filePath, currentPath);
    if (!childKey) continue;

    let bucket = buckets.get(childKey);
    if (!bucket) {
      const isDirectFile = filePath === childKey && fileNode.type === 'file';
      bucket = {
        key: childKey,
        files: [],
        isFile: isDirectFile,
      };
      buckets.set(childKey, bucket);
    }
    bucket.files.push(fileNode);
  }

  // 2. Build internal AggregatedGraphNodes
  const internalNodeMap = new Map<string, AggregatedGraphNode>();

  for (const [key, bucket] of buckets.entries()) {
    const isDirectFile = bucket.isFile && bucket.files.length === 1;
    const fileCount = bucket.files.length;
    let totalSize = 0;
    let isCycle = false;
    const extCounts: Record<string, number> = {};

    for (const f of bucket.files) {
      totalSize += f.size || 0;
      if (cycleSet.has(f.path)) {
        isCycle = true;
      }
      const ext = f.extension || '';
      if (ext) {
        extCounts[ext] = (extCounts[ext] || 0) + 1;
      }
    }

    const keyParts = key.split('/');
    const displayName = keyParts[keyParts.length - 1] || key;

    let primaryExtension = 'dir';
    if (isDirectFile) {
      primaryExtension = bucket.files[0].extension;
    } else {
      const sortedExts = Object.entries(extCounts).sort((a, b) => b[1] - a[1]);
      if (sortedExts.length > 0) {
        primaryExtension = sortedExts[0][0];
      }
    }

    const aggNode: AggregatedGraphNode = {
      id: key,
      name: displayName,
      path: key,
      type: isDirectFile ? 'file' : 'directory',
      fileCount,
      size: totalSize,
      extension: isDirectFile ? primaryExtension : 'dir',
      isCycle,
      isExternalBoundary: false,
      childrenCount: isDirectFile ? undefined : fileCount,
    };

    internalNodeMap.set(key, aggNode);
  }

  // 3. Aggregate Edges and collect External Boundary Nodes
  interface EdgeAccumulator {
    id: string;
    source: string;
    target: string;
    weight: number;
    isExternal: boolean;
  }

  const edgeMap = new Map<string, EdgeAccumulator>();
  const externalNodeMap = new Map<string, AggregatedGraphNode>();

  function getOrCreateExternalNode(nodeId: string): AggregatedGraphNode {
    let existing = externalNodeMap.get(nodeId);
    if (!existing) {
      const extFile = files[nodeId];
      const extParts = nodeId.split('/');
      existing = {
        id: nodeId,
        name: extFile?.name || extParts[extParts.length - 1] || nodeId,
        path: nodeId,
        type: extFile?.type || 'file',
        fileCount: 1,
        size: extFile?.size || 0,
        extension: extFile?.extension || '',
        isExternalBoundary: true,
        isCycle: cycleSet.has(nodeId),
      };
      externalNodeMap.set(nodeId, existing);
    }
    return existing;
  }

  for (const edge of edges) {
    const srcChild = getDirectChildKey(edge.source, currentPath);
    const tgtChild = getDirectChildKey(edge.target, currentPath);


    if (srcChild && tgtChild) {
      // Both source and target are inside current directory
      if (srcChild !== tgtChild) {
        const edgeId = `${srcChild}->${tgtChild}`;
        const existing = edgeMap.get(edgeId);
        if (existing) {
          existing.weight += 1;
        } else {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: srcChild,
            target: tgtChild,
            weight: 1,
            isExternal: false,
          });
        }
      }
    } else if (includeExternal && currentPath !== '') {
      // External boundary connection (only when drilled into a subdirectory)
      if (srcChild && !tgtChild) {
        // Outgoing dependency from inside current directory to external file/node
        getOrCreateExternalNode(edge.target);
        const edgeId = `${srcChild}->${edge.target}`;
        const existing = edgeMap.get(edgeId);
        if (existing) {
          existing.weight += 1;
        } else {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: srcChild,
            target: edge.target,
            weight: 1,
            isExternal: true,
          });
        }
      } else if (!srcChild && tgtChild) {
        // Incoming dependency from external file/node to inside current directory
        getOrCreateExternalNode(edge.source);
        const edgeId = `${edge.source}->${tgtChild}`;
        const existing = edgeMap.get(edgeId);
        if (existing) {
          existing.weight += 1;
        } else {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: edge.source,
            target: tgtChild,
            weight: 1,
            isExternal: true,
          });
        }
      }
    }
  }

  // 4. Assemble nodes and formatted edges
  const allNodes: AggregatedGraphNode[] = [
    ...Array.from(internalNodeMap.values()),
    ...Array.from(externalNodeMap.values()),
  ];

  const aggregatedEdges: AggregatedGraphEdge[] = Array.from(edgeMap.values()).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    weight: e.weight,
    label: e.weight === 1 ? '1 import' : `${e.weight} imports`,
    isExternal: e.isExternal,
  }));

  return {
    nodes: allNodes,
    edges: aggregatedEdges,
    currentPath: currentPath || null,
  };
}
