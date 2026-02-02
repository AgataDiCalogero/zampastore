import { Route } from '@angular/router';
import { authGuard } from '@zampa/auth/data-access';
import { Home } from '@zampa/home/feature';

export const appRoutes: Route[] = [
  {
    path: '',
    component: Home,
    pathMatch: 'full',
  },
  {
    path: 'prodotti',
    loadComponent: () =>
      import('@zampa/products/feature').then((m) => m.ProductList),
  },
  {
    path: 'prodotti/:id',
    loadComponent: () =>
      import('@zampa/products/feature').then((m) => m.ProductDetail),
  },
  {
    path: 'carrello',
    loadComponent: () => import('@zampa/cart/feature').then((m) => m.Cart),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('@zampa/checkout/feature').then((m) => m.Checkout),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('@zampa/auth/feature').then((m) => m.Login),
  },
  {
    path: 'registrazione',
    loadComponent: () => import('@zampa/auth/feature').then((m) => m.Register),
  },
  {
    path: 'ordini',
    loadComponent: () => import('@zampa/orders/feature').then((m) => m.Orders),
    canActivate: [authGuard],
  },
  {
    path: 'ordini/:id',
    loadComponent: () =>
      import('@zampa/orders/feature').then((m) => m.OrderDetail),
    canActivate: [authGuard],
  },
  {
    path: 'ordine-confermato',
    loadComponent: () =>
      import('@zampa/checkout/feature').then((m) => m.CheckoutSuccess),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
