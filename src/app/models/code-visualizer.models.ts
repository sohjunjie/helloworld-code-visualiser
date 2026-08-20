export type FileNodeType = 'file' | 'directory';

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  totalLines: number;
  codeLines: number;
  blankLines: number;
  commentLines: number;
  commentRatio: number;
}

export interface AstSummary extends ComplexityMetrics {
  importCount: number;
  exportCount: number;
  functionCount?: number;
  classCount?: number;
}

export interface CodeFileNode {
  id: string;
  path: string;
  name: string;
  type: FileNodeType;
  size: number;
  extension: string;
  content?: string;
  imports: string[];
  exports: string[];
  astSummary?: AstSummary;
  children?: CodeFileNode[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'dynamic-import' | 're-export';
  label?: string;
}

export interface PatternGrouping {
  name: string;
  description: string;
  files: string[];
  colorClass: string;
}

export interface SoftwarePatternInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  confidence: number;
  level: 'High' | 'Medium' | 'Low';
  matchingFiles: string[];
  keyIndicators: string[];
  icon: string;
  colorClass: string;
  logicalGroupings: PatternGrouping[];
}

export interface HighComplexityFile {
  path: string;
  complexity: number;
  maintainabilityIndex: number;
  loc: number;
}

export interface StructuralHotspot {
  path: string;
  reason: string;
  severity: 'High' | 'Medium' | 'Low';
  score: number;
  complexity: number;
  incomingDeps: number;
}

export interface CodeHealthSummary {
  averageMaintainabilityIndex: number;
  overallHealthScore: number;
  totalCodeLines: number;
  totalCommentLines: number;
  totalBlankLines: number;
  averageCyclomaticComplexity: number;
  highestComplexityFiles: HighComplexityFile[];
  structuralHotspots: StructuralHotspot[];
  duplicateBlocksCount: number;
  duplicateRatio: number;
}

export interface AnalysisStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  circularDependencies: string[][];
  languageBreakdown: Record<string, number>;
  topImportedFiles: { path: string; count: number }[];
  detectedPatterns: SoftwarePatternInfo[];
  codeHealth?: CodeHealthSummary;
}

export interface AnalysisResult {
  projectName: string;
  rootNode: CodeFileNode;
  files: Record<string, CodeFileNode>;
  edges: GraphEdge[];
  stats: AnalysisStats;
}

export interface UploadProgress {
  stage: 'unzipping' | 'parsing' | 'graph-building' | 'complete' | 'error';
  percentage: number;
  message: string;
  error?: string;
}

export interface DemoProject {
  id: string;
  name: string;
  description: string;
  filename: string;
  fileCount: number;
}
