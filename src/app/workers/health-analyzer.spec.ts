import { describe, it, expect } from 'vitest';
import { analyzeCodeHealth, detectDuplicateCode } from './health-analyzer';
import { CodeFileNode, GraphEdge } from '../models/code-visualizer.models';

describe('health-analyzer', () => {
  const sampleNodes: Record<string, CodeFileNode> = {
    'src/main.ts': {
      id: 'src/main.ts',
      path: 'src/main.ts',
      name: 'main.ts',
      type: 'file',
      size: 500,
      extension: 'ts',
      content: `
        import { Util } from './util';
        export function run() {
          if (true) {
            console.log("running");
          }
        }
      `,
      imports: ['./util'],
      exports: ['run'],
      astSummary: {
        totalLines: 8,
        codeLines: 6,
        blankLines: 1,
        commentLines: 1,
        commentRatio: 0.125,
        cyclomaticComplexity: 2,
        maintainabilityIndex: 85,
        importCount: 1,
        exportCount: 1,
        functionCount: 1,
        classCount: 0,
      },
    },
    'src/util.ts': {
      id: 'src/util.ts',
      path: 'src/util.ts',
      name: 'util.ts',
      type: 'file',
      size: 1500,
      extension: 'ts',
      content: `
        export function compute(a: number, b: number) {
          if (a > 0) return a;
          if (b > 0) return b;
          if (a === 0 && b === 0) return 0;
          return -1;
        }
      `,
      imports: [],
      exports: ['compute'],
      astSummary: {
        totalLines: 10,
        codeLines: 8,
        blankLines: 1,
        commentLines: 1,
        commentRatio: 0.1,
        cyclomaticComplexity: 18,
        maintainabilityIndex: 55,
        importCount: 0,
        exportCount: 1,
        functionCount: 1,
        classCount: 0,
      },
    },
  };

  const sampleEdges: GraphEdge[] = [
    {
      id: 'src/main.ts->src/util.ts',
      source: 'src/main.ts',
      target: 'src/util.ts',
      type: 'import',
    },
  ];

  describe('analyzeCodeHealth', () => {
    it('computes overall codebase health stats, averages, and maintainability', () => {
      const paths = ['src/main.ts', 'src/util.ts'];
      const health = analyzeCodeHealth(paths, sampleNodes, sampleEdges);

      expect(health.totalCodeLines).toBe(14);
      expect(health.totalCommentLines).toBe(2);
      expect(health.averageMaintainabilityIndex).toBe(70);
      expect(health.averageCyclomaticComplexity).toBe(10);
      expect(health.overallHealthScore).toBeGreaterThan(0);
      expect(health.overallHealthScore).toBeLessThanOrEqual(100);
    });

    it('identifies highest complexity files in descending order', () => {
      const paths = ['src/main.ts', 'src/util.ts'];
      const health = analyzeCodeHealth(paths, sampleNodes, sampleEdges);

      expect(health.highestComplexityFiles.length).toBe(2);
      expect(health.highestComplexityFiles[0].path).toBe('src/util.ts');
      expect(health.highestComplexityFiles[0].complexity).toBe(18);
    });

    it('identifies structural hotspots when high complexity meets high incoming dependencies or low maintainability', () => {
      const paths = ['src/main.ts', 'src/util.ts'];
      const health = analyzeCodeHealth(paths, sampleNodes, sampleEdges);

      expect(health.structuralHotspots.length).toBeGreaterThanOrEqual(1);
      const utilHotspot = health.structuralHotspots.find((h) => h.path === 'src/util.ts');
      expect(utilHotspot).toBeDefined();
      expect(utilHotspot?.complexity).toBe(18);
      expect(utilHotspot?.incomingDeps).toBe(1);
    });
  });

  describe('detectDuplicateCode', () => {
    it('detects duplicate code blocks across files', () => {
      const duplicateChunk = `
        const a = 1;
        const b = 2;
        const c = a + b;
        console.log(c);
        return c;
      `;

      const nodes: Record<string, CodeFileNode> = {
        'file1.ts': {
          id: 'file1.ts',
          path: 'file1.ts',
          name: 'file1.ts',
          type: 'file',
          size: 100,
          extension: 'ts',
          content: duplicateChunk,
          imports: [],
          exports: [],
        },
        'file2.ts': {
          id: 'file2.ts',
          path: 'file2.ts',
          name: 'file2.ts',
          type: 'file',
          size: 100,
          extension: 'ts',
          content: duplicateChunk,
          imports: [],
          exports: [],
        },
      };

      const result = detectDuplicateCode(nodes);
      expect(result.duplicateBlocksCount).toBeGreaterThanOrEqual(1);
      expect(result.duplicateRatio).toBeGreaterThan(0);
    });
  });
});
