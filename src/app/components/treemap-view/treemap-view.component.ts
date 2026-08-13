import { Component, ElementRef, ViewChild, inject, AfterViewInit, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { CodeFileNode } from '../../models/code-visualizer.models';

@Component({
  selector: 'app-treemap-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-4 space-y-4">
      <!-- Controls Toolbar -->
      <div class="glass-panel p-3 rounded-2xl flex items-center justify-between border border-slate-700/60">
        <div class="flex items-center space-x-4">
          <div>
            <h3 class="text-sm font-bold text-slate-100">Folder Hierarchy Treemap</h3>
            <p class="text-xs text-slate-400">File size distribution and relative path nesting</p>
          </div>
        </div>

        <!-- Extension Color Legend -->
        <div class="flex items-center space-x-3 text-xs">
          <div class="flex items-center space-x-1"><span class="w-3 h-3 rounded bg-blue-500 inline-block"></span><span class="text-slate-300">TS/TSX</span></div>
          <div class="flex items-center space-x-1"><span class="w-3 h-3 rounded bg-amber-500 inline-block"></span><span class="text-slate-300">JS/JSX</span></div>
          <div class="flex items-center space-x-1"><span class="w-3 h-3 rounded bg-purple-500 inline-block"></span><span class="text-slate-300">CSS/HTML</span></div>
          <div class="flex items-center space-x-1"><span class="w-3 h-3 rounded bg-emerald-500 inline-block"></span><span class="text-slate-300">JSON/MD</span></div>
        </div>
      </div>

      <!-- Treemap Canvas Container -->
      <div class="flex-1 glass-card rounded-3xl p-4 overflow-hidden relative border border-slate-800" #container>
        <svg #svgElement class="w-full h-full"></svg>
        
        <!-- Hover Tooltip Overlay -->
        @if (hoveredNode) {
          <div
            class="absolute pointer-events-none glass-panel p-3 rounded-xl border border-sky-500/40 text-xs shadow-2xl z-30 space-y-1"
            [style.left.px]="tooltipX"
            [style.top.px]="tooltipY"
          >
            <div class="font-bold text-sky-400 truncate max-w-xs">{{ hoveredNode.data.path || hoveredNode.data.name }}</div>
            <div class="text-slate-300 flex justify-between space-x-4">
              <span>Size: {{ formatBytes(hoveredNode.data.size) }}</span>
              <span>Lines: {{ hoveredNode.data.astSummary?.totalLines || 0 }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TreemapViewComponent implements AfterViewInit {
  readonly store = inject(VisualizerStoreService);

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('svgElement') svgRef!: ElementRef<SVGElement>;

  hoveredNode: d3.HierarchyRectangularNode<CodeFileNode> | null = null;
  tooltipX = 0;
  tooltipY = 0;

  constructor() {
    effect(() => {
      const res = this.store.analysisResult();
      if (res && this.svgRef) {
        this.renderTreemap();
      }
    });
  }

  ngAfterViewInit() {
    this.renderTreemap();
  }

  private renderTreemap() {
    const result = this.store.analysisResult();
    if (!result || !this.svgRef || !this.containerRef) return;

    const container = this.containerRef.nativeElement;
    const width = container.clientWidth - 32;
    const height = container.clientHeight - 32;

    if (width <= 0 || height <= 0) return;

    const svg = d3.select(this.svgRef.nativeElement);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const root = d3
      .hierarchy(result.rootNode)
      .sum((d) => (d.type === 'file' ? Math.max(d.size, 100) : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<CodeFileNode>()
      .size([width, height])
      .paddingOuter(4)
      .paddingInner(2)
      .round(true);

    treemapLayout(root);

    const leaves = root.leaves() as d3.HierarchyRectangularNode<CodeFileNode>[];

    const nodes = svg
      .selectAll('g')
      .data(leaves)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Draw Rectangles
    nodes
      .append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('rx', 6)
      .attr('fill', (d) => this.getNodeColor(d.data.extension))
      .attr('opacity', 0.85)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        this.hoveredNode = d as any;
        const rect = container.getBoundingClientRect();
        this.tooltipX = Math.min(event.clientX - rect.left + 15, width - 200);
        this.tooltipY = Math.min(event.clientY - rect.top + 15, height - 80);
      })
      .on('mouseleave', () => {
        this.hoveredNode = null;
      })
      .on('click', (event, d) => {
        this.store.selectNode(d.data);
        this.store.setActiveTab('inspector');
      });

    // Draw File Names
    nodes
      .append('text')
      .attr('x', 6)
      .attr('y', 18)
      .text((d) => (d.x1 - d.x0 > 50 && d.y1 - d.y0 > 25 ? d.data.name : ''))
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', '#f8fafc')
      .style('pointer-events', 'none');
  }

  private getNodeColor(ext: string): string {
    switch (ext?.toLowerCase()) {
      case 'ts':
      case 'tsx':
        return '#3b82f6';
      case 'js':
      case 'jsx':
      case 'mjs':
        return '#f59e0b';
      case 'css':
      case 'scss':
      case 'html':
        return '#a855f7';
      case 'json':
      case 'md':
        return '#10b981';
      default:
        return '#64748b';
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
