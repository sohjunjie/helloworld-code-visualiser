import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HeaderComponent } from './header.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';
import { AnalysisResult } from '../../models/code-visualizer.models';

describe('HeaderComponent (TDD - Public Seam Verification)', () => {
  let store: VisualizerStoreService;
  let demoService: ExportDemoService;
  let component: HeaderComponent;

  beforeEach(() => {
    store = new VisualizerStoreService();
    demoService = new ExportDemoService();
    
    const injector = createEnvironmentInjector(
      [
        { provide: VisualizerStoreService, useValue: store },
        { provide: ExportDemoService, useValue: demoService },
      ],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new HeaderComponent();
    });
  });

  it('should instantiate component and bind injected dependencies', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
    expect(component.demoService).toBe(demoService);
  });

  it('should NOT trigger downloadJSON when exportReport is called without active analysis result', () => {
    const downloadSpy = vi.spyOn(demoService, 'downloadJSON');
    
    // Clear any result in store
    store.clearResult();
    
    component.exportReport();

    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('should trigger downloadJSON with active result when exportReport is called', () => {
    const downloadSpy = vi.spyOn(demoService, 'downloadJSON').mockImplementation(() => {});
    
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

    component.exportReport();

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledWith(mockResult);
  });
});

