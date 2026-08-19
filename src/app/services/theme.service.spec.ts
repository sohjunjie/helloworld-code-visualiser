import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; },
    });

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize theme to dark by default', () => {
    expect(service.isDarkMode()).toBe(true);
  });

  it('should toggle theme and persist to localStorage', () => {
    service.toggleDarkMode();
    expect(service.isDarkMode()).toBe(false);
    expect(mockStorage['hwcv_theme']).toBe('light');

    service.toggleDarkMode();
    expect(service.isDarkMode()).toBe(true);
    expect(mockStorage['hwcv_theme']).toBe('dark');
  });

  it('should set dark mode explicitly', () => {
    service.setDarkMode(false);
    expect(service.isDarkMode()).toBe(false);
    expect(mockStorage['hwcv_theme']).toBe('light');

    service.setDarkMode(true);
    expect(service.isDarkMode()).toBe(true);
    expect(mockStorage['hwcv_theme']).toBe('dark');
  });

  it('should return folder colors based on active theme', () => {
    service.setDarkMode(true);
    const darkColors = service.getFolderColors();
    expect(darkColors.length).toBeGreaterThan(0);
    expect(service.getFolderColorAtDepth(0)).toBe(darkColors[0]);

    service.setDarkMode(false);
    const lightColors = service.getFolderColors();
    expect(lightColors.length).toBeGreaterThan(0);
    expect(lightColors[0]).not.toBe(darkColors[0]);
  });

  it('should return Cytoscape theme configuration', () => {
    service.setDarkMode(true);
    const darkGraph = service.getGraphThemeConfig();
    expect(darkGraph.exportBg).toBe('#020617');
    expect(darkGraph.nodeLabelColor).toBe('#f8fafc');

    service.setDarkMode(false);
    const lightGraph = service.getGraphThemeConfig();
    expect(lightGraph.exportBg).toBe('#ffffff');
    expect(lightGraph.nodeLabelColor).toBe('#0f172a');
  });

  it('should return extension colors accurately', () => {
    expect(service.getFileExtensionColor('ts')).toBe('#3b82f6');
    expect(service.getFileExtensionColor('js')).toBe('#f59e0b');
    expect(service.getFileExtensionColor('css')).toBe('#a855f7');
    expect(service.getFileExtensionColor('json')).toBe('#10b981');
    expect(service.getFileExtensionColor('unknown')).toBe('#64748b');
  });
});
