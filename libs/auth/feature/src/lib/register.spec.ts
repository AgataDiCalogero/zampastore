import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { API_BASE_URL } from '@zampa/shared';
import { describe, beforeEach, it, expect } from 'vitest';
import { Register } from './register';

describe('Register', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),

        MessageService,
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
