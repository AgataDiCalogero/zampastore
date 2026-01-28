import { HttpInterceptorFn } from '@angular/common/http';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'zs_csrf';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return undefined;
};

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const csrfToken = getCookie(CSRF_COOKIE);
  const needsCsrf = !SAFE_METHODS.has(req.method.toUpperCase());
  const headers =
    needsCsrf && csrfToken
      ? req.headers.set(CSRF_HEADER, csrfToken)
      : req.headers;
  const authRequest = req.clone({ withCredentials: true, headers });
  return next(authRequest);
};
