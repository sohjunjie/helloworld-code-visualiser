import { Injectable, signal } from '@angular/core';
import { DemoProject, AnalysisResult } from '../models/code-visualizer.models';

@Injectable({
  providedIn: 'root',
})
export class ExportDemoService {
  readonly demoProjects = signal<DemoProject[]>([]);
  readonly isLoadingDemos = signal<boolean>(false);

  constructor() {
    this.loadDemoProjects();
  }

  async loadDemoProjects() {
    this.isLoadingDemos.set(true);
    try {
      const res = await fetch('/demo-projects/index.json');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const projects: DemoProject[] = await res.json();
      this.demoProjects.set(projects);
    } catch (err) {
      console.error('Failed to load demo projects manifest:', err);
      this.demoProjects.set([]);
    } finally {
      this.isLoadingDemos.set(false);
    }
  }

  getDemoProjects(): DemoProject[] {
    return this.demoProjects();
  }

  downloadJSON(result: AnalysisResult) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${result.projectName || 'code-analysis'}-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  downloadCanvasPNG(canvas: HTMLCanvasElement, filename = 'code-visualization.png') {
    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const link = document.createElement('a');
    link.download = filename;
    link.href = image;
    link.click();
  }
}
