import { MenuItem } from 'primeng/api';

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Catalogo',
    routerLink: '/prodotti',
  },
  {
    label: 'Carrello',
    routerLink: '/carrello',
  },
  {
    label: 'I miei ordini',
    routerLink: '/ordini',
  },
  {
    label: 'Login/Logout',
    routerLink: '/login',
  },
];
