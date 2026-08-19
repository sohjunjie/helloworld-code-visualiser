import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { UploadDropzoneComponent } from './upload-dropzone.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';

describe('UploadDropzoneComponent (TDD - Public Seam & Behavior Verification)', () => {
  let store: VisualizerStoreService;
  let component: UploadDropzoneComponent;

  beforeEach(() => {
    store = new VisualizerStoreService();

    const injector = createEnvironmentInjector(
      [
        { provide: VisualizerStoreService, useValue: store },
      ],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new UploadDropzoneComponent();
    });
  });

  it('should instantiate component and bind dependencies', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
    expect(component.isDragging).toBe(false);
  });

  it('should set isDragging to true on onDragOver', () => {
    const dummyEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as DragEvent;

    component.onDragOver(dummyEvent);

    expect(dummyEvent.preventDefault).toHaveBeenCalled();
    expect(dummyEvent.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging).toBe(true);
  });

  it('should set isDragging to false on onDragLeave', () => {
    component.isDragging = true;

    const dummyEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as DragEvent;

    component.onDragLeave(dummyEvent);

    expect(dummyEvent.preventDefault).toHaveBeenCalled();
    expect(dummyEvent.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging).toBe(false);
  });

  it('should trigger store.analyzeZipFile when valid zip file is dropped', () => {
    const analyzeZipSpy = vi.spyOn(store, 'analyzeZipFile').mockImplementation(() => {});
    const mockFile = new File(['content'], 'project.zip', { type: 'application/zip' });

    const dummyEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [mockFile],
      },
    } as unknown as DragEvent;

    component.onDrop(dummyEvent);

    expect(component.isDragging).toBe(false);
    expect(analyzeZipSpy).toHaveBeenCalledWith(mockFile);
  });

  it('should NOT trigger store.analyzeZipFile when non-zip file is dropped', () => {
    const analyzeZipSpy = vi.spyOn(store, 'analyzeZipFile').mockImplementation(() => {});
    const mockFile = new File(['content'], 'image.png', { type: 'image/png' });

    const dummyEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [mockFile],
      },
    } as unknown as DragEvent;

    component.onDrop(dummyEvent);

    expect(analyzeZipSpy).not.toHaveBeenCalled();
  });

  it('should trigger store.analyzeZipFile when zip file is selected via input change', () => {
    const analyzeZipSpy = vi.spyOn(store, 'analyzeZipFile').mockImplementation(() => {});
    const mockFile = new File(['content'], 'codebase.zip', { type: 'application/zip' });

    const dummyEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as Event;

    component.onFileSelected(dummyEvent);

    expect(analyzeZipSpy).toHaveBeenCalledWith(mockFile);
  });
});
