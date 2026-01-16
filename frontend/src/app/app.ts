import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { MENU_ITEMS } from './menu-items';
import { AuthService } from './services/auth.service';

@Component({
  imports: [MenubarModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected menuItems: MenuItem[];

  constructor(private authService: AuthService, private router: Router) {
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
