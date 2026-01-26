import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@org/shared';
import { Router } from '@angular/router';
import {
  firstValueFrom,
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authStateSignal = signal<AuthUser | null>(null);
  readonly authState = this.authStateSignal.asReadonly();
  private initialized = false;
  private initInFlight: Promise<void> | null = null;

  isAuthenticated(): boolean {
    return this.authState() !== null;
  }

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      map((response) => response.user),
      tap((user) => this.authStateSignal.set(user)),
    );
  }

  register(payload: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      map((response) => response.user),
      tap((user) => this.authStateSignal.set(user)),
    );
  }

  refresh(): Observable<AuthUser | null> {
    return this.http.get<AuthResponse>('/api/auth/me').pipe(
      map((response) => response.user),
      tap((user) => this.authStateSignal.set(user)),
      catchError(() => {
        this.authStateSignal.set(null);
        return of(null);
      }),
    );
  }

  init(): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }
    if (this.initInFlight) {
      return this.initInFlight;
    }

    this.initInFlight = firstValueFrom(this.refresh())
      .then(() => {
        this.initialized = true;
      })
      .finally(() => {
        this.initInFlight = null;
      });

    return this.initInFlight;
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => this.authStateSignal.set(null)),
      catchError((error) => {
        this.authStateSignal.set(null);
        return throwError(() => error);
      }),
    );
  }

  clearSession(): void {
    this.authStateSignal.set(null);
  }

  handleUnauthorized(returnUrl?: string): void {
    this.clearSession();

    const normalizedReturnUrl = returnUrl ?? '/';
    const isAuthRoute =
      normalizedReturnUrl.startsWith('/login') ||
      normalizedReturnUrl.startsWith('/registrazione');
    const targetUrl = !isAuthRoute
      ? `/login?returnUrl=${encodeURIComponent(normalizedReturnUrl)}`
      : '/login';
    void this.router.navigateByUrl(targetUrl);
  }
}
