import { Route } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Cart } from './features/cart/cart';
import { CheckoutSuccess } from './pages/checkout-success/checkout-success';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { OrderDetail } from './pages/order-detail/order-detail';
import { Orders } from './pages/orders/orders';
import { ProductDetail } from './pages/product-detail/product-detail';
import { ProductList } from './pages/product-list/product-list';
import { Register } from './pages/register/register';

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
