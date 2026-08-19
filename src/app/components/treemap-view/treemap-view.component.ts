import { Component, ElementRef, ViewChild, inject, AfterViewInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ThemeService } from '../../services/theme.service';
import { CodeFileNode } from '../../models/code-visualizer.models';
import { formatBytes } from '../../utils/formatters';

@Component({
  selector: 'app-treemap-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './treemap-view.component.html',
  styleUrl: './treemap-view.component.css',
})
export class TreemapViewComponent implements AfterViewInit {
  readonly store = inject(VisualizerStoreService);
  readonly themeService = inject(ThemeService);

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('svgElement') svgRef!: ElementRef<SVGElement>;

  hoveredNode = signal<d3.HierarchyRectangularNode<CodeFileNode> | null>(null);
  tooltipX = signal<number>(0);
  tooltipY = signal<number>(0);

  /** The node currently zoomed into (null = root) */
  private zoomRoot: d3.HierarchyRectangularNode<CodeFileNode> | null = null;
  /** Full hierarchy root, cached for zoom navigation */
  private fullRoot: d3.HierarchyRectangularNode<CodeFileNode> | null = null;

  /** Breadcrumb trail signal for zoomed navigation */
  breadcrumbs = signal<d3.HierarchyRectangularNode<CodeFileNode>[]>([]);

  constructor() {
    try {
      effect(() => {
        const res = this.store.analysisResult();
        const isDark = this.themeService.isDarkMode();
        if (res) {
          this.renderTreemap();
        }
      });
    } catch {
      // In headless test environments without ChangeDetectionScheduler
    }
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
    if (!result) return;

    // Always compute full root hierarchy and breadcrumbs using logarithmic scale for file size distribution
    // This prevents large files (e.g. 50KB) from squishing small utility/class files (e.g. 200B) into unreadable micro-rectangles.
    const root = d3
      .hierarchy(result.rootNode)
      .sum((d) => (d.type === 'file' ? Math.log2(Math.max(d.size, 10) + 1) * 300 : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    this.fullRoot = root as d3.HierarchyRectangularNode<CodeFileNode>;
    const renderRoot = this.zoomRoot || this.fullRoot;

    this.updateBreadcrumbs(renderRoot);

    if (!this.svgRef || !this.containerRef) return;

    const container = this.containerRef.nativeElement;
    const width = container.clientWidth - 16;
    const height = container.clientHeight - 16;

    if (width <= 0 || height <= 0) return;

    const svg = d3.select(this.svgRef.nativeElement);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Add a defs section for clip paths
    const defs = svg.append('defs');

    const treemapLayout = d3
      .treemap<CodeFileNode>()
      .size([width, height])
      .paddingTop((d) => (d.depth === 0 ? 18 : 16))
      .paddingRight(2)
      .paddingBottom(2)
      .paddingLeft(2)
      .paddingInner(1)
      .round(true);

    treemapLayout(root as any);

    // When zoomed, we need to re-layout so the zoomed subtree fills the viewport
    let displayRoot = renderRoot;
    if (this.zoomRoot) {
      // Re-create a hierarchy from the zoomed node's data
      const subRoot = d3
        .hierarchy(this.zoomRoot.data)
        .sum((d) => (d.type === 'file' ? Math.log2(Math.max(d.size, 10) + 1) * 300 : 0))
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      const subLayout = d3
        .treemap<CodeFileNode>()
        .size([width, height])
        .paddingTop((d) => (d.depth === 0 ? 18 : 16))
        .paddingRight(2)
        .paddingBottom(2)
        .paddingLeft(2)
        .paddingInner(1)
        .round(true);

      subLayout(subRoot as any);
      displayRoot = subRoot as d3.HierarchyRectangularNode<CodeFileNode>;
    }

    // Build breadcrumbs for currently displayed root using full tree lineage
    this.updateBreadcrumbs(displayRoot);

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

    const { folderStroke, folderLabelFill, fileStroke, fileHoverStroke } = this.themeService.getTreemapStyles();

    // Folder rectangle
    folderGroups
      .append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('rx', (d) => d.depth === 0 ? 0 : 6)
      .attr('fill', (d) => this.themeService.getFolderColorAtDepth(d.depth))
      .attr('stroke', (d) => d.depth === 0 ? 'none' : folderStroke)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        this.hoveredNode.set(d as any);
        this.updateTooltipPosition(event, container);
      })
      .on('mousemove', (event) => {
        this.updateTooltipPosition(event, container);
      })
      .on('mouseleave', () => {
        this.hoveredNode.set(null);
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
      .attr('fill', folderLabelFill)
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
      .attr('fill', (d) => this.themeService.getFileExtensionColor(d.data.extension))
      .attr('opacity', 0.85)
      .attr('stroke', fileStroke)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        this.hoveredNode.set(d as any);
        this.updateTooltipPosition(event, container);
        d3.select(event.currentTarget as SVGElement).attr('opacity', 1).attr('stroke', fileHoverStroke).attr('stroke-width', 1.5);
      })
      .on('mousemove', (event) => {
        this.updateTooltipPosition(event, container);
      })
      .on('mouseleave', (event) => {
        this.hoveredNode.set(null);
        d3.select(event.currentTarget as SVGElement).attr('opacity', 0.85).attr('stroke', fileStroke).attr('stroke-width', 1);
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

  private updateTooltipPosition(event: MouseEvent, _container: HTMLElement) {
    const tooltipWidth = 260;
    const tooltipHeight = 110;
    const padding = 12;

    let x = event.clientX + padding;
    let y = event.clientY + padding;

    // Flip tooltip to left/top if it would overflow window/viewport edges
    if (x + tooltipWidth > window.innerWidth) {
      x = Math.max(padding, event.clientX - tooltipWidth - padding);
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = Math.max(padding, event.clientY - tooltipHeight - padding);
    }

    this.tooltipX.set(x);
    this.tooltipY.set(y);
  }

  /** Build breadcrumbs array from target node up to root */
  private updateBreadcrumbs(node: d3.HierarchyRectangularNode<CodeFileNode> | null) {
    if (!node) {
      this.breadcrumbs.set([]);
      return;
    }

    // If node is from subRoot re-layout, locate its corresponding node in fullRoot to get full parent chain
    const fullNode = this.fullRoot ? this.findNodeInFullTree(node.data.id) : node;
    let current: d3.HierarchyRectangularNode<CodeFileNode> | null = fullNode || node;
    const list: d3.HierarchyRectangularNode<CodeFileNode>[] = [];

    while (current) {
      list.unshift(current);
      current = current.parent as d3.HierarchyRectangularNode<CodeFileNode> | null;
    }

    this.breadcrumbs.set(list);
  }

  /** Find a node by ID in the full tree */
  private findNodeInFullTree(id: string): d3.HierarchyRectangularNode<CodeFileNode> | null {
    if (!this.fullRoot) return null;
    const all = this.fullRoot.descendants() as d3.HierarchyRectangularNode<CodeFileNode>[];
    return all.find(n => n.data.id === id) || null;
  }

  formatBytes = formatBytes;
}
