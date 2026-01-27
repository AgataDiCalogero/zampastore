import { Route } from '@angular/router';
import { authGuard } from '@org/auth/data-access';
import { Login, Register } from '@org/auth/feature';
import { Cart } from '@org/cart/feature';
import { Checkout, CheckoutSuccess } from '@org/checkout/feature';
import { Home } from '@org/home/feature';
import { OrderDetail, Orders } from '@org/orders/feature';
import { ProductDetail, ProductList } from '@org/products/feature';

export const appRoutes: Route[] = [
  {
    path: '',
    component: Home,
    pathMatch: 'full',
  },
  {
    path: 'prodotti',
    component: ProductList,
  },
  {
    path: 'prodotti/:id',
    component: ProductDetail,
  },
  {
    path: 'carrello',
    component: Cart,
  },
  {
    path: 'checkout',
    component: Checkout,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'registrazione',
    component: Register,
  },
  {
    path: 'ordini',
    component: Orders,
    canActivate: [authGuard],
  },
  {
    path: 'ordini/:id',
    component: OrderDetail,
    canActivate: [authGuard],
  },
  {
    path: 'ordine-confermato',
    component: CheckoutSuccess,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
