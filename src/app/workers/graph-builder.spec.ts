import { describe, it, expect } from 'vitest';
import {
  normalizePathSegments,
  resolveImportPath,
  buildDependencyEdges,
  buildDirectoryTree,
  countDirectories,
  calculateStats,
} from './graph-builder';
import { CodeFileNode } from '../models/code-visualizer.models';

describe('graph-builder', () => {
  describe('normalizePathSegments', () => {
    it('normalizes single dot and double dot relative path segments', () => {
      expect(normalizePathSegments('src/app/../utils/./formatters')).toBe('src/utils/formatters');
      expect(normalizePathSegments('src/components/header/../../services/api')).toBe('src/services/api');
      expect(normalizePathSegments('a/b/c/../../d')).toBe('a/d');
      expect(normalizePathSegments('./main')).toBe('main');
    });
  });

  describe('resolveImportPath', () => {
    const filePaths = [
      'src/main.ts',
      'src/app/app.component.ts',
      'src/app/services/api.service.ts',
      'src/app/components/header/header.component.ts',
      'src/app/components/header/index.ts',
      'src/utils/formatters.js',
      'src/utils/helpers.tsx',
    ];

    it('returns null for external npm packages', () => {
      expect(resolveImportPath('src/main.ts', 'rxjs', filePaths)).toBeNull();
      expect(resolveImportPath('src/main.ts', '@angular/core', filePaths)).toBeNull();
      expect(resolveImportPath('src/main.ts', 'cytoscape', filePaths)).toBeNull();
    });

    it('resolves relative sibling and child imports with direct extension or implicit extension', () => {
      expect(
        resolveImportPath('src/app/app.component.ts', './services/api.service', filePaths)
      ).toBe('src/app/services/api.service.ts');

      expect(
        resolveImportPath('src/app/app.component.ts', './services/api.service.ts', filePaths)
      ).toBe('src/app/services/api.service.ts');

      expect(
        resolveImportPath('src/main.ts', './utils/formatters', filePaths)
      ).toBe('src/utils/formatters.js');

      expect(
        resolveImportPath('src/main.ts', './utils/helpers', filePaths)
      ).toBe('src/utils/helpers.tsx');
    });

    it('resolves directory index imports (e.g. ./components/header -> ./components/header/index.ts)', () => {
      expect(
        resolveImportPath('src/app/app.component.ts', './components/header', filePaths)
      ).toBe('src/app/components/header/index.ts');
    });

    it('resolves parent relative navigation (`../`) correctly', () => {
      expect(
        resolveImportPath('src/app/components/header/header.component.ts', '../../services/api.service', filePaths)
      ).toBe('src/app/services/api.service.ts');
    });

    it('returns null if target file is not present in filePaths', () => {
      expect(
        resolveImportPath('src/main.ts', './missing-file', filePaths)
      ).toBeNull();
    });
  });

  describe('buildDependencyEdges', () => {
    it('creates graph edges and adjacency list from node imports', () => {
      const filePaths = ['src/a.ts', 'src/b.ts', 'src/c.ts'];
      const fileNodes: Record<string, CodeFileNode> = {
        'src/a.ts': {
          id: 'src/a.ts',
          path: 'src/a.ts',
          name: 'a.ts',
          type: 'file',
          size: 100,
          extension: 'ts',
          imports: ['./b', 'rxjs'],
          exports: [],
        },
        'src/b.ts': {
          id: 'src/b.ts',
          path: 'src/b.ts',
          name: 'b.ts',
          type: 'file',
          size: 200,
          extension: 'ts',
          imports: ['./c'],
          exports: [],
        },
        'src/c.ts': {
          id: 'src/c.ts',
          path: 'src/c.ts',
          name: 'c.ts',
          type: 'file',
          size: 300,
          extension: 'ts',
          imports: [],
          exports: [],
        },
      };

      const { edges, adjacencyList } = buildDependencyEdges(filePaths, fileNodes);

      expect(edges.length).toBe(2);
      expect(edges).toContainEqual({
        id: 'src/a.ts->src/b.ts',
        source: 'src/a.ts',
        target: 'src/b.ts',
        type: 'import',
        label: './b',
      });
      expect(edges).toContainEqual({
        id: 'src/b.ts->src/c.ts',
        source: 'src/b.ts',
        target: 'src/c.ts',
        type: 'import',
        label: './c',
      });

      expect(adjacencyList['src/a.ts']).toEqual(['src/b.ts']);
      expect(adjacencyList['src/b.ts']).toEqual(['src/c.ts']);
      expect(adjacencyList['src/c.ts']).toEqual([]);
    });
  });

  describe('buildDirectoryTree and countDirectories', () => {
    it('constructs a nested file and directory hierarchy with aggregate sizes', () => {
      const fileNodes: Record<string, CodeFileNode> = {
        'src/index.ts': {
          id: 'src/index.ts',
          path: 'src/index.ts',
          name: 'index.ts',
          type: 'file',
          size: 150,
          extension: 'ts',
          imports: [],
          exports: [],
        },
        'src/components/header.ts': {
          id: 'src/components/header.ts',
          path: 'src/components/header.ts',
          name: 'header.ts',
          type: 'file',
          size: 250,
          extension: 'ts',
          imports: [],
          exports: [],
        },
      };

      const tree = buildDirectoryTree(fileNodes, 'Demo Project');

      expect(tree.name).toBe('Demo Project');
      expect(tree.type).toBe('directory');
      expect(tree.size).toBe(400);

      const srcDir = tree.children?.find((c) => c.name === 'src');
      expect(srcDir).toBeDefined();
      expect(srcDir?.size).toBe(400);

      const componentsDir = srcDir?.children?.find((c) => c.name === 'components');
      expect(componentsDir).toBeDefined();
      expect(componentsDir?.size).toBe(250);

      const totalDirs = countDirectories(tree);
      // Root (1) + src (1) + components (1) = 3 directories
      expect(totalDirs).toBe(3);
    });
  });

  describe('calculateStats', () => {
    it('computes language breakdown, top imported files, and summary metrics', () => {
      const filePaths = ['src/a.ts', 'src/b.ts', 'src/c.js'];
      const fileNodes: Record<string, CodeFileNode> = {
        'src/a.ts': { id: 'src/a.ts', path: 'src/a.ts', name: 'a.ts', type: 'file', size: 100, extension: 'ts', imports: [], exports: [] },
        'src/b.ts': { id: 'src/b.ts', path: 'src/b.ts', name: 'b.ts', type: 'file', size: 200, extension: 'ts', imports: [], exports: [] },
        'src/c.js': { id: 'src/c.js', path: 'src/c.js', name: 'c.js', type: 'file', size: 300, extension: 'js', imports: [], exports: [] },
      };
      const edges = [
        { id: '1', source: 'src/a.ts', target: 'src/c.js', type: 'import' as const },
        { id: '2', source: 'src/b.ts', target: 'src/c.js', type: 'import' as const },
      ];
      const rootNode: CodeFileNode = { id: 'root', path: '', name: 'root', type: 'directory', size: 600, extension: '', imports: [], exports: [] };

      const stats = calculateStats(filePaths, fileNodes, edges, rootNode, [], []);

      expect(stats.totalFiles).toBe(3);
      expect(stats.totalSize).toBe(600);
      expect(stats.languageBreakdown['ts']).toBe(2);
      expect(stats.languageBreakdown['js']).toBe(1);
      expect(stats.topImportedFiles[0]).toEqual({ path: 'src/c.js', count: 2 });
      expect(stats.codeHealth).toBeDefined();
      expect(stats.codeHealth?.averageMaintainabilityIndex).toBeGreaterThanOrEqual(0);
    });
  });
});
