import { Injectable, signal, computed, inject } from '@angular/core';
import {
  AnalysisResult,
  CodeFileNode,
  UploadProgress,
  DemoProject,
  SoftwarePatternInfo,
  BreadcrumbItem,
} from '../models/code-visualizer.models';
import { ThemeService } from './theme.service';
import { getBreadcrumbsForPath } from '../utils/graph-aggregator';

@Injectable({
  providedIn: 'root',
})
export class VisualizerStoreService {
  readonly themeService: ThemeService;

  readonly analysisResult = signal<AnalysisResult | null>(null);
  readonly progressStatus = signal<UploadProgress | null>(null);
  readonly selectedNode = signal<CodeFileNode | null>(null);
  readonly activeTab = signal<'treemap' | 'graph' | 'architecture' | 'inspector'>('treemap');
  readonly selectedLayout = signal<'dagre' | 'cose' | 'concentric'>('dagre');
  readonly searchQuery = signal<string>('');
  readonly extensionFilter = signal<string>('all');
  readonly graphDirectoryFilter = signal<string>('all');
  readonly graphExtensionFilter = signal<string>('all');
  readonly neighborhoodFocusNodeId = signal<string | null>(null);
  readonly graphAbstractionMode = signal<'file' | 'directory'>('file');
  readonly graphDrillDownPath = signal<string | null>(null);
  readonly isDarkMode: ThemeService['isDarkMode'];
  readonly selectedPattern = signal<SoftwarePatternInfo | null>(null);

  readonly drillDownBreadcrumbs = computed<BreadcrumbItem[]>(() => {
    return getBreadcrumbsForPath(this.graphDrillDownPath());
  });


  readonly availableDirectories = computed<string[]>(() => {
    const result = this.analysisResult();
    if (!result || !result.files) return [];
    const dirSet = new Set<string>();
    for (const filePath of Object.keys(result.files)) {
      const parts = filePath.split('/');
      if (parts.length > 1) {
        // Collect all parent directory paths
        let currentPath = '';
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
          dirSet.add(currentPath);
        }
      }
    }
    return Array.from(dirSet).sort();
  });

  readonly availableExtensions = computed<{ extension: string; count: number }[]>(() => {
    const result = this.analysisResult();
    if (!result || !result.files) return [];
    const extCounts: Record<string, number> = {};
    for (const node of Object.values(result.files)) {
      const ext = node.extension || 'other';
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    }
    return Object.entries(extCounts)
      .map(([extension, count]) => ({ extension, count }))
      .sort((a, b) => b.count - a.count || a.extension.localeCompare(b.extension));
  });

  readonly hasActiveFilters = computed<boolean>(() => {
    return (
      this.searchQuery().trim().length > 0 ||
      this.graphDirectoryFilter() !== 'all' ||
      this.graphExtensionFilter() !== 'all' ||
      this.neighborhoodFocusNodeId() !== null
    );
  });

  readonly activeFilterCount = computed<number>(() => {
    let count = 0;
    if (this.searchQuery().trim().length > 0) count++;
    if (this.graphDirectoryFilter() !== 'all') count++;
    if (this.graphExtensionFilter() !== 'all') count++;
    if (this.neighborhoodFocusNodeId() !== null) count++;
    return count;
  });

  private worker: Worker | null = null;

  constructor(themeService?: ThemeService) {
    if (themeService) {
      this.themeService = themeService;
    } else {
      let injected: ThemeService | null = null;
      try {
        injected = inject(ThemeService, { optional: true });
      } catch {
        injected = null;
      }
      this.themeService = injected ?? new ThemeService();
    }
    this.isDarkMode = this.themeService.isDarkMode;
    this.initWorker();
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../workers/analysis.worker', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = ({ data }) => {
        if (data.type === 'PROGRESS') {
          this.progressStatus.set(data.progress);
        } else if (data.type === 'RESULT') {
          this.analysisResult.set(data.result);
          this.progressStatus.set(null);
          if (data.result.files) {
            const firstFile = Object.values(data.result.files)[0];
            if (firstFile) this.selectedNode.set(firstFile as CodeFileNode);
          }
        }
      };
    }
  }

  analyzeZipFile(file: File) {
    if (!this.worker) this.initWorker();
    if (!this.worker) return;

    this.progressStatus.set({
      stage: 'unzipping',
      percentage: 5,
      message: 'Reading ZIP file...',
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      this.worker?.postMessage({
        action: 'ANALYZE_ZIP',
        payload: { arrayBuffer: buffer, fileName: file.name },
      });
    };
    reader.readAsArrayBuffer(file);
  }

  async analyzeDemoProject(demo: DemoProject) {
    if (!this.worker) this.initWorker();
    if (!this.worker) return;

    this.progressStatus.set({
      stage: 'unzipping',
      percentage: 10,
      message: `Fetching demo archive ${demo.name}...`,
    });

    try {
      const response = await fetch(`demo-projects/${demo.filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      this.progressStatus.set({
        stage: 'unzipping',
        percentage: 25,
        message: `Extracting demo codebase: ${demo.name}...`,
      });

      this.worker.postMessage({
        action: 'ANALYZE_ZIP',
        payload: { arrayBuffer, fileName: demo.filename },
      });
    } catch (err: any) {
      this.progressStatus.set({
        stage: 'error',
        percentage: 0,
        message: 'Failed to download demo project zip',
        error: err?.message || 'Unknown network error',
      });
    }
  }

  selectNode(node: CodeFileNode | null) {
    this.selectedNode.set(node);
  }

  setActiveTab(tab: 'treemap' | 'graph' | 'architecture' | 'inspector') {
    this.activeTab.set(tab);
  }

  setLayout(layout: 'dagre' | 'cose' | 'concentric') {
    this.selectedLayout.set(layout);
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  setExtensionFilter(ext: string) {
    this.extensionFilter.set(ext);
  }

  setGraphDirectoryFilter(dir: string) {
    this.graphDirectoryFilter.set(dir);
  }

  setGraphExtensionFilter(ext: string) {
    this.graphExtensionFilter.set(ext);
  }

  setNeighborhoodFocus(nodeId: string | null) {
    this.neighborhoodFocusNodeId.set(nodeId);
  }

  setGraphAbstractionMode(mode: 'file' | 'directory') {
    this.graphAbstractionMode.set(mode);
  }

  setGraphDrillDownPath(path: string | null) {
    this.graphDrillDownPath.set(path);
    if (path) {
      this.graphAbstractionMode.set('directory');
    }
  }

  drillDown(dirPath: string) {
    this.graphDrillDownPath.set(dirPath);
    this.graphAbstractionMode.set('directory');
  }

  drillUp() {
    const current = this.graphDrillDownPath();
    if (!current) return;
    const parts = current.split('/');
    if (parts.length <= 1) {
      this.graphDrillDownPath.set(null);
    } else {
      this.graphDrillDownPath.set(parts.slice(0, parts.length - 1).join('/'));
    }
  }

  drillTo(path: string | null) {
    this.graphDrillDownPath.set(path);
    if (path) {
      this.graphAbstractionMode.set('directory');
    }
  }

  resetDrillDown() {
    this.graphDrillDownPath.set(null);
  }

  clearGraphFilters() {
    this.searchQuery.set('');
    this.graphDirectoryFilter.set('all');
    this.graphExtensionFilter.set('all');
    this.neighborhoodFocusNodeId.set(null);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  setDarkMode(isDark: boolean) {
    this.themeService.setDarkMode(isDark);
  }

  selectPattern(pattern: SoftwarePatternInfo | null) {
    this.selectedPattern.set(pattern);
  }

  clearResult() {
    this.analysisResult.set(null);
    this.selectedNode.set(null);
    this.selectedPattern.set(null);
    this.progressStatus.set(null);
    this.clearGraphFilters();
    this.resetDrillDown();
    this.graphAbstractionMode.set('file');
  }
}

