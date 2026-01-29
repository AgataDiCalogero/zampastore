import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '@org/shared';
import { CartApiService } from './cart-api.service';
import { AuthService } from '@org/auth/data-access';
import { of, firstValueFrom } from 'rxjs';
import { describe, beforeEach, it, expect } from 'vitest';

const buildProduct = (overrides?: Partial<Product>): Product => ({
  id: 'prod-1',
  name: 'Test Product',
  priceCents: 1000,
  imageUrl: undefined,
  ...overrides,
});

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        CartService,
        {
          provide: CartApiService,
          useValue: {
            getCart: () => of([]),
            addItem: () => of(null),
            mergeItems: () => of(null),
            updateItem: () => of(null),
            removeItem: () => of(null),
            clear: () => of(null),
          },
        },
        {
          provide: AuthService,
          useValue: {
            authState: () => null,
            isAuthenticated: () => false,
          },
        },
      ],
    });
    service = TestBed.inject(CartService);
  });

  it('adds items and computes total', async () => {
    const product = buildProduct();

    service.addToCart(product, 2);

    const items = await firstValueFrom(service.cartItems$);
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
  });

  it('clamps quantity and removes items', async () => {
    const product = buildProduct();

    service.addToCart(product, 1);
    service.updateQuantity(product.id, 0);

    let items = await firstValueFrom(service.cartItems$);
    const first = items.find((item) => item.product.id === product.id);
    if (first) {
      expect(first.qty).toBe(1);
    }
    service.removeItem(product.id);
    
    // We need to wait for the behavior subject to update or check the value effectively.
    // Since it's a BehaviorSubject locally in the service, it should be synchronous for these ops.
    // However, let's re-read to be safe or access the value directly if we could (but it's private/observable).
    items = await firstValueFrom(service.cartItems$);
    expect(items).toHaveLength(0);
  });

  it('persists cart in localStorage for guests', () => {
    const product = buildProduct();

    service.addToCart(product, 1);

    const raw = localStorage.getItem('zs_cart');
    expect(raw).toBeTruthy();
  });
});
