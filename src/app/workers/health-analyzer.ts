import {
  CodeFileNode,
  CodeHealthSummary,
  GraphEdge,
  HighComplexityFile,
  StructuralHotspot,
} from '../models/code-visualizer.models';

/**
 * Detects duplicated code chunks (sliding window of normalized lines) across files.
 */
export function detectDuplicateCode(
  fileNodes: Record<string, CodeFileNode>,
  windowSize = 4
): { duplicateBlocksCount: number; duplicateRatio: number } {
  const lineHashes: Record<string, { file: string; lineIndex: number }[]> = {};
  let totalCodeLines = 0;
  const duplicatedLinesSet = new Set<string>();

  for (const [filePath, node] of Object.entries(fileNodes)) {
    if (!node.content || node.type !== 'file') continue;

    // Filter to code lines (ignore whitespace-only lines and pure single-line comments)
    const rawLines = node.content.split('\n');
    const normalizedLines: { normalized: string; originalIndex: number }[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (
        line.length > 0 &&
        !line.startsWith('//') &&
        !line.startsWith('/*') &&
        !line.startsWith('*') &&
        !line.startsWith('#')
      ) {
        // Normalize whitespace and common variable noise
        const norm = line.replace(/\s+/g, ' ');
        normalizedLines.push({ normalized: norm, originalIndex: i });
      }
    }

    totalCodeLines += normalizedLines.length;

    if (normalizedLines.length < windowSize) continue;

    for (let i = 0; i <= normalizedLines.length - windowSize; i++) {
      const chunk = normalizedLines
        .slice(i, i + windowSize)
        .map((l) => l.normalized)
        .join(';;');

      if (!lineHashes[chunk]) {
        lineHashes[chunk] = [];
      }
      lineHashes[chunk].push({ file: filePath, lineIndex: normalizedLines[i].originalIndex });
    }
  }

  let duplicateBlocksCount = 0;

  for (const entries of Object.values(lineHashes)) {
    if (entries.length > 1) {
      duplicateBlocksCount++;
      for (const entry of entries) {
        for (let offset = 0; offset < windowSize; offset++) {
          duplicatedLinesSet.add(`${entry.file}:${entry.lineIndex + offset}`);
        }
      }
    }
  }

  const duplicateRatio =
    totalCodeLines > 0 ? +((duplicatedLinesSet.size / totalCodeLines) * 100).toFixed(1) : 0;

  return {
    duplicateBlocksCount,
    duplicateRatio,
  };
}

/**
 * Computes actionable codebase health metrics, maintainability indexes,
 * complexity ranking, and structural architecture hotspots.
 */
export function analyzeCodeHealth(
  filePaths: string[],
  fileNodes: Record<string, CodeFileNode>,
  edges: GraphEdge[]
): CodeHealthSummary {
  let totalCodeLines = 0;
  let totalCommentLines = 0;
  let totalBlankLines = 0;
  let totalMaintainability = 0;
  let totalComplexity = 0;
  let filesWithMetrics = 0;

  const incomingDepCounts: Record<string, number> = {};
  for (const path of filePaths) {
    incomingDepCounts[path] = 0;
  }
  for (const edge of edges) {
    incomingDepCounts[edge.target] = (incomingDepCounts[edge.target] || 0) + 1;
  }

  const complexityList: HighComplexityFile[] = [];

  for (const path of filePaths) {
    const node = fileNodes[path];
    if (!node || node.type !== 'file') continue;

    const ast = node.astSummary;
    const codeLines = ast?.codeLines ?? (node.content ? node.content.split('\n').length : 0);
    const commentLines = ast?.commentLines ?? 0;
    const blankLines = ast?.blankLines ?? 0;
    const complexity = ast?.cyclomaticComplexity ?? 1;
    const mi = ast?.maintainabilityIndex ?? 100;

    totalCodeLines += codeLines;
    totalCommentLines += commentLines;
    totalBlankLines += blankLines;
    totalMaintainability += mi;
    totalComplexity += complexity;
    filesWithMetrics++;

    complexityList.push({
      path,
      complexity,
      maintainabilityIndex: mi,
      loc: codeLines,
    });
  }

  // Sort highest complexity files descending
  complexityList.sort((a, b) => b.complexity - a.complexity || b.loc - a.loc);
  const highestComplexityFiles = complexityList.slice(0, 10);

  const avgMaintainability =
    filesWithMetrics > 0 ? Math.round(totalMaintainability / filesWithMetrics) : 100;
  const avgComplexity =
    filesWithMetrics > 0 ? +(totalComplexity / filesWithMetrics).toFixed(1) : 1;

  // Identify Structural Hotspots
  // A file is a structural hotspot if:
  // 1. High complexity (>= 15) and moderate-to-high fan-in (incoming dependencies >= 1)
  // 2. High complexity (>= 20)
  // 3. Low maintainability (< 65) with fan-in >= 2
  const structuralHotspots: StructuralHotspot[] = [];

  for (const item of complexityList) {
    const incoming = incomingDepCounts[item.path] || 0;
    let severity: 'High' | 'Medium' | 'Low' | null = null;
    let reason = '';
    let score = 0;

    if (item.complexity >= 25 || (item.complexity >= 15 && incoming >= 3)) {
      severity = 'High';
      reason = `Critical structural bottleneck: Cyclomatic complexity ${item.complexity} with ${incoming} dependent files.`;
      score = item.complexity * 2 + incoming * 3;
    } else if (item.complexity >= 15 || (item.complexity >= 10 && incoming >= 2) || item.maintainabilityIndex < 60) {
      severity = 'Medium';
      reason = `High complexity hotspot: ${item.complexity} decision branches and ${incoming} incoming dependencies (MI: ${item.maintainabilityIndex}).`;
      score = item.complexity * 1.5 + incoming * 2;
    } else if (item.complexity >= 10 || item.maintainabilityIndex < 70) {
      severity = 'Low';
      reason = `Moderate branching complexity (${item.complexity}) with maintainability index of ${item.maintainabilityIndex}.`;
      score = item.complexity + incoming;
    }

    if (severity) {
      structuralHotspots.push({
        path: item.path,
        reason,
        severity,
        score: Math.round(score),
        complexity: item.complexity,
        incomingDeps: incoming,
      });
    }
  }

  structuralHotspots.sort((a, b) => b.score - a.score);

  // Detect duplicate code
  const { duplicateBlocksCount, duplicateRatio } = detectDuplicateCode(fileNodes);

  // Overall Health Score (0-100)
  // Combines maintainability index (50%), complexity penalty (25%), duplicate penalty (15%), and hotspot count (10%)
  const complexityPenalty = Math.min(30, (avgComplexity - 1) * 3);
  const duplicatePenalty = Math.min(20, duplicateRatio * 1.5);
  const hotspotPenalty = Math.min(20, structuralHotspots.filter((h) => h.severity === 'High').length * 5);

  const rawHealth = avgMaintainability - complexityPenalty - duplicatePenalty - hotspotPenalty;
  const overallHealthScore = Math.max(0, Math.min(100, Math.round(rawHealth)));

  return {
    averageMaintainabilityIndex: avgMaintainability,
    overallHealthScore,
    totalCodeLines,
    totalCommentLines,
    totalBlankLines,
    averageCyclomaticComplexity: avgComplexity,
    highestComplexityFiles,
    structuralHotspots: structuralHotspots.slice(0, 10),
    duplicateBlocksCount,
    duplicateRatio,
  };
}
