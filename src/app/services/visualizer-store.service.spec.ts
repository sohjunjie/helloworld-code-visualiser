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

    if (!globalThis.document) {
      const classListSet = new Set<string>();
      (globalThis as any).document = {
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
});
