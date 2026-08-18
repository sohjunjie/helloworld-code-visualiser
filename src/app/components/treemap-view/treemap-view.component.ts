import { Component, ElementRef, ViewChild, inject, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { CodeFileNode } from '../../models/code-visualizer.models';

@Component({
  selector: 'app-treemap-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treemap-view.component.html',
  styleUrl: './treemap-view.component.css',
})
export class TreemapViewComponent implements AfterViewInit {
  readonly store = inject(VisualizerStoreService);

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('svgElement') svgRef!: ElementRef<SVGElement>;

  hoveredNode: d3.HierarchyRectangularNode<CodeFileNode> | null = null;
  tooltipX = 0;
  tooltipY = 0;

  /** The node currently zoomed into (null = root) */
  private zoomRoot: d3.HierarchyRectangularNode<CodeFileNode> | null = null;
  /** Full hierarchy root, cached for zoom navigation */
  private fullRoot: d3.HierarchyRectangularNode<CodeFileNode> | null = null;

  /** Breadcrumb trail for zoomed navigation */
  breadcrumbs: d3.HierarchyRectangularNode<CodeFileNode>[] = [];

  /** Depth colors for folder nesting */
  private readonly folderColors = [
    'rgba(30, 41, 59, 0.9)',   // slate-800
    'rgba(51, 65, 85, 0.7)',   // slate-700
    'rgba(71, 85, 105, 0.5)',  // slate-600
    'rgba(100, 116, 139, 0.35)', // slate-500
    'rgba(148, 163, 184, 0.2)', // slate-400
  ];

  constructor() {
    effect(() => {
      const res = this.store.analysisResult();
      if (res && this.svgRef) {
        this.zoomRoot = null;
        this.renderTreemap();
      }
    });
  }

  ngAfterViewInit() {
    this.renderTreemap();
  }

  /** Navigate to a specific node in the breadcrumb */
  zoomTo(node: d3.HierarchyRectangularNode<CodeFileNode>) {
    this.zoomRoot = node === this.fullRoot ? null : node;
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

    // Add a defs section for clip paths
    const defs = svg.append('defs');

    const root = d3
      .hierarchy(result.rootNode)
      .sum((d) => (d.type === 'file' ? Math.max(d.size, 100) : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<CodeFileNode>()
      .size([width, height])
      .paddingTop(20)
      .paddingRight(3)
      .paddingBottom(3)
      .paddingLeft(3)
      .paddingInner(2)
      .round(true);

    treemapLayout(root as any);

    this.fullRoot = root as d3.HierarchyRectangularNode<CodeFileNode>;

    // Determine the render root (for zooming)
    const renderRoot = this.zoomRoot || this.fullRoot;

    // Build breadcrumbs
    this.breadcrumbs = [];
    let current: d3.HierarchyRectangularNode<CodeFileNode> | null = renderRoot;
    while (current) {
      this.breadcrumbs.unshift(current);
      current = current.parent as d3.HierarchyRectangularNode<CodeFileNode> | null;
    }

    // When zoomed, we need to re-layout so the zoomed subtree fills the viewport
    let displayRoot = renderRoot;
    if (this.zoomRoot) {
      // Re-create a hierarchy from the zoomed node's data
      const subRoot = d3
        .hierarchy(this.zoomRoot.data)
        .sum((d) => (d.type === 'file' ? Math.max(d.size, 100) : 0))
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      const subLayout = d3
        .treemap<CodeFileNode>()
        .size([width, height])
        .paddingTop(20)
        .paddingRight(3)
        .paddingBottom(3)
        .paddingLeft(3)
        .paddingInner(2)
        .round(true);

      subLayout(subRoot as any);
      displayRoot = subRoot as d3.HierarchyRectangularNode<CodeFileNode>;
    }

    // Get all descendants (both folders and files)
    const allNodes = displayRoot.descendants() as d3.HierarchyRectangularNode<CodeFileNode>[];

    // Render folder groups first (non-leaf nodes), depth-first
    const folders = allNodes.filter(d => d.children && d.children.length > 0);
    const leaves = allNodes.filter(d => !d.children || d.children.length === 0);

    // Draw folder backgrounds
    const folderGroups = svg
      .selectAll('g.folder')
      .data(folders)
      .enter()
      .append('g')
      .attr('class', 'folder')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Folder rectangle
    folderGroups
      .append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('rx', (d) => d.depth === 0 ? 0 : 6)
      .attr('fill', (d) => this.getFolderColor(d.depth))
      .attr('stroke', (d) => d.depth === 0 ? 'none' : 'rgba(148, 163, 184, 0.15)')
      .attr('stroke-width', 1)
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
        event.stopPropagation();
        if (d.children && d.children.length > 0 && d !== displayRoot) {
          // Find the corresponding node in fullRoot for zoom state
          this.zoomRoot = this.findNodeInFullTree(d.data.id);
          this.renderTreemap();
        }
      });

    // Folder clip paths for labels
    folderGroups.each((d, i) => {
      const nodeWidth = Math.max(0, d.x1 - d.x0);
      defs.append('clipPath')
        .attr('id', `folder-clip-${i}`)
        .append('rect')
        .attr('width', Math.max(0, nodeWidth - 6))
        .attr('height', 16);
    });

    // Folder name labels (in the top padding area)
    folderGroups
      .append('text')
      .attr('clip-path', (_d, i) => `url(#folder-clip-${i})`)
      .attr('x', 5)
      .attr('y', 14)
      .text((d) => {
        const nodeWidth = d.x1 - d.x0;
        if (nodeWidth < 30 || (d.y1 - d.y0) < 20) return '';
        return '📁 ' + d.data.name;
      })
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', 'rgba(148, 163, 184, 0.9)')
      .attr('letter-spacing', '0.02em')
      .style('pointer-events', 'none');

    // Draw file leaf nodes
    const leafGroups = svg
      .selectAll('g.leaf')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'leaf')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Clip paths for file labels — clip to the rectangle bounds
    leafGroups.each((d, i) => {
      const nodeWidth = Math.max(0, d.x1 - d.x0);
      const nodeHeight = Math.max(0, d.y1 - d.y0);
      defs.append('clipPath')
        .attr('id', `leaf-clip-${i}`)
        .append('rect')
        .attr('width', Math.max(0, nodeWidth - 8))
        .attr('height', Math.max(0, nodeHeight - 4));
    });

    // File rectangles
    leafGroups
      .append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('rx', 4)
      .attr('fill', (d) => this.getNodeColor(d.data.extension))
      .attr('opacity', 0.85)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        this.hoveredNode = d as any;
        const rect = container.getBoundingClientRect();
        this.tooltipX = Math.min(event.clientX - rect.left + 15, width - 200);
        this.tooltipY = Math.min(event.clientY - rect.top + 15, height - 80);
        d3.select(event.currentTarget as SVGElement).attr('opacity', 1).attr('stroke', '#38bdf8').attr('stroke-width', 1.5);
      })
      .on('mouseleave', (event) => {
        this.hoveredNode = null;
        d3.select(event.currentTarget as SVGElement).attr('opacity', 0.85).attr('stroke', '#0f172a').attr('stroke-width', 1);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        this.store.selectNode(d.data);
        this.store.setActiveTab('inspector');
      });

    // File name labels (clipped)
    leafGroups
      .append('text')
      .attr('clip-path', (_d, i) => `url(#leaf-clip-${i})`)
      .attr('x', 4)
      .attr('y', 13)
      .text((d) => {
        const nodeWidth = d.x1 - d.x0;
        const nodeHeight = d.y1 - d.y0;
        if (nodeWidth < 20 || nodeHeight < 18) return '';
        return d.data.name;
      })
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .attr('fill', '#f8fafc')
      .style('pointer-events', 'none');
  }

  /** Find a node by ID in the full tree */
  private findNodeInFullTree(id: string): d3.HierarchyRectangularNode<CodeFileNode> | null {
    if (!this.fullRoot) return null;
    const all = this.fullRoot.descendants() as d3.HierarchyRectangularNode<CodeFileNode>[];
    return all.find(n => n.data.id === id) || null;
  }

  /** Get folder background color by depth */
  private getFolderColor(depth: number): string {
    return this.folderColors[Math.min(depth, this.folderColors.length - 1)];
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
      case 'java':
        return '#ef4444';
      case 'py':
        return '#3b82f6';
      case 'xml':
        return '#f97316';
      case 'yaml':
      case 'yml':
        return '#06b6d4';
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
