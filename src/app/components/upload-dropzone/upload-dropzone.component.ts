import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';
import { DemoProject } from '../../models/code-visualizer.models';

@Component({
  selector: 'app-upload-dropzone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <!-- Hero Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          <span>100% In-Browser Private AST Code Visualizer</span>
        </div>
        <h2 class="text-3xl font-extrabold text-slate-100 tracking-tight sm:text-4xl">
          Explore Code Architecture & Dependencies
        </h2>
        <p class="mt-3 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Upload any JavaScript or TypeScript project ZIP archive to generate interactive dependency graphs, file hierarchy treemaps, circular import loop alerts, and AST metrics.
        </p>
      </div>

      <!-- Main Drag and Drop Box -->
      <div
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        [class]="isDragging ? 'border-sky-400 bg-sky-500/15 scale-[1.01] shadow-sky-500/20' : 'border-slate-700/80 bg-slate-900/60 hover:border-sky-500/50 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-sky-500/10'"
        class="relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 shadow-xl glass-card cursor-pointer group"
      >
        <input
          type="file"
          accept=".zip"
          (change)="onFileSelected($event)"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div class="flex flex-col items-center justify-center space-y-3">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-300 shadow-inner">
            <svg class="w-8 h-8 text-sky-400 group-hover:text-sky-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h3 class="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
              Drop your project <span class="text-sky-400 font-mono">.ZIP</span> archive here
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              or <span class="text-sky-400 font-semibold underline underline-offset-4 hover:text-sky-300">click to browse</span> from your system
            </p>
          </div>

          <div class="flex items-center space-x-4 text-xs text-slate-400 pt-1">
            <span class="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>JS / TS / React / Vue / Angular</span>
            </span>
            <span class="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>Zero server upload</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Demo Projects Section -->
      <div class="mt-10">
        <h3 class="text-[11px] uppercase font-bold text-slate-400 tracking-wider text-center mb-4">
          Or Select a Sample Codebase to Test Instantly
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (demo of demoService.getDemoProjects(); track demo.id) {
            <div
              (click)="store.analyzeDemoProject(demo)"
              class="glass-panel p-4 rounded-2xl border border-slate-700/60 hover:border-sky-500/50 hover:bg-slate-800/90 hover:-translate-y-1 active:scale-[0.98] cursor-pointer transition-all duration-200 shadow-lg hover:shadow-sky-500/10 group"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 font-mono">
                  {{ demo.fileCount }} files
                </span>
                <svg class="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <h4 class="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                {{ demo.name }}
              </h4>
              <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {{ demo.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class UploadDropzoneComponent {
  readonly store = inject(VisualizerStoreService);
  readonly demoService = inject(ExportDemoService);

  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        this.store.analyzeZipFile(file);
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        this.store.analyzeZipFile(file);
      }
    }
  }
}
