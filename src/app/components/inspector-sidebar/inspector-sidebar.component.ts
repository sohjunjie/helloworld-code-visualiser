import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';

@Component({
  selector: 'app-inspector-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-4 space-y-4 overflow-y-auto animate-slide-left">
      @if (store.selectedNode(); as node) {
        <!-- Header Info Card -->
        <div class="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-xl space-y-3">
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold font-mono">
              <span>{{ node.extension | uppercase }} File</span>
            </div>
            <span class="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{{ formatBytes(node.size) }}</span>
          </div>

          <h3 class="text-sm font-bold text-slate-100 font-mono break-all">{{ node.path }}</h3>

          <!-- AST Metrics Summary -->
          @if (node.astSummary; as ast) {
            <div class="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div class="bg-slate-900/80 p-2 rounded-xl border border-slate-800 shadow">
                <div class="text-[10px] text-slate-400">Lines</div>
                <div class="font-bold text-sky-400 text-sm mt-0.5">{{ ast.totalLines }}</div>
              </div>
              <div class="bg-slate-900/80 p-2 rounded-xl border border-slate-800 shadow">
                <div class="text-[10px] text-slate-400">Imports</div>
                <div class="font-bold text-indigo-400 text-sm mt-0.5">{{ ast.importCount }}</div>
              </div>
              <div class="bg-slate-900/80 p-2 rounded-xl border border-slate-800 shadow">
                <div class="text-[10px] text-slate-400">Exports</div>
                <div class="font-bold text-emerald-400 text-sm mt-0.5">{{ ast.exportCount }}</div>
              </div>
              <div class="bg-slate-900/80 p-2 rounded-xl border border-slate-800 shadow">
                <div class="text-[10px] text-slate-400">Functions</div>
                <div class="font-bold text-amber-400 text-sm mt-0.5">{{ ast.functionCount || 0 }}</div>
              </div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <!-- Source Code Viewer -->
          <div class="lg:col-span-2 glass-card rounded-3xl p-4 border border-slate-800 shadow-xl flex flex-col space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
              <span class="flex items-center space-x-1.5 text-sky-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                <span>Source Code Preview</span>
              </span>
              <span class="font-mono text-slate-400 text-[11px]">{{ node.name }}</span>
            </div>

            <div class="flex-1 overflow-auto bg-slate-950/90 p-4 rounded-2xl border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
              <pre class="whitespace-pre-wrap break-all"><code>{{ node.content || '// No source content available' }}</code></pre>
            </div>
          </div>

          <!-- Dependency Relational Lists -->
          <div class="space-y-4">
            <!-- Outgoing Imports (Files this node imports) -->
            <div class="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-lg space-y-2">
              <h4 class="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Imports ({{ node.imports.length }})</h4>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                @for (imp of node.imports; track imp) {
                  <div class="p-2 bg-slate-900/80 rounded-xl text-xs font-mono text-slate-300 border border-slate-800 truncate shadow-sm">
                    {{ imp }}
                  </div>
                }
                @if (node.imports.length === 0) {
                  <p class="text-xs text-slate-500 italic py-1">No outgoing module imports.</p>
                }
              </div>
            </div>

            <!-- Incoming Importers (Files importing this node) -->
            <div class="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-lg space-y-2">
              <h4 class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Imported By</h4>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                @for (importer of getImporters(node.path); track importer) {
                  <div
                    (click)="openFile(importer)"
                    class="p-2 bg-slate-900/80 hover:bg-slate-800 hover:border-sky-500/50 rounded-xl text-xs font-mono text-sky-300 border border-slate-800 cursor-pointer active:scale-[0.98] transition-all truncate shadow-sm"
                  >
                    {{ importer }}
                  </div>
                }
                @if (getImporters(node.path).length === 0) {
                  <p class="text-xs text-slate-500 italic py-1">No incoming file imports (Possible entry point).</p>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="h-full flex items-center justify-center text-slate-400 text-sm">
          Select a file or node to inspect source code and AST details.
        </div>
      }
    </div>
  `,
})
export class InspectorSidebarComponent {
  readonly store = inject(VisualizerStoreService);

  getImporters(targetPath: string): string[] {
    const result = this.store.analysisResult();
    if (!result) return [];
    return result.edges.filter((e) => e.target === targetPath).map((e) => e.source);
  }

  openFile(path: string) {
    const res = this.store.analysisResult();
    if (res && res.files[path]) {
      this.store.selectNode(res.files[path]);
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
