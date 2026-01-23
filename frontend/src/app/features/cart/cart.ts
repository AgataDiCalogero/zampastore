import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    DividerModule,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  protected readonly cartItems$ = this.cartService.cartItems$;
  protected readonly cartTotal$ = this.cartService.cartTotal$;

  protected updateQuantity(productId: string, qty: number | null): void {
    if (qty === null) {
      return;
    }
    this.cartService.updateQuantity(productId, qty);
  }

  protected removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  protected confirmOrder(): void {
    this.cartService.clearCart();
    void this.router.navigateByUrl('/ordine-confermato');
  }
}
