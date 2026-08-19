import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly store = inject(VisualizerStoreService);
  readonly demoService = inject(ExportDemoService);

  isDemoMenuOpen = false;

  toggleDemoMenu() {
    this.isDemoMenuOpen = !this.isDemoMenuOpen;
  }

  closeDemoMenu() {
    this.isDemoMenuOpen = false;
  }

  selectDemo(demo: any) {
    this.store.analyzeDemoProject(demo);
    this.isDemoMenuOpen = false;
  }

  exportReport() {
    const res = this.store.analysisResult();
    if (res) {
      this.demoService.downloadJSON(res);
    }
  }

  onTabKeydown(event: KeyboardEvent) {
    const tabs: ('treemap' | 'graph' | 'architecture' | 'inspector')[] = [
      'treemap',
      'graph',
      'architecture',
      'inspector',
    ];
    const currentIndex = tabs.indexOf(this.store.activeTab());
    if (currentIndex === -1) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      this.store.setActiveTab(nextTab);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      this.store.setActiveTab(prevTab);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.store.setActiveTab(tabs[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.store.setActiveTab(tabs[tabs.length - 1]);
    }
  }
}
