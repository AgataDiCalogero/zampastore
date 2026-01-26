import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderDetail } from '@org/shared';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders');
  }

  getOrderById(orderId: string): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`/api/orders/${orderId}`);
  }
}
