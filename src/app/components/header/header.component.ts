import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
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
