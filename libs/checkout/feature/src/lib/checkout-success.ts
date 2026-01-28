import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '@org/cart/data-access';
import { OrdersService } from '@org/orders/data-access';
import { OrderDetail } from '@org/shared';
import { Observable, catchError, map, of, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-checkout-success',
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, SkeletonModule],
  templateUrl: './checkout-success.html',
  styleUrl: './checkout-success.scss',
})
export class CheckoutSuccess {
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);
  private cleared = false;

  protected readonly state$: Observable<
    | { status: 'loading' }
    | { status: 'ready'; order: OrderDetail }
    | { status: 'empty' }
    | { status: 'error' }
  > = this.route.queryParamMap.pipe(
    map((params) => params.get('orderId')),
    switchMap((orderId) =>
      orderId
        ? this.ordersService.getOrderById(orderId).pipe(
            map((order) => ({ status: 'ready', order }) as const),
            catchError((error) =>
              of(
                error?.status === 404
                  ? ({ status: 'empty' } as const)
                  : ({ status: 'error' } as const),
              ),
            ),
          )
        : of({ status: 'empty' } as const),
    ),
    tap((state) => {
      if (!this.cleared && state.status === 'ready') {
        this.cartService.clearCart();
        this.cleared = true;
      }
    }),
    startWith({ status: 'loading' } as const),
  );
}
