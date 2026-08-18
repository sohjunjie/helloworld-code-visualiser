import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DependencyGraphViewComponent } from './dependency-graph-view.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';

describe('DependencyGraphViewComponent (TDD - Public Seam Verification)', () => {
  let store: VisualizerStoreService;
  let demoService: ExportDemoService;
  let component: DependencyGraphViewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DependencyGraphViewComponent],
      providers: [VisualizerStoreService, ExportDemoService],
    });

    store = TestBed.inject(VisualizerStoreService);
    demoService = TestBed.inject(ExportDemoService);
    component = TestBed.createComponent(DependencyGraphViewComponent).componentInstance;
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
});
