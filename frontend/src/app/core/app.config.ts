import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { API_BASE_URL } from '@zampa/shared';
import {
  PreloadAllModules,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from '../app.routes';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { auth401Interceptor } from '../interceptors/auth401.interceptor';
import { credentialsInterceptor } from '../interceptors/credentials.interceptor';
import { AuthService } from '@zampa/auth/data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_BASE_URL, useValue: '' }, // Empty string for relative paths (proxy)
    provideRouter(
      appRoutes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, auth401Interceptor]),
    ),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.init();
    }),
    providePrimeNG({ ripple: true }),
    MessageService,
    ConfirmationService,
  ],
};
