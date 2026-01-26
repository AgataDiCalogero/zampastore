import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '@org/orders/data-access';
import { Order } from '@org/shared';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';

type OrdersState =
  | { status: 'loading' }
  | { status: 'ready'; orders: Order[] }
  | { status: 'empty' }
  | { status: 'error' };

@Component({
  selector: 'app-orders',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    RouterModule,
    SkeletonModule,
    CardModule,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private readonly ordersService = inject(OrdersService);

  protected readonly skeletonRows = Array.from({ length: 4 });
  readonly state$: Observable<OrdersState> = this.ordersService
    .getOrders()
    .pipe(
      map((orders) =>
        orders.length > 0
          ? ({ status: 'ready', orders } as const)
          : ({ status: 'empty' } as const),
      ),
      catchError(() => of({ status: 'error' } as const)),
      startWith({ status: 'loading' } as const),
    );
}
