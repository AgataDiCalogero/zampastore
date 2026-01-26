import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/me'];

export const auth401Interceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.startsWith('/api')) {
        if (AUTH_ENDPOINTS.some((endpoint) => req.url.includes(endpoint))) {
          return throwError(() => error);
        }

        const currentUrl = router.url || '/';
        authService.handleUnauthorized(currentUrl);
      }
      return throwError(() => error);
    }),
  );
};
