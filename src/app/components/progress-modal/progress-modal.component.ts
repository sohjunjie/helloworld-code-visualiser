import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';

@Component({
  selector: 'app-progress-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (store.progressStatus()) {
      <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div class="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-5">
          <!-- Stage Icon & Title -->
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              @if (store.progressStatus()?.stage === 'error') {
                <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              } @else {
                <svg class="w-6 h-6 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
            </div>

            <div>
              <h3 class="text-lg font-bold text-slate-100">
                @if (store.progressStatus()?.stage === 'error') {
                  Analysis Error
                } @else {
                  Processing Codebase
                }
              </h3>
              <p class="text-xs text-slate-400 font-mono">
                {{ store.progressStatus()?.stage | uppercase }}
              </p>
            </div>
          </div>

          <!-- Message -->
          <p class="text-sm text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            {{ store.progressStatus()?.message }}
          </p>

          <!-- Progress Bar -->
          @if (store.progressStatus()?.stage !== 'error') {
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span class="font-bold text-sky-400">{{ store.progressStatus()?.percentage }}%</span>
              </div>
              <div class="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  class="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                  [style.width.%]="store.progressStatus()?.percentage"
                ></div>
              </div>
            </div>
          } @else {
            <button
              (click)="store.clearResult()"
              class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition border border-slate-700"
            >
              Close & Try Again
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class ProgressModalComponent {
  readonly store = inject(VisualizerStoreService);
}
