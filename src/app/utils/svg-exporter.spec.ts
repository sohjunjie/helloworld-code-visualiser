import { describe, it, expect } from 'vitest';
import { exportCytoscapeToSvg, escapeXml } from './svg-exporter';
import { GraphThemeConfig } from '../services/theme.service';

describe('svg-exporter (TDD - Public Seam Verification)', () => {
  const mockTheme: GraphThemeConfig = {
    exportBg: '#0f172a',
    nodeBg: '#0284c7',
    nodeBorder: '#38bdf8',
    nodeLabelColor: '#f8fafc',
    edgeLineColor: '#64748b',
    edgeArrowColor: '#94a3b8',
    cycleNodeBg: '#f87171',
    cycleNodeBorder: '#dc2626',
    cycleNodeText: '#ffe4e6',
    focusedNodeBg: '#a855f7',
    focusedNodeBorder: '#c084fc',
    focusedNodeText: '#faf5ff',
    focusedNeighborBg: 'rgba(56, 189, 248, 0.18)',
    focusedNeighborBorder: '#38bdf8',
    focusedNeighborText: '#f0f9ff',
    focusedEdgeColor: '#a855f7',
  };

  it('escapeXml should escape special XML characters', () => {
    expect(escapeXml('<script>alert("hello" & \'world\')</script>')).toBe(
      '&lt;script&gt;alert(&quot;hello&quot; &amp; &apos;world&apos;)&lt;/script&gt;'
    );
    expect(escapeXml('normal-text.ts')).toBe('normal-text.ts');
  });

  it('should generate a valid SVG document string with header, defs, background, nodes and edges', () => {
    const mockCy = {
      elements: () => ({
        boundingBox: () => ({ x1: 0, y1: 0, x2: 200, y2: 100, w: 200, h: 100 }),
      }),
      nodes: () => [
        {
          id: () => 'node-1',
          position: () => ({ x: 50, y: 50 }),
          data: (key?: string) => {
            const data: Record<string, any> = {
              id: 'node-1',
              label: 'app.component.ts',
              extension: 'ts',
              isCycle: false,
              visible: true,
            };
            return key ? data[key] : data;
          },
          hasClass: (className: string) => className === 'visible',
        },
        {
          id: () => 'node-2',
          position: () => ({ x: 150, y: 50 }),
          data: (key?: string) => {
            const data: Record<string, any> = {
              id: 'node-2',
              label: 'header.component.ts',
              extension: 'ts',
              isCycle: true,
              visible: true,
            };
            return key ? data[key] : data;
          },
          hasClass: (_cls: string) => false,
        },
      ],
      edges: () => [
        {
          id: () => 'edge-1-2',
          source: () => ({ id: () => 'node-1', position: () => ({ x: 50, y: 50 }) }),
          target: () => ({ id: () => 'node-2', position: () => ({ x: 150, y: 50 }) }),
          data: (key?: string) => {
            const data: Record<string, any> = { id: 'edge-1-2', source: 'node-1', target: 'node-2' };
            return key ? data[key] : data;
          },
          hasClass: (_cls: string) => false,
        },
      ],
    } as any;

    const svg = exportCytoscapeToSvg(mockCy, mockTheme);

    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="');
    expect(svg).toContain('<marker id="arrow"');
    expect(svg).toContain('fill="#0f172a"');
    expect(svg).toContain('app.component.ts');
    expect(svg).toContain('header.component.ts');
    expect(svg).toContain('<rect');
    expect(svg).toContain('<path');
    expect(svg).toContain('#f87171'); // Cycle node highlight color
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('should handle empty graph gracefully', () => {
    const emptyCy = {
      elements: () => ({
        boundingBox: () => ({ x1: 0, y1: 0, x2: 0, y2: 0, w: 0, h: 0 }),
      }),
      nodes: () => [],
      edges: () => [],
    } as any;

    const svg = exportCytoscapeToSvg(emptyCy, mockTheme);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('</svg>');
  });
});
