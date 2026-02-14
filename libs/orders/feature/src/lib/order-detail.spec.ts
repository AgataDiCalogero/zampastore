import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRoute,
  provideRouter,
  convertToParamMap,
} from '@angular/router';
import { API_BASE_URL } from '@zampa/shared';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect } from 'vitest';
import { OrderDetail } from './order-detail';

describe('OrderDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetail],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'ord-1' })),
          },
        },
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OrderDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
