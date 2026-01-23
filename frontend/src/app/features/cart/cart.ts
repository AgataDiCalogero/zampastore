import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CartService } from './cart.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    RouterLink,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly uiFeedback = inject(UiFeedbackService);
  protected readonly cartItems$ = this.cartService.cartItems$;
  protected readonly cartTotal$ = this.cartService.cartTotal$;

  protected updateQuantity(productId: string, qty: number | null): void {
    if (qty === null) {
      return;
    }
    this.cartService.updateQuantity(productId, qty);
  }

  protected removeItem(productId: string): void {
    this.cartItems$.pipe(take(1)).subscribe((items) => {
      const removedItem = items.find(
        (cartItem) => cartItem.product.id === productId,
      );
      this.cartService.removeItem(productId);
      if (removedItem) {
        this.uiFeedback.showRemove(removedItem.product.name, () => {
          this.cartService.addToCart(removedItem.product, removedItem.qty);
        });
      } else {
        this.uiFeedback.showRemove('Elemento');
      }
    });
  }

  protected confirmOrder(): void {
    this.cartService.clearCart();
    this.uiFeedback.showOrderConfirmed();
    void this.router.navigateByUrl('/ordine-confermato');
  }
}
