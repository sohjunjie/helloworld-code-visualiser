import { Injectable, signal, inject } from '@angular/core';
import { AnalysisResult, CodeFileNode, UploadProgress, DemoProject, SoftwarePatternInfo } from '../models/code-visualizer.models';
import { ThemeService } from './theme.service';

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
  readonly isDarkMode: ThemeService['isDarkMode'];
  readonly selectedPattern = signal<SoftwarePatternInfo | null>(null);

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
  }
}
