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
  cycleNodeText: string;
  focusedNodeBg: string;
  focusedNodeBorder: string;
  focusedNodeText: string;
  focusedNeighborBg: string;
  focusedNeighborBorder: string;
  focusedNeighborText: string;
  focusedEdgeColor: string;
  focusedEdgeArrowColor?: string;
  textOutlineColor?: string;
}

export interface NodeColorConfig {
  bg: string;
  border: string;
  text: string;
  accent?: string;
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
      nodeBg: isDark ? 'rgba(14, 165, 233, 0.14)' : '#f0f9ff',
      nodeBorder: isDark ? '#38bdf8' : '#0284c7',
      nodeLabelColor: isDark ? '#f8fafc' : '#0f172a',
      edgeLineColor: isDark ? 'rgba(148, 163, 184, 0.35)' : '#cbd5e1',
      edgeArrowColor: isDark ? 'rgba(148, 163, 184, 0.70)' : '#94a3b8',
      exportBg: isDark ? '#020617' : '#ffffff',
      cycleNodeBg: isDark ? 'rgba(244, 63, 94, 0.22)' : '#fff1f2',
      cycleNodeBorder: isDark ? '#f43f5e' : '#e11d48',
      cycleNodeText: isDark ? '#ffe4e6' : '#9f1239',
      focusedNodeBg: isDark ? 'rgba(168, 85, 247, 0.25)' : '#f5f3ff',
      focusedNodeBorder: isDark ? '#c084fc' : '#7c3aed',
      focusedNodeText: isDark ? '#faf5ff' : '#4c1d95',
      focusedNeighborBg: isDark ? 'rgba(56, 189, 248, 0.18)' : '#e0f2fe',
      focusedNeighborBorder: isDark ? '#38bdf8' : '#0284c7',
      focusedNeighborText: isDark ? '#f0f9ff' : '#0369a1',
      focusedEdgeColor: isDark ? '#c084fc' : '#8b5cf6',
      focusedEdgeArrowColor: isDark ? '#e879f9' : '#7c3aed',
      textOutlineColor: 'transparent',
    };
  }

  /**
   * Returns paired background, border, and text colors for directory graph nodes.
   */
  getDirectoryNodeColorConfig(isCycle = false, isExternal = false): NodeColorConfig {
    const isDark = this.isDarkMode();
    if (isCycle) {
      return {
        bg: isDark ? 'rgba(244, 63, 94, 0.22)' : '#fff1f2',
        border: isDark ? '#f43f5e' : '#e11d48',
        text: isDark ? '#ffe4e6' : '#9f1239',
        accent: isDark ? '#f43f5e' : '#e11d48',
      };
    }
    if (isExternal) {
      return {
        bg: isDark ? 'rgba(100, 116, 139, 0.15)' : '#f8fafc',
        border: isDark ? '#64748b' : '#94a3b8',
        text: isDark ? '#cbd5e1' : '#475569',
        accent: isDark ? '#64748b' : '#94a3b8',
      };
    }
    return {
      bg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#eff6ff',
      border: isDark ? '#60a5fa' : '#2563eb',
      text: isDark ? '#eff6ff' : '#1e40af',
      accent: isDark ? '#3b82f6' : '#2563eb',
    };
  }


  /**
   * Returns paired background, border, and text colors for graph nodes based on file extension and cycle state.
   */
  getNodeColorConfig(extension?: string, isCycle = false): NodeColorConfig {
    const isDark = this.isDarkMode();
    if (isCycle) {
      return {
        bg: isDark ? 'rgba(244, 63, 94, 0.22)' : '#fff1f2',
        border: isDark ? '#f43f5e' : '#e11d48',
        text: isDark ? '#ffe4e6' : '#9f1239',
        accent: isDark ? '#f43f5e' : '#e11d48',
      };
    }

    const ext = (extension || '').toLowerCase().replace(/^\./, '');
    switch (ext) {
      case 'ts':
      case 'tsx':
        return {
          bg: isDark ? 'rgba(14, 165, 233, 0.14)' : '#f0f9ff',
          border: isDark ? '#38bdf8' : '#0284c7',
          text: isDark ? '#f0f9ff' : '#0369a1',
          accent: isDark ? '#38bdf8' : '#0284c7',
        };
      case 'js':
      case 'jsx':
      case 'mjs':
      case 'cjs':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.14)' : '#fffbeb',
          border: isDark ? '#fbbf24' : '#d97706',
          text: isDark ? '#fefce8' : '#92400e',
          accent: isDark ? '#fbbf24' : '#d97706',
        };
      case 'css':
      case 'scss':
      case 'sass':
      case 'less':
      case 'pcss':
        return {
          bg: isDark ? 'rgba(192, 132, 252, 0.14)' : '#faf5ff',
          border: isDark ? '#c084fc' : '#9333ea',
          text: isDark ? '#faf5ff' : '#6b21a8',
          accent: isDark ? '#c084fc' : '#9333ea',
        };
      case 'html':
      case 'svg':
      case 'vue':
      case 'svelte':
        return {
          bg: isDark ? 'rgba(251, 146, 60, 0.14)' : '#fff7ed',
          border: isDark ? '#fb923c' : '#ea580c',
          text: isDark ? '#fff7ed' : '#9a3412',
          accent: isDark ? '#fb923c' : '#ea580c',
        };
      case 'json':
      case 'yaml':
      case 'yml':
      case 'toml':
      case 'xml':
        return {
          bg: isDark ? 'rgba(52, 211, 153, 0.14)' : '#ecfdf5',
          border: isDark ? '#34d399' : '#059669',
          text: isDark ? '#f0fdf4' : '#065f46',
          accent: isDark ? '#34d399' : '#059669',
        };
      case 'md':
      case 'mdx':
      case 'txt':
      case 'doc':
        return {
          bg: isDark ? 'rgba(45, 212, 191, 0.14)' : '#f0fdfa',
          border: isDark ? '#2dd4bf' : '#0d9488',
          text: isDark ? '#f0fdfa' : '#115e59',
          accent: isDark ? '#2dd4bf' : '#0d9488',
        };
      default:
        return {
          bg: isDark ? 'rgba(148, 163, 184, 0.14)' : '#f8fafc',
          border: isDark ? '#94a3b8' : '#64748b',
          text: isDark ? '#f8fafc' : '#1e293b',
          accent: isDark ? '#94a3b8' : '#64748b',
        };
    }
  }

  /**
   * Returns file extension color mapping.
   */
  getFileExtensionColor(ext: string): string {
    return this.getNodeColorConfig(ext).accent || this.getNodeColorConfig(ext).border;
  }

  /**
   * Returns color along a complexity gradient (green for low complexity to red for high complexity).
   */
  getComplexityColor(complexity: number): string {
    if (complexity <= 5) return '#10b981'; // Low (Emerald)
    if (complexity <= 15) return '#f59e0b'; // Moderate (Amber)
    if (complexity <= 30) return '#f97316'; // High (Orange)
    return '#ef4444'; // Critical (Red)
  }

  /**
   * Returns badge style class for maintainability index (0-100).
   */
  getMaintainabilityBadgeClass(score: number): string {
    if (score >= 80) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
    }
    if (score >= 60) {
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
    }
    return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30';
  }

  /**
   * Returns badge style class for cyclomatic complexity.
   */
  getComplexityBadgeClass(complexity: number): string {
    if (complexity <= 5) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
    }
    if (complexity <= 15) {
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
    }
    if (complexity <= 30) {
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30';
    }
    return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30';
  }
}

