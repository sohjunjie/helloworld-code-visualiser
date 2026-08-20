import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ThemeService } from '../../services/theme.service';
import { SoftwarePatternInfo } from '../../models/code-visualizer.models';
import { formatBytes, getBadgeClass } from '../../utils/formatters';

@Component({
  selector: 'app-architecture-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architecture-view.component.html',
  styleUrl: './architecture-view.component.css',
})
export class ArchitectureViewComponent {
  readonly store = inject(VisualizerStoreService);
  readonly themeService = inject(ThemeService);
  readonly formatBytes = formatBytes;
  readonly getBadgeClass = getBadgeClass;
  readonly Math = Math;

  openFile(path: string) {
    const res = this.store.analysisResult();
    if (res && res.files[path]) {
      this.store.selectNode(res.files[path]);
      this.store.setActiveTab('inspector');
    }
  }

  viewPatternDetail(pattern: SoftwarePatternInfo) {
    this.store.selectPattern(pattern);
  }

  closePatternDetail() {
    this.store.selectPattern(null);
  }
}
