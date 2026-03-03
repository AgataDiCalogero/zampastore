import { ApplicationConfig } from '@angular/core';
import { API_BASE_URL } from '@zampa/shared';
import {
  provideRouter,
  withInMemoryScrolling,
} from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from '../app.routes';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import { auth401Interceptor } from '../interceptors/auth401.interceptor';
import { credentialsInterceptor } from '../interceptors/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_BASE_URL, useValue: '' }, // Empty string for relative paths (proxy)
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, auth401Interceptor]),
    ),
    providePrimeNG({ ripple: true }),
    MessageService,
    ConfirmationService,
  ],
};
