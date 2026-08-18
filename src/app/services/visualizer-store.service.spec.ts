import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizerStoreService } from './visualizer-store.service';
import { ExportDemoService } from './export-demo.service';

describe('VisualizerStoreService & ExportDemoService', () => {
  let store: VisualizerStoreService;
  let demoService: ExportDemoService;

  beforeEach(async () => {
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
});
