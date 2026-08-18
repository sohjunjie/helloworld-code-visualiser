import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { ProgressModalComponent } from './progress-modal.component';
import { VisualizerStoreService } from '../../services/visualizer-store.service';

describe('ProgressModalComponent (TDD - Public Seam Verification)', () => {
  let store: VisualizerStoreService;
  let component: ProgressModalComponent;

  beforeEach(() => {
    store = new VisualizerStoreService();

    const injector = createEnvironmentInjector(
      [{ provide: VisualizerStoreService, useValue: store }],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new ProgressModalComponent();
    });
  });

  it('should instantiate component and bind injected store', () => {
    expect(component).toBeDefined();
    expect(component.store).toBe(store);
  });
});
