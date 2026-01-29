import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthResponse, AuthUser, LoginRequest } from '@org/shared';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

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

  it('logs in and updates auth state', async () => {
    const credentials: LoginRequest = {
      email: 'demo@zampastore.it',
      password: 'password',
    };
    const user: AuthUser = { id: 'user-1', email: credentials.email };
    const response: AuthResponse = { user };

    const loginPromise = firstValueFrom(service.login(credentials));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    const result = await loginPromise;
    expect(result).toEqual(user);
    expect(service.authState()).toEqual(user);
  });

  it('clears auth state on refresh error', async () => {
    const user: AuthUser = { id: 'user-1', email: 'demo@zampastore.it' };
    
    // Login first
    const loginPromise = firstValueFrom(service.login({ email: user.email, password: 'password' }));
    httpMock.expectOne('/api/auth/login').flush({ user });
    await loginPromise;

    // Then test refresh error
    const refreshPromise = firstValueFrom(service.refresh());

    const refreshReq = httpMock.expectOne('/api/auth/me');
    refreshReq.flush(
      { message: 'unauthorized' },
      { status: 401, statusText: '401' },
    );

    await refreshPromise.catch(e => e);
    // AuthService probably handles error and returns null or similar
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
