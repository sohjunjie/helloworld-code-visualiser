import {
  CodeFileNode,
  GraphEdge,
  AnalysisStats,
  SoftwarePatternInfo,
} from '../models/code-visualizer.models';
import { getDirname } from './zip-extractor';
import { analyzeCodeHealth } from './health-analyzer';

export function normalizePathSegments(path: string): string {
  const parts = path.split('/');
  const stack: string[] = [];

  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }

  return stack.join('/');
}

export function resolveImportPath(
  sourcePath: string,
  rawImport: string,
  filePaths: string[]
): string | null {
  if (!rawImport.startsWith('.')) {
    // Non-relative import (e.g. 'react', 'lodash', '@angular/core')
    return null;
  }

  const sourceDir = getDirname(sourcePath);
  const normalizedPath = normalizePathSegments(sourceDir ? `${sourceDir}/${rawImport}` : rawImport);

  const candidates = [
    normalizedPath,
    `${normalizedPath}.ts`,
    `${normalizedPath}.tsx`,
    `${normalizedPath}.js`,
    `${normalizedPath}.jsx`,
    `${normalizedPath}/index.ts`,
    `${normalizedPath}/index.tsx`,
    `${normalizedPath}/index.js`,
  ];

  for (const candidate of candidates) {
    if (filePaths.includes(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function buildDependencyEdges(
  filePaths: string[],
  fileNodes: Record<string, CodeFileNode>
): { edges: GraphEdge[]; adjacencyList: Record<string, string[]> } {
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  const adjacencyList: Record<string, string[]> = {};

  for (const sourcePath of filePaths) {
    const node = fileNodes[sourcePath];
    adjacencyList[sourcePath] = [];

    if (!node || !node.imports) continue;

    for (const rawImport of node.imports) {
      const resolvedTarget = resolveImportPath(sourcePath, rawImport, filePaths);
      if (resolvedTarget && resolvedTarget !== sourcePath) {
        const edgeId = `${sourcePath}->${resolvedTarget}`;
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: sourcePath,
            target: resolvedTarget,
            type: 'import',
            label: rawImport,
          });
          adjacencyList[sourcePath].push(resolvedTarget);
        }
      }
    }
  }

  return { edges, adjacencyList };
}

export function buildDirectoryTree(
  fileNodes: Record<string, CodeFileNode>,
  projectName: string
): CodeFileNode {
  const root: CodeFileNode = {
    id: 'root',
    path: '',
    name: projectName || 'Project Root',
    type: 'directory',
    size: 0,
    extension: '',
    imports: [],
    exports: [],
    children: [],
  };

  for (const [path, node] of Object.entries(fileNodes)) {
    const parts = path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        if (!current.children) current.children = [];
        current.children.push(node);
      } else {
        if (!current.children) current.children = [];
        let dirNode = current.children.find((c) => c.name === part && c.type === 'directory');
        if (!dirNode) {
          const dirPath = parts.slice(0, i + 1).join('/');
          dirNode = {
            id: dirPath,
            path: dirPath,
            name: part,
            type: 'directory',
            size: 0,
            extension: '',
            imports: [],
            exports: [],
            children: [],
          };
          current.children.push(dirNode);
        }
        current = dirNode;
      }
    }
  }

  function computeSizes(node: CodeFileNode): number {
    if (node.type === 'file') return node.size || 0;
    let sum = 0;
    if (node.children) {
      for (const child of node.children) {
        sum += computeSizes(child);
      }
    }
    node.size = sum;
    return sum;
  }

  computeSizes(root);
  return root;
}

export function countDirectories(node: CodeFileNode): number {
  if (node.type !== 'directory') return 0;
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countDirectories(child);
    }
  }
  return count;
}

export function calculateStats(
  filePaths: string[],
  fileNodes: Record<string, CodeFileNode>,
  edges: GraphEdge[],
  rootNode: CodeFileNode,
  cycles: string[][],
  detectedPatterns: SoftwarePatternInfo[]
): AnalysisStats {
  const totalFiles = filePaths.length;
  let totalSize = 0;
  const languageBreakdown: Record<string, number> = {};
  const importCounts: Record<string, number> = {};

  for (const path of filePaths) {
    const node = fileNodes[path];
    if (node) {
      totalSize += node.size || 0;
      const ext = node.extension || 'other';
      languageBreakdown[ext] = (languageBreakdown[ext] || 0) + 1;
    }
    importCounts[path] = 0;
  }

  for (const edge of edges) {
    importCounts[edge.target] = (importCounts[edge.target] || 0) + 1;
  }

  const topImportedFiles = Object.entries(importCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const codeHealth = analyzeCodeHealth(filePaths, fileNodes, edges);

  return {
    totalFiles,
    totalDirectories: countDirectories(rootNode),
    totalSize,
    circularDependencies: cycles,
    languageBreakdown,
    topImportedFiles,
    detectedPatterns,
    codeHealth,
  };
}
