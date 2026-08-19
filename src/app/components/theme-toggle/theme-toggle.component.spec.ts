import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../services/theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let themeService: ThemeService;

  beforeEach(() => {
    themeService = new ThemeService();
    const injector = createEnvironmentInjector(
      [{ provide: ThemeService, useValue: themeService }],
      null as any
    );

    runInInjectionContext(injector, () => {
      component = new ThemeToggleComponent();
    });
  });

  it('should create theme toggle component', () => {
    expect(component).toBeTruthy();
    expect(component.theme).toBe(themeService);
  });

  it('should toggle theme when toggleTheme is called', () => {
    themeService.setDarkMode(true);
    expect(themeService.isDarkMode()).toBe(true);

    component.toggleTheme();
    expect(themeService.isDarkMode()).toBe(false);

    component.toggleTheme();
    expect(themeService.isDarkMode()).toBe(true);
  });
});
