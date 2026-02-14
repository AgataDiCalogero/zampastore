import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { API_BASE_URL } from '@zampa/shared';
import { describe, beforeEach, it, expect } from 'vitest';
import { ProductList } from './product-list';

describe('ProductList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        provideRouter([]),
        MessageService,
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductList);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
