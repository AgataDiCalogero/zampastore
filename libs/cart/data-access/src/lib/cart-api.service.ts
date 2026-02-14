import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '@zampa/shared';
import { Observable } from 'rxjs';
import type { CartItem } from './cart.service';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/api/cart`);
  }

  addItem(productId: string, qty: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/cart/items`, {
      productId,
      qty,
    });
  }

  mergeItems(items: { productId: string; qty: number }[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/cart/merge`, { items });
  }

  updateItem(productId: string, qty: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/api/cart/items/${productId}`, {
      qty,
    });
  }

  removeItem(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/cart/items/${productId}`);
  }

  clear(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/cart`);
  }
}
