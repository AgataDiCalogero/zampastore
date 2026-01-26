import { firstValueFrom } from 'rxjs';
import { CartService } from './cart.service';
import { Product } from '@org/shared';

const buildProduct = (overrides?: Partial<Product>): Product => ({
  id: 'prod-1',
  name: 'Test Product',
  priceCents: 1000,
  imageUrl: undefined,
  ...overrides,
});

describe('CartService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items and computes total', async () => {
    const service = new CartService();
    const product = buildProduct();

    service.addToCart(product, 2);

    const items = await firstValueFrom(service.cartItems$);
    const total = await firstValueFrom(service.cartTotal$);

    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
    expect(total).toBe(20);
  });

  it('clamps quantity and removes items', async () => {
    const service = new CartService();
    const product = buildProduct();

    service.addToCart(product, 1);
    service.updateQuantity(product.id, 0);
    let items = await firstValueFrom(service.cartItems$);
    expect(items[0].qty).toBe(1);

    service.removeItem(product.id);
    items = await firstValueFrom(service.cartItems$);
    expect(items).toHaveLength(0);
  });

  it('persists cart in localStorage', async () => {
    const service = new CartService();
    const product = buildProduct();

    service.addToCart(product, 1);

    const raw = localStorage.getItem('zs_cart');
    expect(raw).toBeTruthy();
  });
});
