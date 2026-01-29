import { Route } from '@angular/router';
import { authGuard } from '@org/auth/data-access';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@org/home/feature').then((m) => m.Home),
    pathMatch: 'full',
  },
  {
    path: 'prodotti',
    loadComponent: () =>
      import('@org/products/feature').then((m) => m.ProductList),
  },
  {
    path: 'prodotti/:id',
    loadComponent: () =>
      import('@org/products/feature').then((m) => m.ProductDetail),
  },
  {
    path: 'carrello',
    loadComponent: () =>
      import('@org/cart/feature').then((m) => m.Cart),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('@org/checkout/feature').then((m) => m.Checkout),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@org/auth/feature').then((m) => m.Login),
  },
  {
    path: 'registrazione',
    loadComponent: () =>
      import('@org/auth/feature').then((m) => m.Register),
  },
  {
    path: 'ordini',
    loadComponent: () =>
      import('@org/orders/feature').then((m) => m.Orders),
    canActivate: [authGuard],
  },
  {
    path: 'ordini/:id',
    loadComponent: () =>
      import('@org/orders/feature').then((m) => m.OrderDetail),
    canActivate: [authGuard],
  },
  {
    path: 'ordine-confermato',
    loadComponent: () =>
      import('@org/checkout/feature').then((m) => m.CheckoutSuccess),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
