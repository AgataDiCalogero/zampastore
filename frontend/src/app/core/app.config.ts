import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from '../app.routes';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { auth401Interceptor } from '../interceptors/auth401.interceptor';
import { credentialsInterceptor } from '../interceptors/credentials.interceptor';
import { AuthService } from '@org/auth/data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, auth401Interceptor]),
    ),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.init();
    }),
    providePrimeNG({ ripple: true }),
    MessageService,
  ],
};
