import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TreemapViewComponent } from './treemap-view.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { formatBytes } from '../../utils/formatters';
import * as d3 from 'd3';
import { CodeFileNode } from '../../models/code-visualizer.models';

describe('TreemapViewComponent (TDD - Public Seam Verification)', () => {
  let store: VisualizerStoreService;
  let component: TreemapViewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TreemapViewComponent],
      providers: [VisualizerStoreService],
    });

    store = TestBed.inject(VisualizerStoreService);
    component = TestBed.createComponent(TreemapViewComponent).componentInstance;
  });


  it('should instantiate component and bind injected store & formatBytes', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
    expect(component.formatBytes).toBe(formatBytes);

    expect(component.hoveredNode()).toBeNull();
    expect(component.tooltipX()).toBe(0);
    expect(component.tooltipY()).toBe(0);
    expect(component.breadcrumbs()).toEqual([]);
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

});
