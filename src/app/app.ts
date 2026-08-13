import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from './services/visualizer-store.service';
import { HeaderComponent } from './components/header/header.component';
import { UploadDropzoneComponent } from './components/upload-dropzone/upload-dropzone.component';
import { ProgressModalComponent } from './components/progress-modal/progress-modal.component';
import { TreemapViewComponent } from './components/treemap-view/treemap-view.component';
import { DependencyGraphViewComponent } from './components/dependency-graph-view/dependency-graph-view.component';
import { ArchitectureViewComponent } from './components/architecture-view/architecture-view.component';
import { InspectorSidebarComponent } from './components/inspector-sidebar/inspector-sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    UploadDropzoneComponent,
    ProgressModalComponent,
    TreemapViewComponent,
    DependencyGraphViewComponent,
    ArchitectureViewComponent,
    InspectorSidebarComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly store = inject(VisualizerStoreService);
}
