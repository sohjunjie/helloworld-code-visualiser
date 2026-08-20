import { Component, ElementRef, ViewChild, inject, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ThemeService } from '../../services/theme.service';
import { ExportDemoService } from '../../services/export-demo.service';
import { exportCytoscapeToSvg } from '../../utils/svg-exporter';
import { computeAggregatedGraph } from '../../utils/graph-aggregator';
import { CodeFileNode } from '../../models/code-visualizer.models';
import { formatBytes } from '../../utils/formatters';

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
export class DependencyGraphViewComponent implements AfterViewInit, OnDestroy {
  readonly store = inject(VisualizerStoreService);
  readonly themeService = inject(ThemeService);
  readonly demoService = inject(ExportDemoService);

  @ViewChild('cyElement') cyRef!: ElementRef<HTMLDivElement>;

  private cyInstance: cytoscape.Core | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    try {
      // Re-render entire graph on structural changes (dataset, layout, theme, abstraction mode, drill-down path)
      effect(() => {
        const res = this.store.analysisResult();
        const layout = this.store.selectedLayout();
        const mode = this.store.graphAbstractionMode();
        const drillPath = this.store.graphDrillDownPath();
        const isDark = this.themeService.isDarkMode();
        if (res && this.cyRef) {
          this.renderGraph();
        }
      });

      // Smoothly update filters without tearing down graph layout
      effect(() => {
        const query = this.store.searchQuery();
        const dirFilter = this.store.graphDirectoryFilter();
        const extFilter = this.store.graphExtensionFilter();
        const focusNode = this.store.neighborhoodFocusNodeId();
        if (this.cyInstance) {
          this.applyGraphFilters();
        }
      });
    } catch {
      // In headless test environments without ChangeDetectionScheduler
    }
  }


  ngAfterViewInit() {
    this.renderGraph();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.cyInstance) {
      this.cyInstance.destroy();
      this.cyInstance = null;
    }
  }

  onSearchChange(query: string) {
    this.store.setSearchQuery(query);
  }

  onDirectoryChange(dir: string) {
    this.store.setGraphDirectoryFilter(dir);
  }

  onExtensionChange(ext: string) {
    this.store.setGraphExtensionFilter(ext);
  }

  setLayout(layout: 'dagre' | 'cose' | 'concentric') {
    this.store.setLayout(layout);
  }

  setAbstractionMode(mode: 'file' | 'directory') {
    this.store.setGraphAbstractionMode(mode);
  }

  onDrillDown(dirPath: string) {
    this.store.drillDown(dirPath);
  }

  onDrillUp() {
    this.store.drillUp();
  }

  onDrillTo(path: string | null) {
    this.store.drillTo(path);
  }

  onResetDrillDown() {
    this.store.resetDrillDown();
  }

  formatBytes(bytes: number): string {
    return formatBytes(bytes);
  }

  toggleNeighborhoodFocus(nodeId: string | null) {
    if (!nodeId || this.store.neighborhoodFocusNodeId() === nodeId) {
      this.store.setNeighborhoodFocus(null);
    } else {
      this.store.setNeighborhoodFocus(nodeId);
    }
  }

  clearAllFilters() {
    this.store.clearGraphFilters();
  }

  exportDiagram() {
    if (this.cyInstance) {
      const { exportBg } = this.themeService.getGraphThemeConfig();
      try {
        const pngUri = this.cyInstance.png({ full: true, bg: exportBg, scale: 2 });
        const a = document.createElement('a');
        a.href = pngUri;
        a.download = `${this.store.analysisResult()?.projectName || 'dependency-graph'}.png`;
        a.click();
      } catch {
        const canvas = this.cyRef.nativeElement.querySelector('canvas');
        if (canvas) {
          this.demoService.downloadCanvasPNG(canvas, `${this.store.analysisResult()?.projectName || 'dependency-graph'}.png`);
        }
      }
    }
  }

  exportSvgDiagram() {
    if (this.cyInstance) {
      const themeConfig = this.themeService.getGraphThemeConfig();
      const svgString = exportCytoscapeToSvg(this.cyInstance, themeConfig);
      this.demoService.downloadSVG(
        svgString,
        `${this.store.analysisResult()?.projectName || 'dependency-graph'}.svg`
      );
    }
  }

  getNodeDisplayName(nodeId: string | null): string {
    if (!nodeId) return '';
    const files = this.store.analysisResult()?.files;
    if (files && files[nodeId]) {
      return files[nodeId].name;
    }
    const parts = nodeId.split('/');
    return parts[parts.length - 1] || nodeId;
  }

  applyGraphFilters() {
    if (!this.cyInstance) return;

    const query = (this.store.searchQuery() || '').trim().toLowerCase();
    const dirFilter = this.store.graphDirectoryFilter();
    const extFilter = this.store.graphExtensionFilter();
    const focusNodeId = this.store.neighborhoodFocusNodeId();

    const hasSearch = query.length > 0;
    const hasDir = dirFilter !== 'all';
    const hasExt = extFilter !== 'all';
    const hasFocus = focusNodeId !== null;

    this.cyInstance.batch(() => {
      const nodes = this.cyInstance!.nodes();
      const edges = this.cyInstance!.edges();

      // First pass: compute base criteria match for each node
      const matchMap = new Map<string, boolean>();
      for (const node of nodes) {
        const id = node.id();
        const label = (node.data('label') || '').toLowerCase();
        const extension = (node.data('extension') || '').toLowerCase();

        let matches = true;
        if (hasSearch) {
          matches = matches && (id.toLowerCase().includes(query) || label.includes(query));
        }
        if (hasDir) {
          matches = matches && (id === dirFilter || id.startsWith(dirFilter + '/'));
        }
        if (hasExt) {
          matches = matches && extension === extFilter.toLowerCase();
        }
        matchMap.set(id, matches);
      }

      // If neighborhood focus mode is active, identify 1-hop upstream and downstream neighbors
      const neighborIds = new Set<string>();
      if (hasFocus && focusNodeId) {
        neighborIds.add(focusNodeId);
        for (const edge of edges) {
          const srcId = edge.data('source');
          const tgtId = edge.data('target');
          if (srcId === focusNodeId) {
            neighborIds.add(tgtId);
          }
          if (tgtId === focusNodeId) {
            neighborIds.add(srcId);
          }
        }
      }

      // Apply classes to nodes
      for (const node of nodes) {
        const id = node.id();
        const matchesBase = matchMap.get(id) ?? true;
        const isNeighbor = neighborIds.has(id);

        node.removeClass('filtered-out');
        node.removeClass('dimmed');
        node.removeClass('focused');
        node.removeClass('focused-neighbor');

        if (hasFocus) {
          if (id === focusNodeId) {
            node.addClass('focused');
          } else if (isNeighbor) {
            node.addClass('focused-neighbor');
          } else if (!matchesBase) {
            node.addClass('filtered-out');
          } else {
            node.addClass('dimmed');
          }
        } else {
          if (!matchesBase) {
            node.addClass('filtered-out');
          }
        }
      }

      // Apply classes to edges
      for (const edge of edges) {
        const srcId = edge.data('source');
        const tgtId = edge.data('target');
        const srcMatches = matchMap.get(srcId) ?? true;
        const tgtMatches = matchMap.get(tgtId) ?? true;
        const srcIsNeighbor = neighborIds.has(srcId);
        const tgtIsNeighbor = neighborIds.has(tgtId);

        edge.removeClass('filtered-out');
        edge.removeClass('dimmed');
        edge.removeClass('focused-edge');

        if (hasFocus) {
          if (srcIsNeighbor && tgtIsNeighbor && (srcId === focusNodeId || tgtId === focusNodeId)) {
            edge.addClass('focused-edge');
          } else if (!srcMatches || !tgtMatches) {
            edge.addClass('filtered-out');
          } else {
            edge.addClass('dimmed');
          }
        } else {
          if (!srcMatches || !tgtMatches) {
            edge.addClass('filtered-out');
          }
        }
      }
    });
  }

  private setupResizeObserver() {
    if (this.cyRef?.nativeElement && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.cyInstance) {
          this.cyInstance.resize();
          this.cyInstance.fit();
        }
      });
      this.resizeObserver.observe(this.cyRef.nativeElement);
    }
  }

  private renderGraph() {
    const result = this.store.analysisResult();
    if (!result || !this.cyRef) return;

    // Ensure DOM container has rendered dimensions
    setTimeout(() => {
      if (!this.cyRef?.nativeElement) return;

      const elements: cytoscape.ElementDefinition[] = [];
      const mode = this.store.graphAbstractionMode();
      const themeConfig = this.themeService.getGraphThemeConfig();

      if (mode === 'directory') {
        // Directory Abstraction & Drill-down Mode
        const drillPath = this.store.graphDrillDownPath();
        const aggregated = computeAggregatedGraph(
          result.files,
          result.edges,
          drillPath,
          {
            circularDependencies: result.stats.circularDependencies,
            includeExternalBoundaries: true,
          }
        );

        for (const node of aggregated.nodes) {
          let nodeColors;
          let labelText = node.name;

          if (node.type === 'directory') {
            nodeColors = this.themeService.getDirectoryNodeColorConfig(
              node.isCycle,
              node.isExternalBoundary
            );
            labelText = `📁 ${node.name} (${node.fileCount})`;
          } else if (node.isExternalBoundary) {
            nodeColors = this.themeService.getDirectoryNodeColorConfig(
              node.isCycle,
              true
            );
            labelText = `🌐 ${node.name}`;
          } else {
            nodeColors = this.themeService.getNodeColorConfig(node.extension, node.isCycle);
            labelText = `📄 ${node.name}`;
          }

          elements.push({
            data: {
              id: node.id,
              label: labelText,
              name: node.name,
              path: node.path,
              type: node.type,
              fileCount: node.fileCount,
              size: node.size,
              extension: node.extension,
              isCycle: node.isCycle,
              isExternalBoundary: node.isExternalBoundary,
              color: nodeColors.bg,
              borderColor: nodeColors.border,
              textColor: nodeColors.text,
            },
          });
        }

        for (const edge of aggregated.edges) {
          elements.push({
            data: {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              weight: edge.weight,
              label: edge.label,
              isExternal: edge.isExternal,
            },
          });
        }
      } else {
        // File Level Detailed Mode
        const cycleNodes = new Set<string>();
        for (const cycle of result.stats.circularDependencies) {
          for (const path of cycle) {
            cycleNodes.add(path);
          }
        }

        for (const [path, node] of Object.entries(result.files)) {
          const isCycle = cycleNodes.has(path);
          const nodeColors = this.themeService.getNodeColorConfig(node.extension, isCycle);
          elements.push({
            data: {
              id: path,
              label: node.name,
              name: node.name,
              path: node.path,
              type: node.type,
              fileCount: 1,
              size: node.size,
              extension: node.extension,
              isCycle,
              isExternalBoundary: false,
              color: nodeColors.bg,
              borderColor: nodeColors.border,
              textColor: nodeColors.text,
            },
          });
        }

        for (const edge of result.edges) {
          elements.push({
            data: {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              weight: 1,
              label: '',
              isExternal: false,
            },
          });
        }
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
              shape: 'round-rectangle',
              'corner-radius': '8px',
              'background-color': 'data(color)',
              'background-opacity': 0.95,
              label: 'data(label)',
              color: 'data(textColor)',
              'text-valign': 'center',
              'text-halign': 'center',
              'text-margin-y': 0,
              'font-size': '11.5px',
              'font-weight': 600,
              'font-family': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              width: 'label',
              height: 34,
              padding: '14px',
              'border-width': 1.5,
              'border-color': 'data(borderColor)',
              'border-opacity': 0.95,
              'transition-property': 'background-color, border-color, border-width, width, height, opacity',
              'transition-duration': 200,
            },
          },
          {
            selector: 'node[?isExternalBoundary]',
            style: {
              'border-style': 'dashed',
              'border-opacity': 0.85,
              'background-opacity': 0.8,
            },
          },
          {
            selector: 'node[?isCycle]',
            style: {
              'background-color': themeConfig.cycleNodeBg,
              'border-color': themeConfig.cycleNodeBorder,
              color: themeConfig.cycleNodeText,
              'border-width': 2.5,
            },
          },
          {
            selector: 'node.dimmed',
            style: {
              opacity: 0.12,
            },
          },
          {
            selector: 'node.focused',
            style: {
              'background-color': themeConfig.focusedNodeBg,
              'border-color': themeConfig.focusedNodeBorder,
              color: themeConfig.focusedNodeText,
              'border-width': 2.5,
              'border-opacity': 1.0,
              height: 38,
              padding: '18px',
              'z-index': 99,
            },
          },
          {
            selector: 'node.focused-neighbor',
            style: {
              'background-color': themeConfig.focusedNeighborBg,
              'border-color': themeConfig.focusedNeighborBorder,
              color: themeConfig.focusedNeighborText,
              'border-width': 2,
              'border-opacity': 1.0,
              'z-index': 50,
            },
          },
          {
            selector: 'node.filtered-out',
            style: {
              display: 'none',
            },
          },
          {
            selector: 'edge',
            style: {
              width: (e: any) => {
                const w = e.data('weight') || 1;
                return w > 1 ? Math.min(6.5, 1.5 + Math.log2(w + 1) * 1.2) : 1.5;
              },
              label: (e: any) => e.data('label') || '',
              'font-size': '9.5px',
              'font-weight': 600,
              'font-family': 'ui-sans-serif, system-ui, sans-serif',
              color: themeConfig.nodeLabelColor,
              'text-rotation': 'autorotate',
              'text-margin-y': -8,
              'text-background-opacity': 0.85,
              'text-background-color': themeConfig.exportBg,
              'text-background-padding': '2px',
              'text-background-shape': 'roundrectangle',
              'line-color': themeConfig.edgeLineColor,
              'target-arrow-color': themeConfig.edgeArrowColor,
              'target-arrow-shape': 'triangle',
              'arrow-scale': 0.9,
              'curve-style': 'bezier',
              opacity: 0.75,
              'transition-property': 'line-color, target-arrow-color, width, opacity',
              'transition-duration': 200,
            },
          },
          {
            selector: 'edge[?isExternal]',
            style: {
              'line-style': 'dashed',
              'line-dash-pattern': [6, 4],
              opacity: 0.6,
            },
          },
          {
            selector: 'edge.dimmed',
            style: {
              opacity: 0.06,
            },
          },
          {
            selector: 'edge.focused-edge',
            style: {
              width: 2.5,
              'line-color': themeConfig.focusedEdgeColor,
              'target-arrow-color': themeConfig.focusedEdgeArrowColor || themeConfig.focusedEdgeColor,
              opacity: 1.0,
              'arrow-scale': 1.0,
              'z-index': 40,
            },
          },
          {
            selector: 'edge.filtered-out',
            style: {
              display: 'none',
            },
          },
          {
            selector: ':selected',
            style: {
              'background-color': themeConfig.focusedNodeBg,
              'border-color': themeConfig.focusedNodeBorder,
              color: themeConfig.focusedNodeText,
              'border-width': 2.5,
            },
          },
        ],
        layout: {
          name: layoutName === 'dagre' ? 'dagre' : layoutName,
          animate: true,
          animationDuration: 350,
          nodeDimensionsIncludeLabels: true,
          rankDir: 'TB',
          nodeSep: 45,
          rankSep: 65,
          padding: 40,
        } as any,
      });

      this.cyInstance.ready(() => {
        this.cyInstance?.resize();
        this.cyInstance?.fit();
        this.applyGraphFilters();
      });

      // Handle single tap for selection
      this.cyInstance.on('tap', 'node', (evt) => {
        const nodeData = evt.target.data();
        if (nodeData.type === 'directory') {
          const dirNode: CodeFileNode = {
            id: nodeData.id,
            path: nodeData.id,
            name: nodeData.name || nodeData.id,
            type: 'directory',
            size: nodeData.size || 0,
            extension: 'dir',
            imports: [],
            exports: [],
          };
          this.store.selectNode(dirNode);
        } else {
          const fileNode = result.files[nodeData.id] || {
            id: nodeData.id,
            path: nodeData.id,
            name: nodeData.name || nodeData.id,
            type: 'file',
            size: nodeData.size || 0,
            extension: nodeData.extension || '',
            imports: [],
            exports: [],
          };
          this.store.selectNode(fileNode);
        }
      });

      // Handle double click / double tap for directory drill-down
      this.cyInstance.on('dbltap dblclick', 'node', (evt) => {
        const nodeData = evt.target.data();
        if (nodeData.type === 'directory') {
          this.onDrillDown(nodeData.id);
        }
      });
    }, 0);
  }
}


