import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderDetail, API_BASE_URL } from '@zampa/shared';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/api/orders`);
  }

  getOrderById(orderId: string): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.apiUrl}/api/orders/${orderId}`);
  }
}
