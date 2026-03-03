import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

type ToastActionData = {
  actionLabel: string;
  actionUsed: boolean;
  action: () => void;
};

@Injectable({
  providedIn: 'root',
})
export class UiFeedbackService {
  private readonly messageService = inject(MessageService);
  private readonly toastKey = 'app';

  showAdd(productName: string): void {
    this.messageService.clear(this.toastKey); // Prevent stacking
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
      data: undo ? this.createSingleUseAction('Annulla', undo) : undefined,
    });
  }

  showQuantityUpdated(productName: string, qty: number): void {
    this.messageService.add({
      key: this.toastKey,
      severity: 'info',
      summary: 'Quantità aggiornata',
      detail: `${productName} x${qty}`,
      life: 1800,
    });
  }

  showCartCleared(undo?: () => void): void {
    this.messageService.add({
      key: this.toastKey,
      severity: 'warn',
      summary: 'Carrello svuotato',
      detail: 'Tutti i prodotti sono stati rimossi.',
      life: 4000,
      data: undo ? this.createSingleUseAction('Ripristina', undo) : undefined,
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

  showSessionExpired(): void {
    this.messageService.add({
      key: this.toastKey,
      severity: 'warn',
      summary: 'Sessione scaduta',
      detail: 'Accedi di nuovo per continuare.',
      life: 3500,
    });
  }

  private createSingleUseAction(
    actionLabel: string,
    actionCallback: () => void,
  ): ToastActionData {
    const data: ToastActionData = {
      actionLabel,
      actionUsed: false,
      action: () => {
        if (data.actionUsed) {
          return;
        }

        data.actionUsed = true;
        try {
          actionCallback();
        } finally {
          this.messageService.clear(this.toastKey);
        }
      },
    };

    return data;
  }
}
