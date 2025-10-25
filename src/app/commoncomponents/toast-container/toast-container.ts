import { Component } from '@angular/core';
import { ToastService } from '../../services/toastservice/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true, // Ensure standalone is set
  imports: [CommonModule], // CommonModule is correctly imported
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  constructor(public toastService: ToastService) {}
}