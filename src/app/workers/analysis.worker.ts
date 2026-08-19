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

  const detectedPatterns = detectSoftwarePatterns(fileNodes, totalFiles);

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
      detectedPatterns,
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

function detectSoftwarePatterns(fileNodes: Record<string, CodeFileNode>, totalFiles: number): import('../models/code-visualizer.models').SoftwarePatternInfo[] {
  const patterns: import('../models/code-visualizer.models').SoftwarePatternInfo[] = [];
  const paths = Object.keys(fileNodes);

  // 1. Component-Based Architecture
  const componentFiles = paths.filter(p => 
    p.includes('/components/') || p.includes('/views/') || p.includes('/widgets/') || 
    p.endsWith('.component.ts') || p.endsWith('.component.html') || p.endsWith('.component.css') ||
    p.endsWith('.jsx') || p.endsWith('.tsx') || p.endsWith('.vue') || p.endsWith('.svelte')
  );
  if (componentFiles.length > 0) {
    const ratio = Math.min(100, Math.round((componentFiles.length / Math.max(1, totalFiles)) * 100) + 40);

    // Build logical groupings by subdirectory type
    const compDirFiles = componentFiles.filter(p => p.includes('/components/'));
    const viewDirFiles = componentFiles.filter(p => p.includes('/views/') || p.includes('/widgets/'));
    const otherCompFiles = componentFiles.filter(p => !p.includes('/components/') && !p.includes('/views/') && !p.includes('/widgets/'));

    const compGroupings: import('../models/code-visualizer.models').PatternGrouping[] = [];
    if (compDirFiles.length > 0) {
      compGroupings.push({ name: 'Components', description: 'Encapsulated UI components with templates and scoped styles', files: compDirFiles, colorClass: 'sky' });
    }
    if (viewDirFiles.length > 0) {
      compGroupings.push({ name: 'Views & Widgets', description: 'Page-level views and reusable widget elements', files: viewDirFiles, colorClass: 'indigo' });
    }
    if (otherCompFiles.length > 0) {
      compGroupings.push({ name: 'Other Component Files', description: 'Component files outside standard directories (JSX, TSX, Vue, Svelte)', files: otherCompFiles, colorClass: 'purple' });
    }

    patterns.push({
      id: 'component-based',
      name: 'Component-Based Architecture',
      category: 'UI & Frontend Structure',
      description: 'Decomposes user interfaces into modular, encapsulated components that manage their own state and rendering logic.',
      confidence: Math.min(98, Math.max(65, ratio)),
      level: ratio > 75 ? 'High' : ratio > 45 ? 'Medium' : 'Low',
      matchingFiles: componentFiles.slice(0, 8),
      keyIndicators: [
        `${componentFiles.length} Component files detected`,
        'Encapsulated view templates & scoped component styles',
        'Hierarchical UI component tree layout'
      ],
      icon: 'cube',
      colorClass: 'sky',
      logicalGroupings: compGroupings,
    });
  }

  // 2. Layered (N-Tier) Architecture
  const serviceFiles = paths.filter(p => p.includes('/services/') || p.endsWith('.service.ts') || p.includes('/logic/'));
  const modelFiles = paths.filter(p => p.includes('/models/') || p.endsWith('.model.ts') || p.includes('/entities/') || p.includes('/schema/'));
  const controllerFiles = paths.filter(p => p.includes('/controllers/') || p.includes('/routes/') || p.includes('/api/'));
  
  const layerCount = (serviceFiles.length > 0 ? 1 : 0) + (modelFiles.length > 0 ? 1 : 0) + (componentFiles.length > 0 || controllerFiles.length > 0 ? 1 : 0);
  if (layerCount >= 2) {
    const matching = Array.from(new Set([...serviceFiles, ...modelFiles, ...controllerFiles]));
    const confidence = layerCount >= 3 ? 92 : 75;

    const layerGroupings: import('../models/code-visualizer.models').PatternGrouping[] = [];
    if (controllerFiles.length > 0) {
      layerGroupings.push({ name: 'Controller / API Layer', description: 'Handles HTTP routes, request dispatch, and API endpoint definitions', files: controllerFiles, colorClass: 'amber' });
    }
    if (componentFiles.length > 0) {
      layerGroupings.push({ name: 'Presentation Layer', description: 'UI templates, views, and visual rendering components', files: componentFiles, colorClass: 'sky' });
    }
    if (serviceFiles.length > 0) {
      layerGroupings.push({ name: 'Service / Business Logic Layer', description: 'Core business logic, data processing, and service orchestration', files: serviceFiles, colorClass: 'indigo' });
    }
    if (modelFiles.length > 0) {
      layerGroupings.push({ name: 'Data / Model Layer', description: 'Data models, entities, schemas, and persistence definitions', files: modelFiles, colorClass: 'emerald' });
    }

    patterns.push({
      id: 'layered-ntier',
      name: 'Layered (N-Tier) Architecture',
      category: 'System Structure',
      description: 'Organizes code into horizontal tiers with isolated responsibilities (Presentation, Business Service Logic, Data Model/Persistence).',
      confidence,
      level: confidence > 85 ? 'High' : 'Medium',
      matchingFiles: matching.slice(0, 8),
      keyIndicators: [
        serviceFiles.length > 0 ? `Service Layer (${serviceFiles.length} files)` : '',
        modelFiles.length > 0 ? `Data/Model Layer (${modelFiles.length} files)` : '',
        componentFiles.length > 0 ? `Presentation Layer (${componentFiles.length} files)` : '',
        controllerFiles.length > 0 ? `Controller/API Layer (${controllerFiles.length} files)` : ''
      ].filter(Boolean),
      icon: 'layers',
      colorClass: 'indigo',
      logicalGroupings: layerGroupings,
    });
  }

  // 3. Event-Driven & Reactive Architecture
  const reactiveFiles = paths.filter(p => {
    const content = fileNodes[p]?.content || '';
    return content.includes('EventEmitter') || content.includes('postMessage') || 
           content.includes('addEventListener') || content.includes('Subject') || 
           content.includes('BehaviorSubject') || content.includes('signal(') ||
           content.includes('Worker') || p.includes('worker');
  });

  if (reactiveFiles.length > 0) {
    const confidence = Math.min(95, 60 + reactiveFiles.length * 8);

    // Group by reactive mechanism type
    const signalFiles = reactiveFiles.filter(p => { const c = fileNodes[p]?.content || ''; return c.includes('signal(') || c.includes('Subject') || c.includes('BehaviorSubject'); });
    const workerFiles = reactiveFiles.filter(p => p.includes('worker') || (fileNodes[p]?.content || '').includes('postMessage') || (fileNodes[p]?.content || '').includes('Worker'));
    const eventFiles = reactiveFiles.filter(p => { const c = fileNodes[p]?.content || ''; return c.includes('EventEmitter') || c.includes('addEventListener'); });
    const reactiveGroupings: import('../models/code-visualizer.models').PatternGrouping[] = [];
    if (signalFiles.length > 0) {
      reactiveGroupings.push({ name: 'Signals & Observables', description: 'Reactive state management via signals, Subjects, and observables', files: signalFiles, colorClass: 'amber' });
    }
    if (workerFiles.length > 0) {
      reactiveGroupings.push({ name: 'Web Workers & Message Passing', description: 'Background thread workers using postMessage for async communication', files: workerFiles, colorClass: 'purple' });
    }
    if (eventFiles.length > 0) {
      reactiveGroupings.push({ name: 'Event Emitters & Listeners', description: 'DOM or custom event-based communication channels', files: eventFiles, colorClass: 'sky' });
    }

    patterns.push({
      id: 'event-driven',
      name: 'Event-Driven & Reactive Architecture',
      category: 'Data & Async Flow',
      description: 'Uses asynchronous event channels, reactive state signals/observables, and message passing (e.g. Web Workers / Events) to decouple producers and consumers.',
      confidence,
      level: confidence > 80 ? 'High' : 'Medium',
      matchingFiles: reactiveFiles.slice(0, 8),
      keyIndicators: [
        'Reactive State Signals & Event Observers',
        'Asynchronous Web Worker message dispatching (`postMessage`)',
        `Found in ${reactiveFiles.length} key modules`
      ],
      icon: 'bolt',
      colorClass: 'amber',
      logicalGroupings: reactiveGroupings,
    });
  }

  // 4. Model-View-Controller (MVC) Pattern
  if (modelFiles.length > 0 && (componentFiles.length > 0 || controllerFiles.length > 0)) {
    const mvcMatching = Array.from(new Set([...modelFiles, ...componentFiles, ...controllerFiles]));
    const confidence = (modelFiles.length > 0 && componentFiles.length > 0 && controllerFiles.length > 0) ? 90 : 72;

    const mvcGroupings: import('../models/code-visualizer.models').PatternGrouping[] = [];
    if (modelFiles.length > 0) {
      mvcGroupings.push({ name: 'Model', description: 'Data models, entities, and schema definitions', files: modelFiles, colorClass: 'emerald' });
    }
    if (componentFiles.length > 0) {
      mvcGroupings.push({ name: 'View', description: 'UI templates, components, and visual rendering', files: componentFiles, colorClass: 'sky' });
    }
    if (controllerFiles.length > 0) {
      mvcGroupings.push({ name: 'Controller', description: 'Route handlers, API controllers, and request dispatchers', files: controllerFiles, colorClass: 'amber' });
    }

    patterns.push({
      id: 'mvc',
      name: 'Model-View-Controller (MVC)',
      category: 'Architectural Pattern',
      description: 'Separates internal representations of information (Model) from user interaction (View) and business workflow dispatch (Controller/Service).',
      confidence,
      level: confidence > 85 ? 'High' : 'Medium',
      matchingFiles: mvcMatching.slice(0, 8),
      keyIndicators: [
        `Models (${modelFiles.length} file definitions)`,
        `Views (${componentFiles.length} template/UI components)`,
        controllerFiles.length > 0 ? `Controllers (${controllerFiles.length} router/handlers)` : 'Service-driven Controller dispatches'
      ],
      icon: 'layout',
      colorClass: 'emerald',
      logicalGroupings: mvcGroupings,
    });
  }

  // 5. Async Pipeline & Web Worker Task Pattern
  const pipelineFiles = paths.filter(p => {
    const content = fileNodes[p]?.content || '';
    return p.includes('worker') || content.includes('progress') || content.includes('stage') || content.includes('parse');
  });
  if (pipelineFiles.length >= 2) {
    const workerPipeFiles = pipelineFiles.filter(p => p.includes('worker'));
    const orchestrationFiles = pipelineFiles.filter(p => !p.includes('worker'));

    const pipelineGroupings: import('../models/code-visualizer.models').PatternGrouping[] = [];
    if (workerPipeFiles.length > 0) {
      pipelineGroupings.push({ name: 'Worker Threads', description: 'Background worker scripts handling off-thread computation', files: workerPipeFiles, colorClass: 'purple' });
    }
    if (orchestrationFiles.length > 0) {
      pipelineGroupings.push({ name: 'Pipeline Orchestration', description: 'Files coordinating staged data processing, progress tracking, and parsing', files: orchestrationFiles, colorClass: 'indigo' });
    }

    patterns.push({
      id: 'pipeline-worker',
      name: 'Pipeline & Off-Thread Worker Pattern',
      category: 'Execution & Concurrency',
      description: 'Offloads computationally heavy AST analysis and ZIP extraction to multi-threaded Web Workers using staged pipeline processing.',
      confidence: 88,
      level: 'High',
      matchingFiles: pipelineFiles.slice(0, 8),
      keyIndicators: [
        'Non-blocking background thread worker execution',
        'Staged data processing pipeline (Extract → AST Parse → Graph Resolution)',
        'Progress tracking & asynchronous status emission'
      ],
      icon: 'cpu',
      colorClass: 'purple',
      logicalGroupings: pipelineGroupings,
    });
  }

  // 6. Centralized Singleton Store Pattern
  const storeFiles = paths.filter(p => {
    const content = fileNodes[p]?.content || '';
    return content.includes("providedIn: 'root'") || content.includes('VisualizerStoreService') || content.includes('createStore') || content.includes('Store');
  });
  if (storeFiles.length > 0) {
    const storeDefFiles = storeFiles.filter(p => p.includes('/services/') || p.includes('store'));
    const storeConsumers = storeFiles.filter(p => !p.includes('/services/') && !p.includes('store'));

    const storeGroupings: import('../models/code-visualizer.models').PatternGrouping[] = [];
    if (storeDefFiles.length > 0) {
      storeGroupings.push({ name: 'Store Definitions', description: 'Singleton service definitions providing centralized reactive state', files: storeDefFiles, colorClass: 'rose' });
    }
    if (storeConsumers.length > 0) {
      storeGroupings.push({ name: 'Store Consumers', description: 'Components and services that inject and consume shared store state', files: storeConsumers, colorClass: 'sky' });
    }

    patterns.push({
      id: 'singleton-store',
      name: 'Centralized Singleton State Store',
      category: 'State Management',
      description: 'Provides a single source of truth for global application state, active tabs, layout preferences, and analysis results across components.',
      confidence: 94,
      level: 'High',
      matchingFiles: storeFiles.slice(0, 8),
      keyIndicators: [
        'Single source of truth global reactive store',
        'Dependency injected singleton services',
        'Atomic signal state updates'
      ],
      icon: 'database',
      colorClass: 'rose',
      logicalGroupings: storeGroupings,
    });
  }

  return patterns;
}
