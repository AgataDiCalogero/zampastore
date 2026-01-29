import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthResponse, AuthUser, LoginRequest } from '@org/shared';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('logs in and updates auth state', () => {
    const credentials: LoginRequest = {
      email: 'demo@zampastore.it',
      password: 'password',
    };
    const user: AuthUser = { id: 'user-1', email: credentials.email };
    const response: AuthResponse = { user };

    let result: AuthUser | undefined;
    service.login(credentials).subscribe((value) => (result = value));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(result).toEqual(user);
    expect(service.authState()).toEqual(user);
  });

  it('clears auth state on refresh error', () => {
    const user: AuthUser = { id: 'user-1', email: 'demo@zampastore.it' };
    service.login({ email: user.email, password: 'password' }).subscribe();
    const loginReq = httpMock.expectOne('/api/auth/login');
    const loginResponse: AuthResponse = { user };
    loginReq.flush(loginResponse);

    let result: AuthUser | null | undefined;
    service.refresh().subscribe((value) => (result = value));

    const refreshReq = httpMock.expectOne('/api/auth/me');
    refreshReq.flush(
      { message: 'unauthorized' },
      { status: 401, statusText: '401' },
    );

    expect(result).toBeNull();
    expect(service.authState()).toBeNull();
  });

  it('redirects to login on unauthorized', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    service.handleUnauthorized('/checkout');

    expect(navigateSpy).toHaveBeenCalledWith(
      '/login?returnUrl=%2Fcheckout',
    );
  });
});
