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

    service = new ThemeService();
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

  it('should return extension and node colors accurately', () => {
    service.setDarkMode(true);
    expect(service.getFileExtensionColor('ts')).toBe('#38bdf8');
    expect(service.getFileExtensionColor('js')).toBe('#fbbf24');
    expect(service.getFileExtensionColor('css')).toBe('#c084fc');
    expect(service.getFileExtensionColor('json')).toBe('#34d399');
    expect(service.getFileExtensionColor('unknown')).toBe('#94a3b8');

    const nodeCfg = service.getNodeColorConfig('ts');
    expect(nodeCfg.bg).toBe('rgba(14, 165, 233, 0.14)');
    expect(nodeCfg.border).toBe('#38bdf8');
    expect(nodeCfg.text).toBe('#f0f9ff');

    const cycleCfg = service.getNodeColorConfig('ts', true);
    expect(cycleCfg.bg).toBe('rgba(244, 63, 94, 0.22)');
    expect(cycleCfg.border).toBe('#f43f5e');
    expect(cycleCfg.text).toBe('#ffe4e6');

    service.setDarkMode(false);
    const lightNodeCfg = service.getNodeColorConfig('ts');
    expect(lightNodeCfg.bg).toBe('#f0f9ff');
    expect(lightNodeCfg.border).toBe('#0284c7');
    expect(lightNodeCfg.text).toBe('#0369a1');
  });
});
