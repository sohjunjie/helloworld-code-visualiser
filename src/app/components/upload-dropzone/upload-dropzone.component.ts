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
    <div class="max-w-5xl mx-auto px-4 py-12">
      <!-- Hero Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium mb-4">
          <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          <span>Client-Side AST Code Architecture Visualizer</span>
        </div>
        <h2 class="text-4xl font-extrabold text-slate-100 tracking-tight sm:text-5xl">
          Visualize Any Codebase in Seconds
        </h2>
        <p class="mt-4 text-base text-slate-400 max-w-2xl mx-auto">
          Upload your project ZIP archive to explore interactive module dependency graphs, folder treemaps, circular import warnings, and AST metrics—100% private in your browser.
        </p>
      </div>

      <!-- Main Drag and Drop Box -->
      <div
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        [class]="isDragging ? 'border-sky-400 bg-sky-500/10 scale-[1.01]' : 'border-slate-700/80 bg-slate-900/50 hover:border-slate-600'"
        class="relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 shadow-2xl glass-card cursor-pointer group"
      >
        <input
          type="file"
          accept=".zip"
          (change)="onFileSelected($event)"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-inner">
            <svg class="w-10 h-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h3 class="text-xl font-bold text-slate-200">
              Drag & Drop your Project <span class="text-sky-400">.ZIP</span> Archive
            </h3>
            <p class="text-sm text-slate-400 mt-1">
              or <span class="text-sky-400 font-semibold underline underline-offset-4">browse files</span> from your computer
            </p>
          </div>

          <div class="flex items-center space-x-3 text-xs text-slate-500 pt-2">
            <span class="flex items-center space-x-1">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>JS / TS / React / Vue / Angular</span>
            </span>
            <span>•</span>
            <span class="flex items-center space-x-1">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>Zero server upload (100% Client-Side)</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Demo Projects Section -->
      <div class="mt-12">
        <h3 class="text-xs uppercase font-bold text-slate-400 tracking-wider text-center mb-4">
          Or Test Immediately With Sample Codebases
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (demo of demoService.getDemoProjects(); track demo.id) {
            <div
              (click)="store.analyzeDemoProject(demo)"
              class="glass-panel p-5 rounded-2xl border border-slate-700/60 hover:border-sky-500/40 hover:bg-slate-800/80 cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                  {{ demo.fileCount }} files
                </span>
                <svg class="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <h4 class="text-base font-bold text-slate-200 group-hover:text-sky-300 transition">
                {{ demo.name }}
              </h4>
              <p class="text-xs text-slate-400 mt-1 line-clamp-2">
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
