import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule, TableModule, InputNumberModule, ButtonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly cartService = inject(CartService);
  protected readonly cartItems$ = this.cartService.items$;
  protected readonly cartTotal$ = this.cartService.total$;

  protected updateQuantity(productId: string, qty: number | null): void {
    if (qty === null) {
      return;
    }
    this.cartService.updateQuantity(productId, qty);
  }

  protected removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }
}
