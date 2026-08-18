import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';

@Component({
  selector: 'app-inspector-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inspector-sidebar.component.html',
  styleUrl: './inspector-sidebar.component.css',
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
