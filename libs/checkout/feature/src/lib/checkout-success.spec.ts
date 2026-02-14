import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideRouter,
  ActivatedRoute,
  convertToParamMap,
} from '@angular/router';
import { API_BASE_URL } from '@zampa/shared';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect } from 'vitest';
import { CheckoutSuccess } from './checkout-success';

describe('CheckoutSuccess', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutSuccess],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ orderId: 'ord-1' })),
          },
        },
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CheckoutSuccess);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
