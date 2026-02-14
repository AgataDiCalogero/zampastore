import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, API_BASE_URL } from '@zampa/shared';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  getProducts(category?: string): Observable<Product[]> {
    const params: Record<string, string> = category ? { category } : {};
    return this.http.get<Product[]>(`${this.apiUrl}/api/products`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/api/products/${id}`);
  }
}
