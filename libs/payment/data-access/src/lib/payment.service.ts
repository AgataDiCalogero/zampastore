import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  API_BASE_URL,
} from '@zampa/shared';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  createCheckoutSession(
    payload: CreateCheckoutSessionRequest,
  ): Observable<CreateCheckoutSessionResponse> {
    return this.http.post<CreateCheckoutSessionResponse>(
      `${this.apiUrl}/api/payments/checkout-session`,
      payload,
    );
  }
}
