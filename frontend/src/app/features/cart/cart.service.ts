import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem, Product } from '@org/shared';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly productsById = new Map<string, Product>([
    [
      'p1',
      {
        id: 'p1',
        name: 'Guinzaglio in cuoio',
        priceCents: 2990,
      },
    ],
    [
      'p2',
      {
        id: 'p2',
        name: 'Crocchette premium 2 kg',
        priceCents: 2450,
      },
    ],
    [
      'p3',
      {
        id: 'p3',
        name: 'Gioco in corda',
        priceCents: 1200,
      },
    ],
  ]);

  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([
    { productId: 'p1', qty: 1 },
    { productId: 'p2', qty: 2 },
    { productId: 'p3', qty: 1 },
  ]);

  readonly items$ = this.cartItemsSubject.pipe(
    map((items) =>
      items
        .map((item) => {
          const product = this.productsById.get(item.productId);
          if (!product) {
            return null;
          }
          return { product, qty: item.qty };
        })
        .filter(
          (item): item is { product: Product; qty: number } => item !== null
        )
    )
  );

  readonly total$ = this.items$.pipe(
    map((items) =>
      items.reduce(
        (total, item) => total + item.product.priceCents * item.qty,
        0
      ) / 100
    )
  );

  updateQuantity(productId: string, qty: number): void {
    const normalizedQty = Math.max(1, Math.floor(qty));
    this.cartItemsSubject.next(
      this.cartItemsSubject.value.map((item) =>
        item.productId === productId
          ? { ...item, qty: normalizedQty }
          : item
      )
    );
  }

  removeItem(productId: string): void {
    this.cartItemsSubject.next(
      this.cartItemsSubject.value.filter((item) => item.productId !== productId)
    );
  }
}
