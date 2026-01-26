import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrdersService } from '@org/orders/data-access';
import { OrderDetail as OrderDetailModel } from '@org/shared';
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
})
export class OrderDetail {
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);

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
