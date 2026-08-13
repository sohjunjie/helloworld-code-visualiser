import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';

@Component({
  selector: 'app-inspector-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
      @if (store.selectedNode(); as node) {
        <!-- Header Info Card -->
        <div class="glass-panel p-4 rounded-2xl border border-slate-700/60 space-y-3">
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <span>{{ node.extension | uppercase }} File</span>
            </div>
            <span class="text-xs text-slate-400 font-mono">{{ formatBytes(node.size) }}</span>
          </div>

          <h3 class="text-base font-bold text-slate-100 font-mono break-all">{{ node.path }}</h3>

          <!-- AST Metrics Summary -->
          @if (node.astSummary; as ast) {
            <div class="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div class="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">Lines</div>
                <div class="font-bold text-sky-400">{{ ast.totalLines }}</div>
              </div>
              <div class="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">Imports</div>
                <div class="font-bold text-indigo-400">{{ ast.importCount }}</div>
              </div>
              <div class="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">Exports</div>
                <div class="font-bold text-emerald-400">{{ ast.exportCount }}</div>
              </div>
              <div class="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div class="text-[10px] text-slate-400">Functions</div>
                <div class="font-bold text-amber-400">{{ ast.functionCount || 0 }}</div>
              </div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <!-- Source Code Viewer -->
          <div class="lg:col-span-2 glass-card rounded-3xl p-4 border border-slate-800 flex flex-col space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
              <span>Source Code Preview</span>
              <span class="font-mono text-slate-500">{{ node.name }}</span>
            </div>

            <div class="flex-1 overflow-auto bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
              <pre class="whitespace-pre-wrap break-all"><code>{{ node.content || '// No source content available' }}</code></pre>
            </div>
          </div>

          <!-- Dependency Relational Lists -->
          <div class="space-y-4">
            <!-- Outgoing Imports (Files this node imports) -->
            <div class="glass-panel p-4 rounded-2xl border border-slate-700/60 space-y-2">
              <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider">Imports ({{ node.imports.length }})</h4>
              <div class="space-y-1 max-h-48 overflow-y-auto">
                @for (imp of node.imports; track imp) {
                  <div class="p-2 bg-slate-900/60 rounded-lg text-xs font-mono text-slate-300 border border-slate-800 truncate">
                    {{ imp }}
                  </div>
                }
                @if (node.imports.length === 0) {
                  <p class="text-xs text-slate-500 italic">No outgoing module imports.</p>
                }
              </div>
            </div>

            <!-- Incoming Importers (Files importing this node) -->
            <div class="glass-panel p-4 rounded-2xl border border-slate-700/60 space-y-2">
              <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Imported By</h4>
              <div class="space-y-1 max-h-48 overflow-y-auto">
                @for (importer of getImporters(node.path); track importer) {
                  <div
                    (click)="openFile(importer)"
                    class="p-2 bg-slate-900/60 hover:bg-slate-800 rounded-lg text-xs font-mono text-sky-300 border border-slate-800 cursor-pointer truncate transition"
                  >
                    {{ importer }}
                  </div>
                }
                @if (getImporters(node.path).length === 0) {
                  <p class="text-xs text-slate-500 italic">No incoming file imports (Possible entry point).</p>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="h-full flex items-center justify-center text-slate-500 text-sm">
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
