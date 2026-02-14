import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '@zampa/shared';
import { describe, beforeEach, it, expect } from 'vitest';
import { Orders } from './orders';

describe('Orders', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orders],
      providers: [
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Orders);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
