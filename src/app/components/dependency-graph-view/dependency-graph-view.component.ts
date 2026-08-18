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
  templateUrl: './dependency-graph-view.component.html',
  styleUrl: './dependency-graph-view.component.css',
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
