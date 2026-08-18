export type FileNodeType = 'file' | 'directory';

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
  astSummary?: {
    totalLines: number;
    importCount: number;
    exportCount: number;
    functionCount?: number;
    classCount?: number;
  };
  children?: CodeFileNode[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'dynamic-import' | 're-export';
  label?: string;
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
}

export interface AnalysisStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  circularDependencies: string[][];
  languageBreakdown: Record<string, number>;
  topImportedFiles: { path: string; count: number }[];
  detectedPatterns: SoftwarePatternInfo[];
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
