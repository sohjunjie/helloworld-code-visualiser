import JSZip from 'jszip';
import * as babelParser from '@babel/parser';
import { AnalysisResult, CodeFileNode, GraphEdge, UploadProgress } from '../models/code-visualizer.models';

addEventListener('message', async ({ data }) => {
  const { action, payload } = data;

  if (action === 'ANALYZE_ZIP') {
    try {
      await processZipFile(payload.arrayBuffer, payload.fileName);
    } catch (err: any) {
      postMessage({
        type: 'PROGRESS',
        progress: {
          stage: 'error',
          percentage: 0,
          message: 'Failed to process ZIP archive',
          error: err?.message || 'Unknown error during zip extraction',
        } as UploadProgress,
      });
    }
  } else if (action === 'ANALYZE_DEMO') {
    try {
      await processDemoFiles(payload.files, payload.projectName);
    } catch (err: any) {
      postMessage({
        type: 'PROGRESS',
        progress: {
          stage: 'error',
          percentage: 0,
          message: 'Failed to process demo project',
          error: err?.message || 'Unknown error during demo parsing',
        } as UploadProgress,
      });
    }
  }
});

async function processZipFile(arrayBuffer: ArrayBuffer, fileName: string) {
  reportProgress('unzipping', 10, 'Extracting ZIP archive contents...');

  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(arrayBuffer);
  
  const rawFiles: Record<string, string> = {};
  const entries = Object.keys(loadedZip.files);
  let processed = 0;

  for (const relativePath of entries) {
    const entry = loadedZip.files[relativePath];
    processed++;

    // Ignore directories, node_modules, git, binaries, and hidden files
    if (
      entry.dir ||
      relativePath.includes('node_modules/') ||
      relativePath.includes('.git/') ||
      relativePath.startsWith('__MACOSX/') ||
      relativePath.endsWith('.DS_Store') ||
      isBinaryFile(relativePath)
    ) {
      continue;
    }

    try {
      const content = await entry.async('text');
      // Normalize path (remove leading slashes)
      const cleanPath = relativePath.replace(/^\/+/, '');
      rawFiles[cleanPath] = content;
    } catch {
      // Skip non-text files that fail string extraction
    }

    if (processed % 20 === 0 || processed === entries.length) {
      const pct = 10 + Math.floor((processed / entries.length) * 30);
      reportProgress('unzipping', pct, `Extracted ${processed}/${entries.length} files...`);
    }
  }

  await buildAndParseGraph(rawFiles, fileName.replace(/\.zip$/i, ''));
}

async function processDemoFiles(files: Record<string, { content: string }>, projectName: string) {
  reportProgress('unzipping', 30, 'Loading demo project files...');
  const rawFiles: Record<string, string> = {};
  for (const [path, obj] of Object.entries(files)) {
    rawFiles[path] = obj.content;
  }
  await buildAndParseGraph(rawFiles, projectName);
}

async function buildAndParseGraph(rawFiles: Record<string, string>, projectName: string) {
  reportProgress('parsing', 45, 'Parsing AST and module dependencies...');

  const fileNodes: Record<string, CodeFileNode> = {};
  const filePaths = Object.keys(rawFiles);
  let parsedCount = 0;

  // 1. Build File Nodes & Extract Imports/Exports via Babel Parser / Regex Fallback
  for (const path of filePaths) {
    parsedCount++;
    const content = rawFiles[path];
    const ext = getFileExtension(path);
    const lineCount = content.split('\n').length;
    
    const { imports, exports, astSummary } = parseFileContents(path, content, ext, lineCount);

    fileNodes[path] = {
      id: path,
      path,
      name: getBasename(path),
      type: 'file',
      size: new Blob([content]).size,
      extension: ext,
      content,
      imports,
      exports,
      astSummary,
    };

    if (parsedCount % 15 === 0 || parsedCount === filePaths.length) {
      const pct = 45 + Math.floor((parsedCount / filePaths.length) * 35);
      reportProgress('parsing', pct, `Parsed ${parsedCount}/${filePaths.length} source files...`);
    }
  }

  reportProgress('graph-building', 85, 'Connecting module edges & resolving cycles...');

  // 2. Resolve Module Import Edges
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();
  const adjacencyList: Record<string, string[]> = {};

  for (const sourcePath of filePaths) {
    const node = fileNodes[sourcePath];
    adjacencyList[sourcePath] = [];

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

  // 3. Find Circular Dependencies using DFS
  const cycles = findCircularDependencies(filePaths, adjacencyList);

  // 4. Build Directory Tree Structure
  const rootNode = buildDirectoryTree(fileNodes, projectName);

  // 5. Calculate Stats
  const totalFiles = filePaths.length;
  let totalSize = 0;
  const languageBreakdown: Record<string, number> = {};
  const importCounts: Record<string, number> = {};

  for (const path of filePaths) {
    const node = fileNodes[path];
    totalSize += node.size;
    const ext = node.extension || 'other';
    languageBreakdown[ext] = (languageBreakdown[ext] || 0) + 1;
    importCounts[path] = 0;
  }

  for (const edge of edges) {
    importCounts[edge.target] = (importCounts[edge.target] || 0) + 1;
  }

  const topImportedFiles = Object.entries(importCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const result: AnalysisResult = {
    projectName,
    rootNode,
    files: fileNodes,
    edges,
    stats: {
      totalFiles,
      totalDirectories: countDirectories(rootNode),
      totalSize,
      circularDependencies: cycles,
      languageBreakdown,
      topImportedFiles,
    },
  };

  reportProgress('complete', 100, 'Analysis complete!');

  postMessage({
    type: 'RESULT',
    result,
  });
}

function parseFileContents(path: string, content: string, ext: string, lineCount: number) {
  const imports: string[] = [];
  const exports: string[] = [];
  let functionCount = 0;
  let classCount = 0;

  const isJsTs = ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'].includes(ext);

  if (isJsTs && content.trim().length > 0) {
    try {
      const ast = babelParser.parse(content, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'exportDefaultFrom',
        ],
        errorRecovery: true,
      });

      for (const statement of ast.program.body) {
        if (statement.type === 'ImportDeclaration') {
          imports.push(statement.source.value);
        } else if (statement.type === 'ExportNamedDeclaration') {
          if (statement.source) {
            imports.push(statement.source.value);
          }
          if (statement.declaration) {
            if (statement.declaration.type === 'FunctionDeclaration') functionCount++;
            if (statement.declaration.type === 'ClassDeclaration') classCount++;
          }
        } else if (statement.type === 'ExportDefaultDeclaration') {
          exports.push('default');
        } else if (statement.type === 'FunctionDeclaration') {
          functionCount++;
        } else if (statement.type === 'ClassDeclaration') {
          classCount++;
        }
      }
    } catch {
      // Fallback regex parsing if Babel encounters unparseable syntax
      parseWithRegex(content, imports, exports);
    }
  } else {
    parseWithRegex(content, imports, exports);
  }

  return {
    imports: Array.from(new Set(imports)),
    exports: Array.from(new Set(exports)),
    astSummary: {
      totalLines: lineCount,
      importCount: imports.length,
      exportCount: exports.length,
      functionCount,
      classCount,
    },
  };
}

function parseWithRegex(content: string, imports: string[], exports: string[]) {
  const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
}

function resolveImportPath(sourcePath: string, rawImport: string, filePaths: string[]): string | null {
  if (!rawImport.startsWith('.')) {
    // Non-relative import (e.g. 'react', 'lodash', '@angular/core')
    return null;
  }

  const sourceDir = getDirname(sourcePath);
  const normalizedPath = normalizePathSegments(`${sourceDir}/${rawImport}`);

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

function normalizePathSegments(path: string): string {
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

function findCircularDependencies(filePaths: string[], adj: Record<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const pathStack: string[] = [];

  function dfs(curr: string) {
    visited.add(curr);
    recStack.add(curr);
    pathStack.push(curr);

    const neighbors = adj[curr] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        const cycleStartIndex = pathStack.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const cycle = pathStack.slice(cycleStartIndex);
          cycle.push(neighbor);
          if (cycles.length < 10) {
            cycles.push(cycle);
          }
        }
      }
    }

    pathStack.pop();
    recStack.delete(curr);
  }

  for (const file of filePaths) {
    if (!visited.has(file)) {
      dfs(file);
    }
  }

  return cycles;
}

function buildDirectoryTree(fileNodes: Record<string, CodeFileNode>, projectName: string): CodeFileNode {
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
        current.size += node.size;
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
        dirNode.size += node.size;
        current = dirNode;
      }
    }
  }

  return root;
}

function countDirectories(node: CodeFileNode): number {
  if (node.type !== 'directory') return 0;
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countDirectories(child);
    }
  }
  return count;
}

function getBasename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

function getDirname(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/');
}

function getFileExtension(path: string): string {
  const parts = path.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function isBinaryFile(path: string): boolean {
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp',
    'pdf', 'zip', 'tar', 'gz', '7z', 'rar',
    'exe', 'dll', 'so', 'dylib', 'bin',
    'mp3', 'mp4', 'wav', 'avi', 'mov',
    'woff', 'woff2', 'ttf', 'eot',
  ];
  const ext = getFileExtension(path);
  return binaryExtensions.includes(ext);
}

function reportProgress(stage: UploadProgress['stage'], percentage: number, message: string) {
  postMessage({
    type: 'PROGRESS',
    progress: {
      stage,
      percentage,
      message,
    } as UploadProgress,
  });
}
