import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MENU_ITEMS } from './menu-items';
import { AuthService } from './services/auth.service';

@Component({
  imports: [CommonModule, MenubarModule, RouterModule, ToastModule, ButtonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected menuItems: MenuItem[];
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  constructor() {
    this.menuItems = this.buildMenuItems();
  }

  private buildMenuItems(): MenuItem[] {
    const isAuthenticated = this.authService.isAuthenticated();

    return MENU_ITEMS.map((item) => {
      if (item.label === 'I miei ordini') {
        return {
          ...item,
          visible: isAuthenticated,
        };
      }

      if (item.label === 'Login/Logout') {
        if (isAuthenticated) {
          return {
            ...item,
            label: 'Logout',
            routerLink: undefined,
            command: () => {
              this.authService.logout();
              this.router.navigateByUrl('/');
            },
          };
        }

        return {
          ...item,
          label: 'Entra',
          routerLink: '/login',
        };
      }

      return item;
    });
  }
}
