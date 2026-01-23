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
      (items) =>
        items.reduce(
          (total, item) => total + item.product.priceCents * item.qty,
          0,
        ) / 100,
    ),
  );

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  addToCart(product: Product, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));
    const current = this.cartItemsSubject.value;
    const index = current.findIndex((item) => item.product.id === product.id);
    let next: CartItem[];
    if (index === -1) {
      next = [...current, { product, qty: normalizedQty }];
    } else {
      next = current.map((item) =>
        item.product.id === product.id
          ? { ...item, qty: item.qty + normalizedQty }
          : item,
      );
    }
    this.cartItemsSubject.next(next);
  }

  updateQuantity(productId: string, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));
    const next = this.cartItemsSubject.value.map((item) =>
      item.product.id === productId ? { ...item, qty: normalizedQty } : item,
    );
    this.cartItemsSubject.next(next);
  }

  removeItem(productId: string): void {
    const next = this.cartItemsSubject.value.filter(
      (item) => item.product.id !== productId,
    );
    this.cartItemsSubject.next(next);
  }
  clearCart(): void {
    this.cartItemsSubject.next([]);
  }
}
