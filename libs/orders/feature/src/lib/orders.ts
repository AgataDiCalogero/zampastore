import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '@zampa/orders/data-access';
import { Order, OrderStatus } from '@zampa/shared';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Orders {
  private readonly ordersService = inject(OrdersService);

  protected readonly skeletonRows = Array.from({ length: 4 });
  protected readonly statusMeta: Record<
    OrderStatus,
    { label: string; tone: 'success' | 'warning' | 'info' | 'danger' }
  > = {
    pending: { label: 'In attesa', tone: 'warning' },
    paid: { label: 'Pagato', tone: 'success' },
    processing: { label: 'In lavorazione', tone: 'info' },
    shipped: { label: 'Spedito', tone: 'info' },
    delivered: { label: 'Consegnato', tone: 'success' },
    cancelled: { label: 'Annullato', tone: 'danger' },
  };

  protected statusFor(status: OrderStatus) {
    return this.statusMeta[status];
  }

  protected getShortId(id: string): string {
    return id.substring(0, 8).toUpperCase();
  }

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
