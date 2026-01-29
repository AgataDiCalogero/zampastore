import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MENU_ITEMS } from './menu-items';
import { AuthService } from '@org/auth/data-access';
import { CartService } from '@org/cart/data-access';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

type NavLink = {
  id?: string;
  label: string;
  routerLink?: string | string[];
  command?: () => void;
  icon?: string;
};

@Component({
  imports: [
    CommonModule,
    MenubarModule,
    RouterModule,
    ToastModule,
    ButtonModule,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly document = inject(DOCUMENT);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly desktopLinks = computed(() => this.buildNavLinks());
  protected readonly mobileLinks = computed(() => this.buildNavLinks());
  protected readonly cartCount = toSignal(
    this.cartService.cartItems$.pipe(
      map((items) => items.reduce((sum, item) => sum + item.qty, 0)),
    ),
    { initialValue: 0 },
  );

  constructor() {
    effect(() => {
      const isOpen = this.mobileMenuOpen();
      this.document.body.classList.toggle('no-scroll', isOpen);
    });
  }

  private buildMenuItems(): MenuItem[] {
    const isAuthenticated = this.authService.isAuthenticated();

    return MENU_ITEMS.map((item) => {
      if (item.id === 'orders') {
        return {
          ...item,
          visible: isAuthenticated,
        };
      }

      if (item.id === 'auth') {
        if (isAuthenticated) {
          return {
            ...item,
            label: 'Esci',
            routerLink: undefined,
            command: () => this.performLogout(),
          };
        }

        return {
          ...item,
          label: 'Accedi',
          routerLink: '/login',
        };
      }

      return item;
    });
  }

  private buildNavLinks(): NavLink[] {
    return this.buildMenuItems()
      .filter((item) => item.visible !== false)
      .map((item) => ({
        id: item.id as string | undefined,
        label: item.label ?? '',
        routerLink: item.routerLink as string | string[] | undefined,
        command: item.command ? () => item.command?.({} as never) : undefined,
        icon: item.icon as string | undefined,
      }))
      .filter((item) => item.label);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected handleMobileAction(action?: () => void): void {
    action?.();
    this.closeMobileMenu();
  }

  private performLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/');
      },
      error: () => {
        void this.router.navigateByUrl('/');
      },
    });
  }
}
