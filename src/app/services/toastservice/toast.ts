// src/app/services/common/toast.service.ts
import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  // must be public for templates to loop
  public toasts: ToastMessage[] = [];
  private nextId = 0;

  show(type: ToastType, message: string, title?: string) {
    const toast: ToastMessage = { id: this.nextId++, type, message, title };
    this.toasts.push(toast);
    setTimeout(() => this.remove(toast.id), 4000);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  clear() {
    this.toasts = [];
  }
}