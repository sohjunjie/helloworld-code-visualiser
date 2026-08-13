import { Component, ElementRef, ViewChild, inject, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';
import { CodeFileNode } from '../../models/code-visualizer.models';

try {
  cytoscape.use(dagre);
} catch {
  // Prevent duplicate registration
}

@Component({
  selector: 'app-dependency-graph-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col p-4 space-y-4 animate-fade-in">
      <!-- Toolbar -->
      <div class="glass-panel p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-700/60 shadow-xl">
        <!-- Search & Filter Controls -->
        <div class="flex items-center space-x-3">
          <div class="relative">
            <input
              type="text"
              placeholder="Search files..."
              [ngModel]="store.searchQuery()"
              (ngModelChange)="onSearchChange($event)"
              class="w-52 px-3 py-1.5 pl-8 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Layout Switcher Buttons -->
          <div class="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              (click)="setLayout('dagre')"
              [class]="store.selectedLayout() === 'dagre' ? 'bg-sky-500/20 text-sky-300 font-semibold border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'"
              class="px-3 py-1 text-xs rounded-lg transition-all border active:scale-95 cursor-pointer"
            >
              Hierarchical
            </button>
            <button
              (click)="setLayout('cose')"
              [class]="store.selectedLayout() === 'cose' ? 'bg-sky-500/20 text-sky-300 font-semibold border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'"
              class="px-3 py-1 text-xs rounded-lg transition-all border active:scale-95 cursor-pointer"
            >
              Force (COSE)
            </button>
            <button
              (click)="setLayout('concentric')"
              [class]="store.selectedLayout() === 'concentric' ? 'bg-sky-500/20 text-sky-300 font-semibold border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'"
              class="px-3 py-1 text-xs rounded-lg transition-all border active:scale-95 cursor-pointer"
            >
              Concentric
            </button>
          </div>
        </div>

        <!-- Export Diagram Snapshot Button -->
        <button
          (click)="exportDiagram()"
          class="btn-interactive btn-secondary px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center space-x-1.5"
        >
          <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Export Canvas PNG</span>
        </button>
      </div>

      <!-- Graph Canvas Container -->
      <div class="flex-1 glass-card rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl" #cyContainer>
        <div class="w-full h-full" #cyElement></div>

        <!-- Floating Legend Overlay -->
        <div class="absolute bottom-4 left-4 glass-panel p-3 rounded-2xl border border-slate-700/80 text-xs space-y-1.5 z-20 shadow-xl">
          <div class="font-bold text-slate-200 flex items-center space-x-1.5">
            <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Dependency Graph Legend</span>
          </div>
          <div class="flex items-center space-x-3 text-slate-400 text-[11px]">
            <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span><span>File Node</span></span>
            <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span><span>Circular Cycle</span></span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DependencyGraphViewComponent implements AfterViewInit {
  readonly store = inject(VisualizerStoreService);
  readonly demoService = inject(ExportDemoService);

  @ViewChild('cyElement') cyRef!: ElementRef<HTMLDivElement>;

  private cyInstance: cytoscape.Core | null = null;

  constructor() {
    effect(() => {
      const res = this.store.analysisResult();
      const layout = this.store.selectedLayout();
      const query = this.store.searchQuery();
      if (res && this.cyRef) {
        this.renderGraph();
      }
    });
  }

  ngAfterViewInit() {
    this.renderGraph();
  }

  onSearchChange(query: string) {
    this.store.setSearchQuery(query);
  }

  setLayout(layout: 'dagre' | 'cose' | 'concentric') {
    this.store.setLayout(layout);
  }

  exportDiagram() {
    if (this.cyInstance) {
      const canvas = this.cyRef.nativeElement.querySelector('canvas');
      if (canvas) {
        this.demoService.downloadCanvasPNG(canvas, 'dependency-graph.png');
      }
    }
  }

  private renderGraph() {
    const result = this.store.analysisResult();
    if (!result || !this.cyRef) return;

    const elements: cytoscape.ElementDefinition[] = [];
    const query = (this.store.searchQuery() || '').toLowerCase();

    // Collect set of cycle file paths for styling
    const cycleNodes = new Set<string>();
    for (const cycle of result.stats.circularDependencies) {
      for (const path of cycle) {
        cycleNodes.add(path);
      }
    }

    // Add Nodes
    for (const [path, node] of Object.entries(result.files)) {
      const matchesSearch = !query || path.toLowerCase().includes(query);
      elements.push({
        data: {
          id: path,
          label: node.name,
          extension: node.extension,
          isCycle: cycleNodes.has(path),
          matchesSearch,
        },
      });
    }

    // Add Edges
    for (const edge of result.edges) {
      elements.push({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
        },
      });
    }

    if (this.cyInstance) {
      this.cyInstance.destroy();
    }

    const layoutName = this.store.selectedLayout();

    this.cyInstance = cytoscape({
      container: this.cyRef.nativeElement,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#38bdf8',
            label: 'data(label)',
            color: '#f8fafc',
            'font-size': '11px',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            width: 24,
            height: 24,
            'border-width': 2,
            'border-color': '#0284c7',
          },
        },
        {
          selector: 'node[?isCycle]',
          style: {
            'background-color': '#f87171',
            'border-color': '#dc2626',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.6,
          },
        },
        {
          selector: ':selected',
          style: {
            'background-color': '#a855f7',
            'border-color': '#9333ea',
            width: 32,
            height: 32,
          },
        },
      ],
      layout: {
        name: layoutName === 'dagre' ? 'dagre' : layoutName,
        animate: true,
        animationDuration: 400,
        nodeDimensionsIncludeLabels: true,
      } as any,
    });

    this.cyInstance.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      const node = result.files[nodeData.id];
      if (node) {
        this.store.selectNode(node);
        this.store.setActiveTab('inspector');
      }
    });
  }
}
