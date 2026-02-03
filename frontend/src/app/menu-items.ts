import { MenuItem } from 'primeng/api';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'pi pi-home',
    routerLink: '/',
  },
  {
    id: 'catalog',
    label: 'Catalogo',
    icon: 'pi pi-box',
    routerLink: '/prodotti',
  },
  {
    id: 'cart',
    label: 'Carrello',
    icon: 'pi pi-shopping-cart',
    routerLink: '/carrello',
  },
  {
    id: 'orders',
    label: 'I miei ordini',
    icon: 'pi pi-receipt',
    routerLink: '/ordini',
  },
  {
    id: 'auth',
    label: 'Entra/Esci',
    icon: 'pi pi-user',
    routerLink: '/login',
  },
];
