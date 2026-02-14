import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { API_BASE_URL } from '@zampa/shared';
import { describe, beforeEach, it, expect } from 'vitest';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),

        MessageService,
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Login);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
