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
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

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

  it('should toggle and close demo menu state', () => {
    expect(component.isDemoMenuOpen).toBe(false);
    component.toggleDemoMenu();
    expect(component.isDemoMenuOpen).toBe(true);
    component.closeDemoMenu();
    expect(component.isDemoMenuOpen).toBe(false);
  });

  it('should select demo project and close menu', () => {
    const analyzeSpy = vi.spyOn(store, 'analyzeDemoProject').mockImplementation(async () => {});
    const demo = { id: 'test', name: 'Test', description: '', filename: 'test.zip', fileCount: 2 };
    
    component.isDemoMenuOpen = true;
    component.selectDemo(demo);

    expect(analyzeSpy).toHaveBeenCalledWith(demo);
    expect(component.isDemoMenuOpen).toBe(false);
  });

  it('should handle keyboard navigation across tabs', () => {
    store.setActiveTab('treemap');
    
    component.onTabKeydown({ key: 'ArrowRight', preventDefault: vi.fn() } as any);
    expect(store.activeTab()).toBe('graph');

    component.onTabKeydown({ key: 'ArrowRight', preventDefault: vi.fn() } as any);
    expect(store.activeTab()).toBe('architecture');

    component.onTabKeydown({ key: 'ArrowRight', preventDefault: vi.fn() } as any);
    expect(store.activeTab()).toBe('inspector');

    component.onTabKeydown({ key: 'ArrowRight', preventDefault: vi.fn() } as any);
    expect(store.activeTab()).toBe('treemap');

    component.onTabKeydown({ key: 'ArrowLeft', preventDefault: vi.fn() } as any);
    expect(store.activeTab()).toBe('inspector');

    component.onTabKeydown({ key: 'Home', preventDefault: vi.fn() } as any);
    expect(store.activeTab()).toBe('treemap');

    component.onTabKeydown({ key: 'End', preventDefault: vi.fn() } as any);
    expect(store.activeTab()).toBe('inspector');
  });

  it('should close demo menu on escape key press', () => {
    component.isDemoMenuOpen = true;
    component.onEscapeKey();
    expect(component.isDemoMenuOpen).toBe(false);
  });

  it('should close demo menu on document click outside if elementRef is present', () => {
    const mockElement = {
      contains: vi.fn().mockReturnValue(false),
    };
    (component as any).elementRef = { nativeElement: mockElement };

    component.isDemoMenuOpen = true;
    component.onDocumentClick({ target: {} as any } as any);
    expect(component.isDemoMenuOpen).toBe(false);
  });

  it('should not close demo menu on document click inside element', () => {
    const mockElement = {
      contains: vi.fn().mockReturnValue(true),
    };
    (component as any).elementRef = { nativeElement: mockElement };

    component.isDemoMenuOpen = true;
    component.onDocumentClick({ target: {} as any } as any);
    expect(component.isDemoMenuOpen).toBe(true);
  });
});

