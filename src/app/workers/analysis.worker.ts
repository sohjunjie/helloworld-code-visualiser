import { AnalysisResult, CodeFileNode, UploadProgress } from '../models/code-visualizer.models';
import { extractZipEntries, getBasename, getFileExtension } from './zip-extractor';
import { parseFileContents } from './ast-parser';
import { buildDependencyEdges, buildDirectoryTree, calculateStats } from './graph-builder';
import { findCircularDependencies } from './cycle-detector';
import { detectSoftwarePatterns } from './pattern-detector';

function isWorkerContext(): boolean {
  return typeof postMessage === 'function' && typeof window === 'undefined';
}

// Worker Message Handler for Web Worker execution context
if (isWorkerContext() && typeof addEventListener === 'function') {
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
}

export function reportProgress(
  stage: UploadProgress['stage'],
  percentage: number,
  message: string,
  onProgress?: (progress: UploadProgress) => void
) {
  const progress: UploadProgress = {
    stage,
    percentage,
    message,
  };

  if (onProgress) {
    onProgress(progress);
  }

  if (isWorkerContext()) {
    postMessage({
      type: 'PROGRESS',
      progress,
    });
  }
}

export async function processZipFile(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<AnalysisResult> {
  reportProgress('unzipping', 10, 'Extracting ZIP archive contents...', onProgress);

  const rawFiles = await extractZipEntries(arrayBuffer, (processed, total) => {
    const pct = 10 + Math.floor((processed / total) * 30);
    reportProgress('unzipping', pct, `Extracted ${processed}/${total} files...`, onProgress);
  });

  const projectName = fileName.replace(/\.zip$/i, '');
  return buildAndParseGraph(rawFiles, projectName, onProgress);
}

export async function processDemoFiles(
  files: Record<string, { content: string }>,
  projectName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<AnalysisResult> {
  reportProgress('unzipping', 30, 'Loading demo project files...', onProgress);
  const rawFiles: Record<string, string> = {};
  for (const [path, obj] of Object.entries(files)) {
    rawFiles[path] = obj.content;
  }
  return buildAndParseGraph(rawFiles, projectName, onProgress);
}

export async function buildAndParseGraph(
  rawFiles: Record<string, string>,
  projectName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<AnalysisResult> {
  reportProgress('parsing', 45, 'Parsing AST and module dependencies...', onProgress);

  const fileNodes: Record<string, CodeFileNode> = {};
  const filePaths = Object.keys(rawFiles);
  let parsedCount = 0;

  // 1. Build File Nodes & Extract Imports/Exports via AST Parser
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
      size: typeof Blob !== 'undefined' ? new Blob([content]).size : Buffer.from(content).length,
      extension: ext,
      content,
      imports,
      exports,
      astSummary,
    };

    if (parsedCount % 15 === 0 || parsedCount === filePaths.length) {
      const pct = 45 + Math.floor((parsedCount / filePaths.length) * 35);
      reportProgress('parsing', pct, `Parsed ${parsedCount}/${filePaths.length} source files...`, onProgress);
    }
  }

  reportProgress('graph-building', 85, 'Connecting module edges & resolving cycles...', onProgress);

  // 2. Resolve Module Import Edges and Adjacency List
  const { edges, adjacencyList } = buildDependencyEdges(filePaths, fileNodes);

  // 3. Find Circular Dependencies using DFS
  const cycles = findCircularDependencies(filePaths, adjacencyList);

  // 4. Build Directory Tree Structure
  const rootNode = buildDirectoryTree(fileNodes, projectName);

  // 5. Detect Software Patterns
  const detectedPatterns = detectSoftwarePatterns(fileNodes, filePaths.length);

  // 6. Calculate Stats
  const stats = calculateStats(
    filePaths,
    fileNodes,
    edges,
    rootNode,
    cycles,
    detectedPatterns
  );

  const result: AnalysisResult = {
    projectName,
    rootNode,
    files: fileNodes,
    edges,
    stats,
  };

  reportProgress('complete', 100, 'Analysis complete!', onProgress);

  if (isWorkerContext()) {
    postMessage({
      type: 'RESULT',
      result,
    });
  }

  return result;
}
