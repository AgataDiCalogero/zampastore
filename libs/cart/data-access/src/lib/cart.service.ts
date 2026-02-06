import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Product } from '@zampa/shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@zampa/auth/data-access';
import { CartApiService } from './cart-api.service';

export type CartItem = { product: Product; qty: number };
const STORAGE_KEY = 'zs_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly cartItems = signal<CartItem[]>([]);
  private readonly authService = inject(AuthService);
  private readonly cartApi = inject(CartApiService);
  private readonly destroyRef = inject(DestroyRef);
  private lastUserId: string | null = null;
  private syncing = false;
  readonly authUser = this.authService.authState;

  readonly cartTotal = computed(
    () =>
      this.cartItems().reduce(
        (total, cartItem) => total + cartItem.product.priceCents * cartItem.qty,
        0,
      ) / 100,
  );

  readonly cartCount = computed(() =>
    this.cartItems().reduce((count, item) => count + item.qty, 0),
  );

  constructor() {
    const stored = this.readStoredCart();
    if (stored) {
      this.cartItems.set(stored);
    }

    // Effect to persist cart to localStorage whenever it changes
    effect(() => {
      this.persistCart(this.cartItems());
    });

    // Effect to sync with server on login/logout
    effect(() => {
      const user = this.authService.authState();
      if (user?.id && user.id !== this.lastUserId) {
        this.lastUserId = user.id;
        this.syncFromServer();
      }
      if (!user) {
        this.lastUserId = null;
      }
    });
  }

  addToCart(product: Product, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));

    this.cartItems.update((items) => {
      const index = items.findIndex((item) => item.product.id === product.id);
      if (index === -1) {
        return [...items, { product, qty: normalizedQty }];
      }
      return items.map((item, i) =>
        i === index ? { ...item, qty: item.qty + normalizedQty } : item,
      );
    });

    if (this.authService.isAuthenticated()) {
      this.cartApi
        .addItem(product.id, normalizedQty)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.refreshFromServer(),
        });
    }
  }

  updateQuantity(productId: string, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));

    this.cartItems.update((items) =>
      items.map((item) =>
        item.product.id === productId ? { ...item, qty: normalizedQty } : item,
      ),
    );

    if (this.authService.isAuthenticated()) {
      this.cartApi
        .updateItem(productId, normalizedQty)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.refreshFromServer(),
        });
    }
  }

  removeItem(productId: string): void {
    this.cartItems.update((items) =>
      items.filter((item) => item.product.id !== productId),
    );

    if (this.authService.isAuthenticated()) {
      this.cartApi
        .removeItem(productId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.refreshFromServer(),
        });
    }
  }

  clearCart(): void {
    this.cartItems.set([]);

    if (this.authService.isAuthenticated()) {
      this.cartApi
        .clear()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.refreshFromServer(),
        });
    }
  }

  private syncFromServer(): void {
    if (this.syncing) {
      return;
    }
    this.syncing = true;

    const localItems = this.readStoredCart() ?? [];
    if (localItems.length > 0) {
      const payload = localItems.map((item) => ({
        productId: item.product.id,
        qty: item.qty,
      }));
      this.cartApi
        .mergeItems(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.refreshFromServer(),
          error: () => {
            this.syncing = false;
          },
        });
      return;
    }

    this.refreshFromServer();
  }

  private refreshFromServer(): void {
    this.cartApi
      .getCart()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.cartItems.set(items);
          this.syncing = false;
        },
        error: () => {
          this.syncing = false;
        },
      });
  }

  private readStoredCart(): CartItem[] | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed.filter(
        (item) =>
          item &&
          typeof item.qty === 'number' &&
          item.product &&
          typeof item.product.id === 'string',
      );
    } catch {
      return null;
    }
  }

  private persistCart(items: CartItem[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors (e.g. private mode).
    }
  }
}
