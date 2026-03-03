import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

type StripeTestCard = {
  number: string;
  title: string;
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
    { number: '4242 4242 4242 4242', title: 'Pagamento riuscito' },
    { number: '4000 0000 0000 9995', title: 'Pagamento rifiutato' },
    { number: '4000 0025 0000 3155', title: 'Autenticazione 3D Secure' },
  ];

  protected readonly open = signal(false);
  protected readonly copied = signal<string | null>(null);

  protected async copyNumber(number: string): Promise<void> {
    const text = number.replaceAll(/\s+/g, ' ');
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(number);
      globalThis.setTimeout(() => this.copied.set(null), 1800);
    } catch {
      this.copied.set(null);
    }
  }
}
