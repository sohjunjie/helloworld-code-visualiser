import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { InspectorSidebarComponent } from './inspector-sidebar.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { AnalysisResult, CodeFileNode } from '../../models/code-visualizer.models';
import { formatBytes } from '../../utils/formatters';

describe('InspectorSidebarComponent (TDD - Public Seam & Behavior Verification)', () => {
  let store: VisualizerStoreService;
  let component: InspectorSidebarComponent;

  beforeEach(() => {
    store = new VisualizerStoreService();

    const injector = createEnvironmentInjector(
      [{ provide: VisualizerStoreService, useValue: store }],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new InspectorSidebarComponent();
    });
  });

  it('should instantiate component and bind dependencies', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
    expect(component.formatBytes).toBe(formatBytes);
  });

  describe('getImporters', () => {
    it('should return empty array if store has no analysis result', () => {
      store.clearResult();

      const importers = component.getImporters('src/app/app.component.ts');

      expect(importers).toEqual([]);
    });

    it('should return array of file paths that import the target path', () => {
      const mockResult: AnalysisResult = {
        projectName: 'Test Project',
        rootNode: { id: 'root', path: '/', name: 'root', type: 'directory', size: 0, extension: '', imports: [], exports: [] },
        files: {},
        edges: [
          { id: 'e1', source: 'src/app/header/header.component.ts', target: 'src/app/services/store.service.ts', type: 'import' },
          { id: 'e2', source: 'src/app/footer/footer.component.ts', target: 'src/app/services/store.service.ts', type: 'import' },
          { id: 'e3', source: 'src/app/header/header.component.ts', target: 'src/app/models/model.ts', type: 'import' },
        ],
        stats: {
          totalFiles: 3,
          totalDirectories: 1,
          totalSize: 500,
          circularDependencies: [],
          languageBreakdown: {},
          topImportedFiles: [],
          detectedPatterns: []
        },
      };

      store.analysisResult.set(mockResult);

      const importers = component.getImporters('src/app/services/store.service.ts');

      expect(importers).toEqual([
        'src/app/header/header.component.ts',
        'src/app/footer/footer.component.ts'
      ]);
    });
  });

  describe('openFile', () => {
    it('should do nothing if path is not found in store files map', () => {
      const selectNodeSpy = vi.spyOn(store, 'selectNode');
      store.clearResult();

      component.openFile('nonexistent/path.ts');

      expect(selectNodeSpy).not.toHaveBeenCalled();
    });

    it('should select node when valid file path is passed to openFile', () => {
      const mockNode: CodeFileNode = {
        id: 'node-1',
        path: 'src/app/app.component.ts',
        name: 'app.component.ts',
        type: 'file',
        size: 512,
        extension: 'ts',
        imports: [],
        exports: []
      };

      const mockResult: AnalysisResult = {
        projectName: 'Test Project',
        rootNode: { id: 'root', path: '/', name: 'root', type: 'directory', size: 0, extension: '', imports: [], exports: [] },
        files: {
          'src/app/app.component.ts': mockNode
        },
        edges: [],
        stats: {
          totalFiles: 1,
          totalDirectories: 1,
          totalSize: 512,
          circularDependencies: [],
          languageBreakdown: {},
          topImportedFiles: [],
          detectedPatterns: []
        },
      };

      store.analysisResult.set(mockResult);

      component.openFile('src/app/app.component.ts');

      expect(store.selectedNode()).toEqual(mockNode);
    });
  });
});
