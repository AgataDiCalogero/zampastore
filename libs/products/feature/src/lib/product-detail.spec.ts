import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect } from 'vitest';
import { ProductDetail } from './product-detail';

describe('ProductDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideRouter([]),
        MessageService,
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'p-001' })) },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
