import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from '@zampa/shared';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  createCheckoutSession(
    payload: CreateCheckoutSessionRequest,
  ): Observable<CreateCheckoutSessionResponse> {
    return this.http.post<CreateCheckoutSessionResponse>(
      '/api/payments/checkout-session',
      payload,
    );
  }
}
