import { DestroyRef, Injectable, effect, inject } from '@angular/core';
import { Product } from '@org/shared';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@org/auth/data-access';
import { CartApiService } from './cart-api.service';

export type CartItem = { product: Product; qty: number };
const STORAGE_KEY = 'zs_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private readonly authService = inject(AuthService);
  private readonly cartApi = inject(CartApiService);
  private readonly destroyRef = inject(DestroyRef);
  private lastUserId: string | null = null;
  private syncing = false;

  readonly cartItems$ = this.getCartItems();
  readonly cartTotal$ = this.cartItems$.pipe(
    map(
      (cartItems) =>
        cartItems.reduce(
          (total, cartItem) =>
            total + cartItem.product.priceCents * cartItem.qty,
          0,
        ) / 100,
    ),
  );

  constructor() {
    const stored = this.readStoredCart();
    if (stored) {
      this.cartItemsSubject.next(stored);
    }

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

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  addToCart(product: Product, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));
    const cartItems = this.cartItemsSubject.value;
    const index = cartItems.findIndex(
      (cartItem) => cartItem.product.id === product.id,
    );
    let next: CartItem[];
    if (index === -1) {
      next = [...cartItems, { product, qty: normalizedQty }];
    } else {
      next = cartItems.map((cartItem) =>
        cartItem.product.id === product.id
          ? { ...cartItem, qty: cartItem.qty + normalizedQty }
          : cartItem,
      );
    }
    this.setItems(next);

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
    const next = this.cartItemsSubject.value.map((cartItem) =>
      cartItem.product.id === productId
        ? { ...cartItem, qty: normalizedQty }
        : cartItem,
    );
    this.setItems(next);

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
    const next = this.cartItemsSubject.value.filter(
      (cartItem) => cartItem.product.id !== productId,
    );
    this.setItems(next);

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
    this.setItems([]);

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
          this.setItems(items);
          this.syncing = false;
        },
        error: () => {
          this.syncing = false;
        },
      });
  }

  private setItems(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.persistCart(items);
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
