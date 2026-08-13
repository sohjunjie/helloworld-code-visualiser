import { describe, it, expect, beforeEach } from 'vitest';
import { VisualizerStoreService } from './visualizer-store.service';
import { ExportDemoService } from './export-demo.service';

describe('VisualizerStoreService & ExportDemoService', () => {
  let store: VisualizerStoreService;
  let demoService: ExportDemoService;

  beforeEach(() => {
    store = new VisualizerStoreService();
    demoService = new ExportDemoService();
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

  it('should provide pre-packaged demo projects', () => {
    const demos = demoService.getDemoProjects();
    expect(demos.length).toBeGreaterThanOrEqual(3);
    expect(demos[0].name).toContain('Express');
    expect(demos[1].name).toContain('React');
  });
});
