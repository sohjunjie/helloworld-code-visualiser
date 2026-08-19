import cytoscape from 'cytoscape';
import { GraphThemeConfig } from '../services/theme.service';

export interface SvgExportOptions {
  padding?: number;
  bg?: string;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a clean, standalone, high-resolution vector SVG representation of a Cytoscape graph.
 */
export function exportCytoscapeToSvg(
  cy: cytoscape.Core,
  themeConfig: GraphThemeConfig,
  options: SvgExportOptions = {}
): string {
  const padding = options.padding ?? 40;
  const bg = options.bg ?? themeConfig.exportBg;

  // Calculate bounding box over visible elements
  let boundingBox = { x1: 0, y1: 0, x2: 0, y2: 0, w: 0, h: 0 };
  if (cy.elements) {
    const allElements = cy.elements();
    if (allElements) {
      if (typeof allElements.filter === 'function') {
        const visible = allElements.filter((ele: any) => !ele.hasClass || !ele.hasClass('filtered-out'));
        if (visible && typeof visible.boundingBox === 'function') {
          boundingBox = visible.boundingBox();
        } else if (typeof allElements.boundingBox === 'function') {
          boundingBox = allElements.boundingBox();
        }
      } else if (typeof allElements.boundingBox === 'function') {
        boundingBox = allElements.boundingBox();
      }
    }
  }

  const width = Math.max(boundingBox.w + padding * 2, 200);
  const height = Math.max(boundingBox.h + padding * 2, 150);
  const minX = (boundingBox.w === 0 && boundingBox.h === 0) ? 0 : boundingBox.x1 - padding;
  const minY = (boundingBox.w === 0 && boundingBox.h === 0) ? 0 : boundingBox.y1 - padding;

  const nodes = cy.nodes ? cy.nodes() : [];
  const edges = cy.edges ? cy.edges() : [];

  const nodeMap = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    nodeMap.set(node.id(), node.position());
  }

  const svgParts: string[] = [];
  svgParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">`
  );

  // Defs with Arrow Markers (marker refX within 0..10 coordinate space)
  svgParts.push('  <defs>');
  svgParts.push(`    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`);
  svgParts.push(`      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${themeConfig.edgeArrowColor}" />`);
  svgParts.push('    </marker>');
  svgParts.push('  </defs>');

  // Background
  svgParts.push(`  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${bg}" />`);

  // Edges layer
  svgParts.push('  <g class="edges">');
  for (const edge of edges) {
    const isFilteredOut = edge.hasClass('filtered-out');
    if (isFilteredOut) continue;

    const isDimmed = edge.hasClass('dimmed');
    const isFocusedEdge = edge.hasClass('focused-edge');
    const opacity = isDimmed ? 0.08 : isFocusedEdge ? 0.95 : 0.6;
    const strokeColor = isFocusedEdge ? themeConfig.focusedEdgeColor : themeConfig.edgeLineColor;
    const strokeWidth = isFocusedEdge ? 2.5 : 1.5;
    const sourceNode = edge.source();
    const targetNode = edge.target();
    const sourcePos = sourceNode?.position() || nodeMap.get(edge.data('source'));
    const targetPos = targetNode?.position() || nodeMap.get(edge.data('target'));

    if (sourcePos && targetPos) {
      svgParts.push(
        `    <path d="M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" marker-end="url(#arrow)" />`
      );
    }
  }
  svgParts.push('  </g>');

  // Nodes layer
  svgParts.push('  <g class="nodes">');
  for (const node of nodes) {
    const isFilteredOut = node.hasClass('filtered-out');
    if (isFilteredOut) continue;

    const isDimmed = node.hasClass('dimmed');
    const isFocused = node.hasClass('focused');
    const isFocusedNeighbor = node.hasClass('focused-neighbor');
    const isCycle = node.data('isCycle');
    const pos = node.position();
    const label = node.data('label') || node.id();

    const nodeBg = isCycle ? themeConfig.cycleNodeBg : isFocused ? themeConfig.focusedNodeBg : themeConfig.nodeBg;
    const nodeBorder = isCycle ? themeConfig.cycleNodeBorder : isFocused ? themeConfig.focusedNodeBorder : isFocusedNeighbor ? themeConfig.focusedNeighborBorder : themeConfig.nodeBorder;
    const radius = isFocused ? 16 : 12;
    const opacity = isDimmed ? 0.12 : 1.0;
    const labelOpacity = isDimmed ? 0.12 : 1.0;

    svgParts.push(
      `    <g class="node" opacity="${opacity}">`
    );
    svgParts.push(
      `      <circle cx="${pos.x}" cy="${pos.y}" r="${radius}" fill="${nodeBg}" stroke="${nodeBorder}" stroke-width="2" />`
    );
    svgParts.push(
      `      <text x="${pos.x}" y="${pos.y + radius + 13}" font-family="system-ui, -apple-system, sans-serif" font-size="11px" font-weight="500" fill="${themeConfig.nodeLabelColor}" opacity="${labelOpacity}" text-anchor="middle">${escapeXml(label)}</text>`
    );
    svgParts.push('    </g>');
  }
  svgParts.push('  </g>');

  svgParts.push('</svg>');
  return svgParts.join('\n');
}
