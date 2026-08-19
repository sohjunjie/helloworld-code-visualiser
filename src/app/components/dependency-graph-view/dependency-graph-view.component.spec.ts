import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { DependencyGraphViewComponent } from './dependency-graph-view.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ThemeService } from '../../services/theme.service';
import { ExportDemoService } from '../../services/export-demo.service';

describe('DependencyGraphViewComponent (TDD - Public Seam Verification)', () => {
  let store: VisualizerStoreService;
  let themeService: ThemeService;
  let demoService: ExportDemoService;
  let component: DependencyGraphViewComponent;

  beforeEach(() => {
    themeService = new ThemeService();
    store = new VisualizerStoreService(themeService);
    demoService = new ExportDemoService();

    const injector = createEnvironmentInjector(
      [
        { provide: VisualizerStoreService, useValue: store },
        { provide: ThemeService, useValue: themeService },
        { provide: ExportDemoService, useValue: demoService },
      ],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new DependencyGraphViewComponent();
    });
  });


  it('should instantiate component and bind dependencies', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
    expect(component.demoService).toBe(demoService);
  });

  it('should update store search query when onSearchChange is called', () => {
    const setSearchQuerySpy = vi.spyOn(store, 'setSearchQuery');

    component.onSearchChange('HeaderComponent');

    expect(setSearchQuerySpy).toHaveBeenCalledWith('HeaderComponent');
    expect(store.searchQuery()).toBe('HeaderComponent');
  });

  it('should update store layout when setLayout is called', () => {
    const setLayoutSpy = vi.spyOn(store, 'setLayout');

    component.setLayout('cose');

    expect(setLayoutSpy).toHaveBeenCalledWith('cose');
    expect(store.selectedLayout()).toBe('cose');
  });

  it('should update directory filter when onDirectoryChange is called', () => {
    const setDirSpy = vi.spyOn(store, 'setGraphDirectoryFilter');

    component.onDirectoryChange('src/app/services');

    expect(setDirSpy).toHaveBeenCalledWith('src/app/services');
    expect(store.graphDirectoryFilter()).toBe('src/app/services');
  });

  it('should update extension filter when onExtensionChange is called', () => {
    const setExtSpy = vi.spyOn(store, 'setGraphExtensionFilter');

    component.onExtensionChange('ts');

    expect(setExtSpy).toHaveBeenCalledWith('ts');
    expect(store.graphExtensionFilter()).toBe('ts');
  });

  it('should toggle neighborhood focus mode for a node', () => {
    const setFocusSpy = vi.spyOn(store, 'setNeighborhoodFocus');

    component.toggleNeighborhoodFocus('src/app/app.component.ts');
    expect(setFocusSpy).toHaveBeenCalledWith('src/app/app.component.ts');
    expect(store.neighborhoodFocusNodeId()).toBe('src/app/app.component.ts');

    // Toggling the same node should reset focus to null
    component.toggleNeighborhoodFocus('src/app/app.component.ts');
    expect(setFocusSpy).toHaveBeenCalledWith(null);
    expect(store.neighborhoodFocusNodeId()).toBeNull();
  });

  it('should clear all filters when clearAllFilters is called', () => {
    store.setSearchQuery('test');
    store.setGraphDirectoryFilter('src/app');
    store.setGraphExtensionFilter('ts');
    store.setNeighborhoodFocus('src/app/app.component.ts');

    component.clearAllFilters();

    expect(store.searchQuery()).toBe('');
    expect(store.graphDirectoryFilter()).toBe('all');
    expect(store.graphExtensionFilter()).toBe('all');
    expect(store.neighborhoodFocusNodeId()).toBeNull();
    expect(store.hasActiveFilters()).toBe(false);
  });

  it('should export SVG diagram through demoService.downloadSVG', () => {
    const downloadSvgSpy = vi.spyOn(demoService, 'downloadSVG').mockImplementation(() => {});
    
    // Mock cyInstance
    (component as any).cyInstance = {
      elements: () => ({
        boundingBox: () => ({ x1: 0, y1: 0, x2: 100, y2: 100, w: 100, h: 100 }),
      }),
      nodes: () => [],
      edges: () => [],
    };

    component.exportSvgDiagram();

    expect(downloadSvgSpy).toHaveBeenCalledTimes(1);
    expect(downloadSvgSpy).toHaveBeenCalledWith(expect.stringContaining('<svg'), 'dependency-graph.svg');
  });

  it('should apply graph filters correctly across nodes and edges in cyInstance', () => {
    const node1Classes = new Set<string>();
    const node2Classes = new Set<string>();
    const edgeClasses = new Set<string>();

    const mockNode1 = {
      id: () => 'src/app/app.component.ts',
      data: (k?: string) => ({ id: 'src/app/app.component.ts', label: 'app.component.ts', extension: 'ts' }[k || 'id']),
      addClass: vi.fn((cls: string) => node1Classes.add(cls)),
      removeClass: vi.fn((cls: string) => node1Classes.delete(cls)),
      hasClass: vi.fn((cls: string) => node1Classes.has(cls)),
    };

    const mockNode2 = {
      id: () => 'src/styles/main.css',
      data: (k?: string) => ({ id: 'src/styles/main.css', label: 'main.css', extension: 'css' }[k || 'id']),
      addClass: vi.fn((cls: string) => node2Classes.add(cls)),
      removeClass: vi.fn((cls: string) => node2Classes.delete(cls)),
      hasClass: vi.fn((cls: string) => node2Classes.has(cls)),
    };

    const mockEdge = {
      id: () => 'edge-1-2',
      source: () => mockNode1,
      target: () => mockNode2,
      data: (k?: string) => ({ id: 'edge-1-2', source: 'src/app/app.component.ts', target: 'src/styles/main.css' }[k || 'id']),
      addClass: vi.fn((cls: string) => edgeClasses.add(cls)),
      removeClass: vi.fn((cls: string) => edgeClasses.delete(cls)),
      hasClass: vi.fn((cls: string) => edgeClasses.has(cls)),
    };

    const mockCy = {
      batch: vi.fn((cb: Function) => cb()),
      nodes: vi.fn(() => [mockNode1, mockNode2]),
      edges: vi.fn(() => [mockEdge]),
      elements: vi.fn(() => ({
        boundingBox: () => ({ x1: 0, y1: 0, x2: 100, y2: 100, w: 100, h: 100 }),
      })),
    };

    (component as any).cyInstance = mockCy;

    // Filter by extension 'ts'
    store.setGraphExtensionFilter('ts');
    component.applyGraphFilters();

    expect(mockCy.batch).toHaveBeenCalled();
    expect(mockNode1.removeClass).toHaveBeenCalledWith('filtered-out');
    expect(mockNode2.addClass).toHaveBeenCalledWith('filtered-out');
    expect(mockEdge.addClass).toHaveBeenCalledWith('filtered-out');
  });
});
