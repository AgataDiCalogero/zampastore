import { Injectable } from '@angular/core';
import { Product } from '@org/shared';
import { BehaviorSubject, Observable, map } from 'rxjs';

type CartItem = { product: Product; qty: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly cartItems$ = this.getCartItems();
  readonly cartTotal$ = this.cartItems$.pipe(
    map(
      (cartItems) =>
        cartItems.reduce(
          (total, cartItem) => total + cartItem.product.priceCents * cartItem.qty,
          0,
        ) / 100,
    ),
  );

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
  }

  updateQuantity(productId: string, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));
    const next = this.cartItemsSubject.value.map((cartItem) =>
      cartItem.product.id === productId
        ? { ...cartItem, qty: normalizedQty }
        : cartItem,
    );
    this.cartItemsSubject.next(next);
  }

  removeItem(productId: string): void {
    const next = this.cartItemsSubject.value.filter(
      (cartItem) => cartItem.product.id !== productId,
    );
    this.cartItemsSubject.next(next);
  }
  clearCart(): void {
    this.cartItemsSubject.next([]);
  }
}
