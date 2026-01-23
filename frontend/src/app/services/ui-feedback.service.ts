import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class UiFeedbackService {
  private readonly messageService = inject(MessageService);
  private readonly toastKey = 'app';

  showAdd(productName: string): void {
    this.messageService.add({
      key: this.toastKey,
      severity: 'success',
      summary: 'Aggiunto al carrello',
      detail: `${productName} è stato aggiunto.`,
      life: 2500,
    });
  }

  showRemove(productName: string, undo?: () => void): void {
    this.messageService.add({
      key: this.toastKey,
      severity: 'info',
      summary: 'Rimosso dal carrello',
      detail: `${productName} è stato rimosso.`,
      life: 5000,
      data: undo
        ? {
            actionLabel: 'Annulla',
            action: () => {
              undo();
              this.messageService.clear(this.toastKey);
            },
          }
        : undefined,
    });
  }

  showOrderConfirmed(): void {
    this.messageService.add({
      key: this.toastKey,
      severity: 'success',
      summary: 'Ordine confermato',
      detail: 'Grazie! Ti invieremo presto i dettagli via email.',
      life: 4000,
    });
  }
}
