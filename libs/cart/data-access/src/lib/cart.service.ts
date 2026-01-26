import { Injectable } from '@angular/core';
import { Product } from '@org/shared';
import { BehaviorSubject, Observable, map } from 'rxjs';

export type CartItem = { product: Product; qty: number };
const STORAGE_KEY = 'zs_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
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
    this.cartItemsSubject.next(next);
    this.persistCart(next);
  }

  updateQuantity(productId: string, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));
    const next = this.cartItemsSubject.value.map((cartItem) =>
      cartItem.product.id === productId
        ? { ...cartItem, qty: normalizedQty }
        : cartItem,
    );
    this.cartItemsSubject.next(next);
    this.persistCart(next);
  }

  removeItem(productId: string): void {
    const next = this.cartItemsSubject.value.filter(
      (cartItem) => cartItem.product.id !== productId,
    );
    this.cartItemsSubject.next(next);
    this.persistCart(next);
  }
  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.persistCart([]);
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
