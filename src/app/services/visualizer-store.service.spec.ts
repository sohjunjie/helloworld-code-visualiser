import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizerStoreService } from './visualizer-store.service';
import { ExportDemoService } from './export-demo.service';

describe('VisualizerStoreService & ExportDemoService', () => {
  let store: VisualizerStoreService;
  let demoService: ExportDemoService;
  let mockStorage: Record<string, string> = {};

  beforeEach(async () => {
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; },
    };
    (globalThis as any).localStorage = storageMock;

    if (!globalThis.document || !(globalThis.document as any).createElement) {
      const classListSet = new Set<string>();
      const mockAnchor = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
        href: '',
        download: '',
      };
      (globalThis as any).document = {
        createElement: vi.fn().mockReturnValue(mockAnchor),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
        documentElement: {
          classList: {
            add: (cls: string) => classListSet.add(cls),
            remove: (cls: string) => classListSet.delete(cls),
            contains: (cls: string) => classListSet.has(cls),
            toggle: (cls: string, force?: boolean) => {
              if (force === undefined) {
                if (classListSet.has(cls)) classListSet.delete(cls);
                else classListSet.add(cls);
              } else if (force) {
                classListSet.add(cls);
              } else {
                classListSet.delete(cls);
              }
            },
          },
        },
      };
    }

    store = new VisualizerStoreService();

    const mockManifest = [
      {
        id: 'express-rest-api-server',
        name: 'Express REST API Server',
        description: 'Node.js Express backend',
        filename: 'express-rest-api-server.zip',
        fileCount: 8,
      },
      {
        id: 'react-analytics-app',
        name: 'React Analytics App',
        description: 'React TypeScript frontend',
        filename: 'react-analytics-app.zip',
        fileCount: 8,
      },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockManifest,
    } as Response);

    demoService = new ExportDemoService();
    await demoService.loadDemoProjects();
  });

  it('should initialize with default signals state', () => {
    expect(store.analysisResult()).toBeNull();
    expect(store.activeTab()).toBe('treemap');
    expect(store.selectedLayout()).toBe('dagre');
    expect(store.isDarkMode()).toBe(true);
  });

  it('should update active tab when selected', () => {
    store.setActiveTab('graph');
    expect(store.activeTab()).toBe('graph');
    store.setActiveTab('architecture');
    expect(store.activeTab()).toBe('architecture');
  });

  it('should provide pre-packaged demo projects from manifest', () => {
    const demos = demoService.getDemoProjects();
    expect(demos.length).toBeGreaterThanOrEqual(2);
    expect(demos[0].name).toContain('Express');
    expect(demos[1].name).toContain('React');
  });

  it('should toggle dark mode and persist to localStorage', () => {
    const initial = store.isDarkMode();
    store.toggleDarkMode();
    expect(store.isDarkMode()).toBe(!initial);
    expect(localStorage.getItem('hwcv_theme')).toBe(!initial ? 'dark' : 'light');
    expect(document.documentElement.classList.contains('dark')).toBe(!initial);

    store.toggleDarkMode();
    expect(store.isDarkMode()).toBe(initial);
    expect(localStorage.getItem('hwcv_theme')).toBe(initial ? 'dark' : 'light');
  });

  it('should allow explicitly setting dark mode', () => {
    store.setDarkMode(false);
    expect(store.isDarkMode()).toBe(false);
    expect(localStorage.getItem('hwcv_theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    store.setDarkMode(true);
    expect(store.isDarkMode()).toBe(true);
    expect(localStorage.getItem('hwcv_theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should restore stored theme preference from localStorage on initialization', () => {
    localStorage.setItem('hwcv_theme', 'light');
    const newStore = new VisualizerStoreService();
    expect(newStore.isDarkMode()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    localStorage.setItem('hwcv_theme', 'dark');
    const darkStore = new VisualizerStoreService();
    expect(darkStore.isDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should manage graph filtering signals and compute active filter counts', () => {
    expect(store.graphDirectoryFilter()).toBe('all');
    expect(store.graphExtensionFilter()).toBe('all');
    expect(store.neighborhoodFocusNodeId()).toBeNull();
    expect(store.hasActiveFilters()).toBe(false);
    expect(store.activeFilterCount()).toBe(0);

    store.setSearchQuery('test');
    expect(store.hasActiveFilters()).toBe(true);
    expect(store.activeFilterCount()).toBe(1);

    store.setGraphDirectoryFilter('src/app/services');
    expect(store.graphDirectoryFilter()).toBe('src/app/services');
    expect(store.activeFilterCount()).toBe(2);

    store.setGraphExtensionFilter('ts');
    expect(store.graphExtensionFilter()).toBe('ts');
    expect(store.activeFilterCount()).toBe(3);

    store.setNeighborhoodFocus('src/app/app.component.ts');
    expect(store.neighborhoodFocusNodeId()).toBe('src/app/app.component.ts');
    expect(store.activeFilterCount()).toBe(4);

    store.clearGraphFilters();
    expect(store.searchQuery()).toBe('');
    expect(store.graphDirectoryFilter()).toBe('all');
    expect(store.graphExtensionFilter()).toBe('all');
    expect(store.neighborhoodFocusNodeId()).toBeNull();
    expect(store.hasActiveFilters()).toBe(false);
    expect(store.activeFilterCount()).toBe(0);
  });

  it('should compute available directories and extensions when analysis result is present', () => {
    store.analysisResult.set({
      projectName: 'Test App',
      rootNode: { id: 'root', path: '/', name: 'root', type: 'directory', size: 0, extension: '', imports: [], exports: [] },
      files: {
        'src/services/store.service.ts': { id: '1', path: 'src/services/store.service.ts', name: 'store.service.ts', type: 'file', size: 100, extension: 'ts', imports: [], exports: [] },
        'src/services/auth.service.ts': { id: '2', path: 'src/services/auth.service.ts', name: 'auth.service.ts', type: 'file', size: 200, extension: 'ts', imports: [], exports: [] },
        'src/styles/main.css': { id: '3', path: 'src/styles/main.css', name: 'main.css', type: 'file', size: 300, extension: 'css', imports: [], exports: [] },
        'package.json': { id: '4', path: 'package.json', name: 'package.json', type: 'file', size: 400, extension: 'json', imports: [], exports: [] },
      },
      edges: [],
      stats: { totalFiles: 4, totalDirectories: 2, totalSize: 1000, circularDependencies: [], languageBreakdown: {}, topImportedFiles: [], detectedPatterns: [] },
    });

    const dirs = store.availableDirectories();
    expect(dirs).toContain('src/services');
    expect(dirs).toContain('src/styles');

    const exts = store.availableExtensions();
    expect(exts).toEqual(
      expect.arrayContaining([
        { extension: 'ts', count: 2 },
        { extension: 'css', count: 1 },
        { extension: 'json', count: 1 },
      ])
    );
  });

  it('should support downloadSVG in demo service', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-svg-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    demoService.downloadSVG('<svg></svg>', 'test-graph.svg');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should manage graphAbstractionMode, drill-down paths and breadcrumbs', () => {
    expect(store.graphAbstractionMode()).toBe('file');
    expect(store.graphDrillDownPath()).toBeNull();
    expect(store.drillDownBreadcrumbs()).toEqual([{ label: 'Root', path: null }]);

    store.setGraphAbstractionMode('directory');
    expect(store.graphAbstractionMode()).toBe('directory');

    store.drillDown('src/components/login');
    expect(store.graphDrillDownPath()).toBe('src/components/login');
    expect(store.graphAbstractionMode()).toBe('directory');
    expect(store.drillDownBreadcrumbs()).toEqual([
      { label: 'Root', path: null },
      { label: 'src', path: 'src' },
      { label: 'components', path: 'src/components' },
      { label: 'login', path: 'src/components/login' },
    ]);

    // Drill up one level to 'src/components'
    store.drillUp();
    expect(store.graphDrillDownPath()).toBe('src/components');

    // Drill up again to 'src'
    store.drillUp();
    expect(store.graphDrillDownPath()).toBe('src');

    // Drill up again to Root (null)
    store.drillUp();
    expect(store.graphDrillDownPath()).toBeNull();

    // Direct jump via drillTo
    store.drillTo('src/services');
    expect(store.graphDrillDownPath()).toBe('src/services');

    store.resetDrillDown();
    expect(store.graphDrillDownPath()).toBeNull();
  });
});

