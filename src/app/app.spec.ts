import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { runInInjectionContext, createEnvironmentInjector } from '@angular/core';
import { App } from './app';
import { VisualizerStoreService } from './services/visualizer-store.service';
import { ThemeService } from './services/theme.service';

describe('App Component', () => {
  it('should instantiate App component class', () => {
    const themeService = new ThemeService();
    const store = new VisualizerStoreService(themeService);
    const injector = createEnvironmentInjector(
      [
        { provide: ThemeService, useValue: themeService },
        { provide: VisualizerStoreService, useValue: store },
      ],
      null as any
    );
    runInInjectionContext(injector, () => {
      const app = new App();
      expect(app).toBeDefined();
      expect(app.store).toBeDefined();
    });
  });
});
