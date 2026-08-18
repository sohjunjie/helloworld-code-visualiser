import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { CodeFileNode } from '../../models/code-visualizer.models';

@Component({
  selector: 'app-architecture-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architecture-view.component.html',
  styleUrl: './architecture-view.component.css',
})
export class ArchitectureViewComponent {
  readonly store = inject(VisualizerStoreService);

  openFile(path: string) {
    const res = this.store.analysisResult();
    if (res && res.files[path]) {
      this.store.selectNode(res.files[path]);
      this.store.setActiveTab('inspector');
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getBadgeClass(colorClass: string): string {
    switch (colorClass) {
      case 'sky':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'indigo':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  }
}
