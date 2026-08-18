import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { formatBytes } from '../../utils/formatters';

@Component({
  selector: 'app-inspector-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inspector-sidebar.component.html',
  styleUrl: './inspector-sidebar.component.css',
})
export class InspectorSidebarComponent {
  readonly store = inject(VisualizerStoreService);
  readonly formatBytes = formatBytes;

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
}
