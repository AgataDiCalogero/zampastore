import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrdersService } from '@zampa/orders/data-access';
import { OrderDetail as OrderDetailModel, OrderStatus } from '@zampa/shared';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

type OrderDetailState =
  | { status: 'loading' }
  | { status: 'ready'; order: OrderDetailModel }
  | { status: 'not-found' }
  | { status: 'error' };

@Component({
  selector: 'app-order-detail',
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    SkeletonModule,
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetail {
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
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

  protected readonly state$: Observable<OrderDetailState> =
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) =>
        id ? this.ordersService.getOrderById(id) : of(undefined),
      ),
      map((order) =>
        order
          ? ({ status: 'ready', order } as const)
          : ({ status: 'not-found' } as const),
      ),
      catchError((error) =>
        of(
          error?.status === 404
            ? ({ status: 'not-found' } as const)
            : ({ status: 'error' } as const),
        ),
      ),
      startWith({ status: 'loading' } as const),
    );
}
