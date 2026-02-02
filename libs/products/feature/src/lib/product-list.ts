import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@org/products/data-access';
import { catchError, map, of, startWith } from 'rxjs';
import { Product } from '@org/shared';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '@org/cart/data-access';
import { UiFeedbackService, ProductCardComponent } from '@org/ui';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, SkeletonModule, ProductCardComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly uiFeedback = inject(UiFeedbackService);

  protected readonly skeletonItems = Array.from({ length: 6 });
  readonly state = toSignal(
    this.productService.getProducts().pipe(
      map((products) =>
        products.length > 0
          ? ({ status: 'ready', products } as const)
          : ({ status: 'empty' } as const),
      ),
      catchError(() => of({ status: 'error' } as const)),
      startWith({ status: 'loading' } as const),
    ),
    { requireSync: true },
  );

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.uiFeedback.showAdd(product.name);
  }
}
