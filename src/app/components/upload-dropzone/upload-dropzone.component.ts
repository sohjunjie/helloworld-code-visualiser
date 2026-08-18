import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';
import { ExportDemoService } from '../../services/export-demo.service';

@Component({
  selector: 'app-upload-dropzone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-dropzone.component.html',
  styleUrl: './upload-dropzone.component.css',
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
