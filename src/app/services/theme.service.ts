import { Injectable, signal } from '@angular/core';

export interface GraphThemeConfig {
  nodeBg: string;
  nodeBorder: string;
  nodeLabelColor: string;
  edgeLineColor: string;
  edgeArrowColor: string;
  exportBg: string;
  cycleNodeBg: string;
  cycleNodeBorder: string;
  focusedNodeBg: string;
  focusedNodeBorder: string;
  focusedNeighborBorder: string;
  focusedEdgeColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly isDarkMode = signal<boolean>(true);

  /** Palette for Treemap directory hierarchy nesting */
  private readonly darkFolderColors = [
    'rgba(15, 23, 42, 0.95)',   // Depth 0: Root / workspace
    'rgba(30, 41, 59, 0.85)',   // Depth 1: Top-level src/app/
    'rgba(51, 65, 85, 0.70)',   // Depth 2: Sub-folders
    'rgba(71, 85, 105, 0.55)',  // Depth 3
    'rgba(100, 116, 139, 0.40)', // Depth 4+
  ];

  private readonly lightFolderColors = [
    'rgba(241, 245, 249, 0.95)', // Depth 0: Root (slate-100)
    'rgba(226, 232, 240, 0.85)', // Depth 1: Top-level (slate-200)
    'rgba(203, 213, 225, 0.75)', // Depth 2: (slate-300)
    'rgba(148, 163, 184, 0.50)', // Depth 3: (slate-400)
    'rgba(148, 163, 184, 0.35)', // Depth 4+
  ];

  constructor() {
    this.initTheme();
  }

  /**
   * Initializes theme preference from localStorage with fallback to OS system preferences.
   */
  initTheme() {
    let darkMode = true;
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('hwcv_theme');
      if (savedTheme === 'dark') {
        darkMode = true;
      } else if (savedTheme === 'light') {
        darkMode = false;
      } else if (typeof window !== 'undefined' && window.matchMedia) {
        darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    this.isDarkMode.set(darkMode);
    this.applyThemeToDOM(darkMode);
  }

  /**
   * Toggles theme state between dark and light.
   */
  toggleDarkMode() {
    this.setDarkMode(!this.isDarkMode());
  }

  /**
   * Sets explicit dark mode state and updates localStorage + DOM.
   */
  setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hwcv_theme', isDark ? 'dark' : 'light');
    }
    this.applyThemeToDOM(isDark);
  }

  /**
   * Applies or removes the 'dark' class on document.documentElement.
   */
  private applyThemeToDOM(isDark: boolean) {
    if (typeof document !== 'undefined' && document.documentElement) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  /**
   * Returns folder background color palette for Treemap visualization based on current theme.
   */
  getFolderColors(): string[] {
    return this.isDarkMode() ? this.darkFolderColors : this.lightFolderColors;
  }

  /**
   * Returns folder color at a specific depth level.
   */
  getFolderColorAtDepth(depth: number): string {
    const colors = this.getFolderColors();
    return colors[Math.min(depth, colors.length - 1)];
  }

  /**
   * Returns Treemap folder label and stroke styling based on active theme.
   */
  getTreemapStyles() {
    const isDark = this.isDarkMode();
    return {
      folderStroke: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.35)',
      folderLabelFill: isDark ? 'rgba(148, 163, 184, 0.9)' : 'rgba(51, 65, 85, 0.95)',
      fileStroke: isDark ? '#0f172a' : '#cbd5e1',
      fileHoverStroke: isDark ? '#38bdf8' : '#0284c7',
    };
  }

  /**
   * Returns Cytoscape graph theme styling configuration.
   */
  getGraphThemeConfig(): GraphThemeConfig {
    const isDark = this.isDarkMode();
    return {
      nodeBg: isDark ? '#38bdf8' : '#0284c7',
      nodeBorder: isDark ? '#0284c7' : '#0369a1',
      nodeLabelColor: isDark ? '#f8fafc' : '#0f172a',
      edgeLineColor: isDark ? '#475569' : '#94a3b8',
      edgeArrowColor: isDark ? '#475569' : '#94a3b8',
      exportBg: isDark ? '#020617' : '#ffffff',
      cycleNodeBg: '#f87171',
      cycleNodeBorder: '#dc2626',
      focusedNodeBg: '#a855f7',
      focusedNodeBorder: isDark ? '#c084fc' : '#9333ea',
      focusedNeighborBorder: isDark ? '#38bdf8' : '#0284c7',
      focusedEdgeColor: '#a855f7',
    };
  }

  /**
   * Returns file extension color mapping.
   */
  getFileExtensionColor(ext: string): string {
    switch (ext?.toLowerCase()) {
      case 'ts':
      case 'tsx':
        return '#3b82f6'; // Blue
      case 'js':
      case 'jsx':
      case 'mjs':
      case 'cjs':
        return '#f59e0b'; // Amber
      case 'css':
      case 'scss':
      case 'less':
      case 'html':
        return '#a855f7'; // Purple
      case 'json':
      case 'md':
      case 'yaml':
      case 'yml':
        return '#10b981'; // Emerald
      default:
        return '#64748b'; // Slate
    }
  }
}
