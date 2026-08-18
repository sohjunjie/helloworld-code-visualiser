import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualizerStoreService } from '../../services/visualizer-store.service';

@Component({
  selector: 'app-progress-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-modal.component.html',
  styleUrl: './progress-modal.component.css',
})
export class ProgressModalComponent {
  readonly store = inject(VisualizerStoreService);
}
