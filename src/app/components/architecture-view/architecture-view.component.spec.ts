import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { ArchitectureViewComponent } from './architecture-view.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { AnalysisResult, CodeFileNode } from '../../models/code-visualizer.models';
import { formatBytes, getBadgeClass } from '../../utils/formatters';

describe('ArchitectureViewComponent (TDD - Public Seam & Behavior Verification)', () => {
  let store: VisualizerStoreService;
  let component: ArchitectureViewComponent;

  beforeEach(() => {
    store = new VisualizerStoreService();

    const injector = createEnvironmentInjector(
      [{ provide: VisualizerStoreService, useValue: store }],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new ArchitectureViewComponent();
    });
  });

  it('should instantiate component and bind injected store & utility formatters', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
    expect(component.formatBytes).toBe(formatBytes);
    expect(component.getBadgeClass).toBe(getBadgeClass);
  });

  describe('openFile method', () => {
    it('should do nothing if store has no active analysis result', () => {
      const selectNodeSpy = vi.spyOn(store, 'selectNode');
      const setActiveTabSpy = vi.spyOn(store, 'setActiveTab');

      store.clearResult();

      component.openFile('src/app/app.component.ts');

      expect(selectNodeSpy).not.toHaveBeenCalled();
      expect(setActiveTabSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if path is not found in analysis result files map', () => {
      const selectNodeSpy = vi.spyOn(store, 'selectNode');
      const setActiveTabSpy = vi.spyOn(store, 'setActiveTab');

      const mockResult: AnalysisResult = {
        projectName: 'Test Project',
        rootNode: { id: 'root', path: '/', name: 'root', type: 'directory', size: 0, extension: '', imports: [], exports: [] },
        files: {},
        edges: [],
        stats: {
          totalFiles: 0,
          totalDirectories: 0,
          totalSize: 0,
          circularDependencies: [],
          languageBreakdown: {},
          topImportedFiles: [],
          detectedPatterns: []
        },
      };

      store.analysisResult.set(mockResult);

      component.openFile('nonexistent/file.ts');

      expect(selectNodeSpy).not.toHaveBeenCalled();
      expect(setActiveTabSpy).not.toHaveBeenCalled();
    });

    it('should select node and set active tab to inspector when valid file path is provided', () => {
      const mockFileNode: CodeFileNode = {
        id: 'node-1',
        path: 'src/app/app.component.ts',
        name: 'app.component.ts',
        type: 'file',
        size: 1024,
        extension: 'ts',
        imports: [],
        exports: []
      };

      const mockResult: AnalysisResult = {
        projectName: 'Test Project',
        rootNode: { id: 'root', path: '/', name: 'root', type: 'directory', size: 0, extension: '', imports: [], exports: [] },
        files: {
          'src/app/app.component.ts': mockFileNode
        },
        edges: [],
        stats: {
          totalFiles: 1,
          totalDirectories: 1,
          totalSize: 1024,
          circularDependencies: [],
          languageBreakdown: {},
          topImportedFiles: [],
          detectedPatterns: []
        },
      };

      store.analysisResult.set(mockResult);

      component.openFile('src/app/app.component.ts');

      expect(store.selectedNode()).toEqual(mockFileNode);
      expect(store.activeTab()).toBe('inspector');
    });
  });
});
