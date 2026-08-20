import { describe, it, expect } from 'vitest';
import { CodeFileNode, GraphEdge } from '../models/code-visualizer.models';
import {
  computeAggregatedGraph,
  getDirectChildKey,
  getBreadcrumbsForPath,
} from './graph-aggregator';

describe('graph-aggregator', () => {
  const mockFiles: Record<string, CodeFileNode> = {
    'src/services/auth.service.ts': {
      id: 'src/services/auth.service.ts',
      path: 'src/services/auth.service.ts',
      name: 'auth.service.ts',
      type: 'file',
      size: 1200,
      extension: 'ts',
      imports: ['./user.service', '../utils/crypto'],
      exports: ['AuthService'],
    },
    'src/services/user.service.ts': {
      id: 'src/services/user.service.ts',
      path: 'src/services/user.service.ts',
      name: 'user.service.ts',
      type: 'file',
      size: 800,
      extension: 'ts',
      imports: ['../utils/crypto'],
      exports: ['UserService'],
    },
    'src/utils/crypto.ts': {
      id: 'src/utils/crypto.ts',
      path: 'src/utils/crypto.ts',
      name: 'crypto.ts',
      type: 'file',
      size: 500,
      extension: 'ts',
      imports: [],
      exports: ['hashPassword'],
    },
    'src/components/login/login.component.ts': {
      id: 'src/components/login/login.component.ts',
      path: 'src/components/login/login.component.ts',
      name: 'login.component.ts',
      type: 'file',
      size: 2000,
      extension: 'ts',
      imports: ['../../services/auth.service'],
      exports: ['LoginComponent'],
    },
    'src/components/login/login.component.html': {
      id: 'src/components/login/login.component.html',
      path: 'src/components/login/login.component.html',
      name: 'login.component.html',
      type: 'file',
      size: 600,
      extension: 'html',
      imports: [],
      exports: [],
    },
    'package.json': {
      id: 'package.json',
      path: 'package.json',
      name: 'package.json',
      type: 'file',
      size: 450,
      extension: 'json',
      imports: [],
      exports: [],
    },
  };

  const mockEdges: GraphEdge[] = [
    {
      id: 'src/services/auth.service.ts->src/services/user.service.ts',
      source: 'src/services/auth.service.ts',
      target: 'src/services/user.service.ts',
      type: 'import',
    },
    {
      id: 'src/services/auth.service.ts->src/utils/crypto.ts',
      source: 'src/services/auth.service.ts',
      target: 'src/utils/crypto.ts',
      type: 'import',
    },
    {
      id: 'src/services/user.service.ts->src/utils/crypto.ts',
      source: 'src/services/user.service.ts',
      target: 'src/utils/crypto.ts',
      type: 'import',
    },
    {
      id: 'src/components/login/login.component.ts->src/services/auth.service.ts',
      source: 'src/components/login/login.component.ts',
      target: 'src/services/auth.service.ts',
      type: 'import',
    },
  ];

  describe('getDirectChildKey', () => {
    it('returns direct top-level folder or file when currentPath is empty', () => {
      expect(getDirectChildKey('src/services/auth.service.ts', '')).toBe('src');
      expect(getDirectChildKey('package.json', '')).toBe('package.json');
    });

    it('returns immediate child folder or file under currentPath', () => {
      expect(getDirectChildKey('src/services/auth.service.ts', 'src')).toBe('src/services');
      expect(getDirectChildKey('src/components/login/login.component.ts', 'src')).toBe('src/components');
      expect(getDirectChildKey('src/components/login/login.component.ts', 'src/components')).toBe(
        'src/components/login'
      );
      expect(getDirectChildKey('src/components/login/login.component.ts', 'src/components/login')).toBe(
        'src/components/login/login.component.ts'
      );
    });

    it('returns null if filePath is outside currentPath', () => {
      expect(getDirectChildKey('package.json', 'src')).toBeNull();
      expect(getDirectChildKey('src/utils/crypto.ts', 'src/components')).toBeNull();
    });
  });

  describe('getBreadcrumbsForPath', () => {
    it('returns Root for empty or null path', () => {
      expect(getBreadcrumbsForPath(null)).toEqual([{ label: 'Root', path: null }]);
      expect(getBreadcrumbsForPath('')).toEqual([{ label: 'Root', path: null }]);
    });

    it('returns hierarchy of breadcrumbs for nested paths', () => {
      const crumbs = getBreadcrumbsForPath('src/components/login');
      expect(crumbs).toEqual([
        { label: 'Root', path: null },
        { label: 'src', path: 'src' },
        { label: 'components', path: 'src/components' },
        { label: 'login', path: 'src/components/login' },
      ]);
    });
  });

  describe('computeAggregatedGraph at Root level', () => {
    it('aggregates top-level directories and root files with weighted cross-folder edges', () => {
      const result = computeAggregatedGraph(mockFiles, mockEdges, null);

      // Top level should have "src" directory node and "package.json" file node
      const nodeIds = result.nodes.map((n) => n.id).sort();
      expect(nodeIds).toEqual(['package.json', 'src']);

      const srcNode = result.nodes.find((n) => n.id === 'src');
      expect(srcNode?.type).toBe('directory');
      expect(srcNode?.fileCount).toBe(5);
      expect(srcNode?.size).toBe(1200 + 800 + 500 + 2000 + 600);

      const pkgNode = result.nodes.find((n) => n.id === 'package.json');
      expect(pkgNode?.type).toBe('file');
      expect(pkgNode?.fileCount).toBe(1);

      // Intra-src edges are internal at the root level, so no cross-folder edges between distinct top-level items
      expect(result.edges.length).toBe(0);
    });
  });

  describe('computeAggregatedGraph at "src" level', () => {
    it('aggregates subdirectories of "src" with weighted cross-directory edges', () => {
      const result = computeAggregatedGraph(mockFiles, mockEdges, 'src');

      const nodeIds = result.nodes.map((n) => n.id).sort();
      expect(nodeIds).toEqual(['src/components', 'src/services', 'src/utils']);

      const servicesNode = result.nodes.find((n) => n.id === 'src/services');
      expect(servicesNode?.type).toBe('directory');
      expect(servicesNode?.fileCount).toBe(2);

      const utilsNode = result.nodes.find((n) => n.id === 'src/utils');
      expect(utilsNode?.type).toBe('directory');
      expect(utilsNode?.fileCount).toBe(1);

      const componentsNode = result.nodes.find((n) => n.id === 'src/components');
      expect(componentsNode?.type).toBe('directory');
      expect(componentsNode?.fileCount).toBe(2);

      // Check aggregated edges:
      // src/components -> src/services (weight: 1 from login.component.ts -> auth.service.ts)
      // src/services -> src/utils (weight: 2 from auth.service.ts -> crypto.ts AND user.service.ts -> crypto.ts)
      const edgeSummary = result.edges.map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
      }));

      expect(edgeSummary).toContainEqual({
        source: 'src/components',
        target: 'src/services',
        weight: 1,
      });

      expect(edgeSummary).toContainEqual({
        source: 'src/services',
        target: 'src/utils',
        weight: 2,
      });

      expect(result.edges.find((e) => e.source === 'src/services' && e.target === 'src/utils')?.label).toBe(
        '2 imports'
      );
    });
  });

  describe('computeAggregatedGraph drill-down with external boundaries', () => {
    it('drills down into "src/components/login" and includes external boundary dependencies', () => {
      const result = computeAggregatedGraph(mockFiles, mockEdges, 'src/components/login', {
        includeExternalBoundaries: true,
      });

      // Internal items:
      // src/components/login/login.component.ts
      // src/components/login/login.component.html
      const internalIds = result.nodes.filter((n) => !n.isExternalBoundary).map((n) => n.id).sort();
      expect(internalIds).toEqual([
        'src/components/login/login.component.html',
        'src/components/login/login.component.ts',
      ]);

      // External boundary:
      // login.component.ts imports src/services/auth.service.ts
      const externalNodes = result.nodes.filter((n) => n.isExternalBoundary);
      expect(externalNodes.length).toBeGreaterThan(0);
      expect(externalNodes.map((n) => n.id)).toContain('src/services/auth.service.ts');

      // Check external boundary edge
      const boundaryEdge = result.edges.find(
        (e) => e.source === 'src/components/login/login.component.ts' && e.target === 'src/services/auth.service.ts'
      );
      expect(boundaryEdge).toBeDefined();
      expect(boundaryEdge?.isExternal).toBe(true);
    });
  });

  describe('circular dependency propagation', () => {
    it('flags isCycle on directory node if any contained file is part of circular dependency', () => {
      const circularFiles: Record<string, CodeFileNode> = {
        'src/a/a.ts': {
          id: 'src/a/a.ts',
          path: 'src/a/a.ts',
          name: 'a.ts',
          type: 'file',
          size: 100,
          extension: 'ts',
          imports: ['../b/b.ts'],
          exports: [],
        },
        'src/b/b.ts': {
          id: 'src/b/b.ts',
          path: 'src/b/b.ts',
          name: 'b.ts',
          type: 'file',
          size: 100,
          extension: 'ts',
          imports: ['../a/a.ts'],
          exports: [],
        },
      };

      const circularEdges: GraphEdge[] = [
        { id: 'src/a/a.ts->src/b/b.ts', source: 'src/a/a.ts', target: 'src/b/b.ts', type: 'import' },
        { id: 'src/b/b.ts->src/a/a.ts', source: 'src/b/b.ts', target: 'src/a/a.ts', type: 'import' },
      ];

      const cycles = [['src/a/a.ts', 'src/b/b.ts', 'src/a/a.ts']];

      const result = computeAggregatedGraph(circularFiles, circularEdges, 'src', {
        circularDependencies: cycles,
      });

      const nodeA = result.nodes.find((n) => n.id === 'src/a');
      const nodeB = result.nodes.find((n) => n.id === 'src/b');

      expect(nodeA?.isCycle).toBe(true);
      expect(nodeB?.isCycle).toBe(true);
    });
  });
});
