import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TreemapViewComponent } from './treemap-view.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ThemeService } from '../../services/theme.service';
import { formatBytes } from '../../utils/formatters';
import * as d3 from 'd3';
import { CodeFileNode } from '../../models/code-visualizer.models';

describe('TreemapViewComponent (TDD - Public Seam Verification)', () => {
  let store: VisualizerStoreService;
  let component: TreemapViewComponent;

  beforeEach(() => {
    store = new VisualizerStoreService();
    const themeService = new ThemeService();
    const injector = createEnvironmentInjector(
      [
        { provide: VisualizerStoreService, useValue: store },
        { provide: ThemeService, useValue: themeService },
      ],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new TreemapViewComponent();
    });
  });


  it('should instantiate component and bind injected store & formatBytes', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
    expect(component.formatBytes).toBe(formatBytes);

    expect(component.hoveredNode()).toBeNull();
    expect(component.tooltipX()).toBe(0);
    expect(component.tooltipY()).toBe(0);
    expect(component.breadcrumbs()).toEqual([]);
    expect(component.sizeMetric()).toBe('bytes');
    expect(component.colorMode()).toBe('extension');
  });

  it('should toggle size metric and color mode signals', () => {
    component.setSizeMetric('loc');
    expect(component.sizeMetric()).toBe('loc');

    component.setColorMode('complexity');
    expect(component.colorMode()).toBe('complexity');

    component.setSizeMetric('bytes');
    expect(component.sizeMetric()).toBe('bytes');

    component.setColorMode('extension');
    expect(component.colorMode()).toBe('extension');
  });

  it('should update zoom state when zoomTo is invoked', () => {
    const mockNodeData: CodeFileNode = {
      id: 'folder-1',
      path: '/src',
      name: 'src',
      type: 'directory',
      size: 0,
      extension: '',
      imports: [],
      exports: [],
    };

    store.analysisResult.set({
      projectName: 'Test Project',
      rootNode: mockNodeData,
      files: {},
      edges: [],
      stats: { totalFiles: 0, totalDirectories: 1, totalSize: 0, circularDependencies: [], languageBreakdown: {}, topImportedFiles: [], detectedPatterns: [] },
    });

    const mockHierarchyNode = d3.hierarchy(mockNodeData) as d3.HierarchyRectangularNode<CodeFileNode>;

    component.zoomTo(mockHierarchyNode);

    expect(component.breadcrumbs()).toBeDefined();
  });

  it('should render treemap filling full container width and height when elements are attached', () => {
    const containerEl = document.createElement('div');
    Object.defineProperty(containerEl, 'clientWidth', { value: 1000, configurable: true });
    Object.defineProperty(containerEl, 'clientHeight', { value: 600, configurable: true });
    containerEl.getBoundingClientRect = () => ({
      width: 1000,
      height: 600,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGElement;
    component.containerRef = { nativeElement: containerEl };
    component.svgRef = { nativeElement: svgEl };

    const mockNodeData: CodeFileNode = {
      id: 'root-1',
      path: '/root',
      name: 'root',
      type: 'directory',
      size: 1024,
      extension: '',
      imports: [],
      exports: [],
      children: [
        {
          id: 'file-1',
          path: '/root/index.ts',
          name: 'index.ts',
          type: 'file',
          size: 1024,
          extension: 'ts',
          imports: [],
          exports: [],
        },
      ],
    };

    store.analysisResult.set({
      projectName: 'Test Project',
      rootNode: mockNodeData,
      files: { 'file-1': mockNodeData.children![0] },
      edges: [],
      stats: { totalFiles: 1, totalDirectories: 1, totalSize: 1024, circularDependencies: [], languageBreakdown: {}, topImportedFiles: [], detectedPatterns: [] },
    });

    component.ngAfterViewInit();

    expect(svgEl.getAttribute('viewBox')).toBe('0 0 1000 600');
    expect(svgEl.getAttribute('preserveAspectRatio')).toBe('none');
    expect(svgEl.getAttribute('width')).toBe('100%');
    expect(svgEl.getAttribute('height')).toBe('100%');
  });

  it('should clean up resize observer on ngOnDestroy', () => {
    let disconnected = false;
    (component as any).resizeObserver = {
      observe: () => {},
      disconnect: () => {
        disconnected = true;
      },
    };

    component.ngOnDestroy();
    expect(disconnected).toBe(true);
    expect((component as any).resizeObserver).toBeNull();
  });
});
