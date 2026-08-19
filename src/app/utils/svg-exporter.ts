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
  const focusedArrowColor = themeConfig.focusedEdgeArrowColor || themeConfig.focusedEdgeColor;
  svgParts.push('  <defs>');
  svgParts.push(`    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`);
  svgParts.push(`      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${themeConfig.edgeArrowColor}" />`);
  svgParts.push('    </marker>');
  svgParts.push(`    <marker id="arrow-focused" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`);
  svgParts.push(`      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${focusedArrowColor}" />`);
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
    const opacity = isDimmed ? 0.06 : isFocusedEdge ? 1.0 : 0.7;
    const strokeColor = isFocusedEdge ? themeConfig.focusedEdgeColor : themeConfig.edgeLineColor;
    const strokeWidth = isFocusedEdge ? 2.5 : 1.5;
    const markerId = isFocusedEdge ? 'arrow-focused' : 'arrow';
    const sourceNode = edge.source();
    const targetNode = edge.target();
    const sourcePos = sourceNode?.position() || nodeMap.get(edge.data('source'));
    const targetPos = targetNode?.position() || nodeMap.get(edge.data('target'));

    if (sourcePos && targetPos) {
      const srcLabel = sourceNode?.data?.('label') || sourceNode?.id?.() || '';
      const tgtLabel = targetNode?.data?.('label') || targetNode?.id?.() || '';
      const srcW = (typeof sourceNode?.width === 'function' ? sourceNode.width() : 0) || Math.max(srcLabel.length * 7.5 + 24, 60);
      const srcH = (typeof sourceNode?.height === 'function' ? sourceNode.height() : 0) || 32;
      const tgtW = (typeof targetNode?.width === 'function' ? targetNode.width() : 0) || Math.max(tgtLabel.length * 7.5 + 24, 60);
      const tgtH = (typeof targetNode?.height === 'function' ? targetNode.height() : 0) || 32;

      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let startX = sourcePos.x;
      let startY = sourcePos.y;
      let endX = targetPos.x;
      let endY = targetPos.y;

      if (dist > 0.001) {
        const ux = dx / dist;
        const uy = dy / dist;

        const srcScaleX = Math.abs(ux) > 0.0001 ? (srcW / 2) / Math.abs(ux) : Infinity;
        const srcScaleY = Math.abs(uy) > 0.0001 ? (srcH / 2) / Math.abs(uy) : Infinity;
        const srcOffset = Math.min(srcScaleX, srcScaleY);
        startX = sourcePos.x + ux * srcOffset;
        startY = sourcePos.y + uy * srcOffset;

        const tgtScaleX = Math.abs(ux) > 0.0001 ? (tgtW / 2) / Math.abs(ux) : Infinity;
        const tgtScaleY = Math.abs(uy) > 0.0001 ? (tgtH / 2) / Math.abs(uy) : Infinity;
        const tgtOffset = Math.min(tgtScaleX, tgtScaleY);
        endX = targetPos.x - ux * tgtOffset;
        endY = targetPos.y - uy * tgtOffset;
      }

      svgParts.push(
        `    <path d="M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" marker-end="url(#${markerId})" />`
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
    const customColor = node.data('color');
    const customBorder = node.data('borderColor');
    const customTextColor = node.data('textColor');
    const pos = node.position();
    const label = node.data('label') || node.id();

    const nodeWidth = (typeof node.width === 'function' ? node.width() : 0) || Math.max(label.length * 7.5 + 24, 60);
    const nodeHeight = (typeof node.height === 'function' ? node.height() : 0) || (isFocused ? 36 : 32);
    const nodeX = pos.x - nodeWidth / 2;
    const nodeY = pos.y - nodeHeight / 2;
    const rx = 8;

    const nodeBg = isCycle
      ? themeConfig.cycleNodeBg
      : isFocused
        ? themeConfig.focusedNodeBg
        : isFocusedNeighbor
          ? (themeConfig.focusedNeighborBg || themeConfig.nodeBg)
          : (customColor || themeConfig.nodeBg);

    const nodeBorder = isCycle
      ? themeConfig.cycleNodeBorder
      : isFocused
        ? themeConfig.focusedNodeBorder
        : isFocusedNeighbor
          ? themeConfig.focusedNeighborBorder
          : (customBorder || themeConfig.nodeBorder);

    const textColor = isCycle
      ? themeConfig.cycleNodeText
      : isFocused
        ? themeConfig.focusedNodeText
        : isFocusedNeighbor
          ? themeConfig.focusedNeighborText
          : (customTextColor || themeConfig.nodeLabelColor);

    const borderWidth = isFocused ? 2.5 : isCycle ? 2.5 : isFocusedNeighbor ? 2 : 1.5;
    const opacity = isDimmed ? 0.12 : 1.0;

    svgParts.push(
      `    <g class="node" opacity="${opacity}">`
    );
    svgParts.push(
      `      <rect x="${nodeX.toFixed(1)}" y="${nodeY.toFixed(1)}" width="${nodeWidth.toFixed(1)}" height="${nodeHeight.toFixed(1)}" rx="${rx}" fill="${nodeBg}" stroke="${nodeBorder}" stroke-width="${borderWidth}" />`
    );
    svgParts.push(
      `      <text x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1)}" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5px" font-weight="600" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>`
    );
    svgParts.push('    </g>');
  }
  svgParts.push('  </g>');

  svgParts.push('</svg>');
  return svgParts.join('\n');
}
