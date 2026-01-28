import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

type StripeTestCard = {
  number: string;
  title: string;
  description: string;
  tone: 'success' | 'warning' | 'danger';
};

@Component({
  selector: 'app-stripe-test-cards',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './stripe-test-cards.html',
  styleUrl: './stripe-test-cards.scss',
})
export class StripeTestCards {
  protected readonly cards: StripeTestCard[] = [
    {
      number: '4242 4242 4242 4242',
      title: 'Pagamento riuscito',
      description: 'Carta test standard per transazioni ok.',
      tone: 'success',
    },
    {
      number: '4000 0000 0000 9995',
      title: 'Pagamento rifiutato',
      description: 'Simula una carta rifiutata dal circuito.',
      tone: 'danger',
    },
    {
      number: '4000 0025 0000 3155',
      title: 'Autenticazione 3D Secure',
      description: 'Richiede passaggio di autenticazione.',
      tone: 'warning',
    },
  ];

  protected readonly copied = signal<string | null>(null);

  protected async copyNumber(number: string): Promise<void> {
    const text = number.replace(/\s+/g, ' ');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.copied.set(number);
      window.setTimeout(() => this.copied.set(null), 1800);
    } catch {
      this.copied.set(null);
    }
  }
}
