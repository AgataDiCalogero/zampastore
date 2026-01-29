import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { CartItem } from './cart.service';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>('/api/cart');
  }

  addItem(productId: string, qty: number): Observable<void> {
    return this.http.post<void>('/api/cart/items', { productId, qty });
  }

  mergeItems(items: { productId: string; qty: number }[]): Observable<void> {
    return this.http.post<void>('/api/cart/merge', { items });
  }

  updateItem(productId: string, qty: number): Observable<void> {
    return this.http.patch<void>(`/api/cart/items/${productId}`, { qty });
  }

  removeItem(productId: string): Observable<void> {
    return this.http.delete<void>(`/api/cart/items/${productId}`);
  }

  clear(): Observable<void> {
    return this.http.delete<void>('/api/cart');
  }
}
