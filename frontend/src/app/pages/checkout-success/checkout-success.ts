import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../features/cart/cart.service';

@Component({
  selector: 'app-checkout-success',
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './checkout-success.html',
  styleUrl: './checkout-success.scss',
})
export class CheckoutSuccess {
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  protected readonly orderReference =
    this.route.snapshot.queryParamMap.get('orderId') ?? 'ZS-ORDER';

  constructor() {
    this.cartService.clearCart();
  }
}
