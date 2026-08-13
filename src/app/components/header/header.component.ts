import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 px-6 glass-panel flex items-center justify-between border-b border-slate-700/50 sticky top-0 z-40">
      <!-- Logo & Title -->
      <div class="flex items-center space-x-3 cursor-pointer" (click)="store.clearResult()">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            CodeVisualizer
          </h1>
          <p class="text-xs text-slate-400">AST & Dependency Architecture Engine</p>
        </div>
      </div>

      <!-- Navigation Tabs (Only visible when analysis result exists) -->
      @if (store.analysisResult()) {
        <nav class="flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/60">
          <button
            (click)="store.setActiveTab('treemap')"
            [class]="store.activeTab() === 'treemap' ? 'bg-sky-500/20 text-sky-400 font-semibold border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border-transparent'"
            class="px-3.5 py-1.5 text-xs rounded-lg transition border flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Folder Treemap</span>
          </button>

          <button
            (click)="store.setActiveTab('graph')"
            [class]="store.activeTab() === 'graph' ? 'bg-sky-500/20 text-sky-400 font-semibold border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border-transparent'"
            class="px-3.5 py-1.5 text-xs rounded-lg transition border flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Dependency Graph</span>
          </button>

          <button
            (click)="store.setActiveTab('architecture')"
            [class]="store.activeTab() === 'architecture' ? 'bg-sky-500/20 text-sky-400 font-semibold border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border-transparent'"
            class="px-3.5 py-1.5 text-xs rounded-lg transition border flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Architecture</span>
          </button>

          <button
            (click)="store.setActiveTab('inspector')"
            [class]="store.activeTab() === 'inspector' ? 'bg-sky-500/20 text-sky-400 font-semibold border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border-transparent'"
            class="px-3.5 py-1.5 text-xs rounded-lg transition border flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 10-4.243-4.242 3 3 0 004.243 4.242z" />
            </svg>
            <span>Code Inspector</span>
          </button>
        </nav>
      }

      <!-- Controls & Actions -->
      <div class="flex items-center space-x-3">
        <!-- Demo Projects Selector -->
        <div class="relative group">
          <button class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition">
            <span>Demo Projects</span>
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div class="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 border border-slate-700/80 hidden group-hover:block group-focus-within:block z-50">
            <p class="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">Select Sample Codebase</p>
            @for (demo of demoService.getDemoProjects(); track demo.id) {
              <button
                (click)="store.analyzeDemoProject(demo)"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-500/10 hover:text-sky-400 text-slate-300 text-xs transition border border-transparent hover:border-sky-500/20 mb-1"
              >
                <div class="font-semibold">{{ demo.name }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ demo.description }}</div>
              </button>
            }
          </div>
        </div>

        <!-- Export JSON Report (When result available) -->
        @if (store.analysisResult()) {
          <button
            (click)="exportReport()"
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition flex items-center space-x-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Report</span>
          </button>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly store = inject(VisualizerStoreService);
  readonly demoService = inject(ExportDemoService);

  exportReport() {
    const res = this.store.analysisResult();
    if (res) {
      this.demoService.downloadJSON(res);
    }
  }
}
