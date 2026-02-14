import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { API_BASE_URL } from '@zampa/shared';
import { describe, beforeEach, it, expect } from 'vitest';
import { Cart } from './cart';

describe('Cart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        MessageService,
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Cart);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
