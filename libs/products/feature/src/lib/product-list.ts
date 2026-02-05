import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@zampa/products/data-access';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Product } from '@zampa/shared';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '@zampa/cart/data-access';
import { UiFeedbackService, ProductCardComponent } from '@zampa/ui';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

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

  readonly categories = ['Cibo', 'Cura', 'Accessori', 'Giochi'];
  readonly selectedCategory = signal<string | undefined>(undefined);

  protected readonly skeletonItems = Array.from({ length: 6 });

  private readonly products$ = toObservable(this.selectedCategory).pipe(
    switchMap((category) => this.productService.getProducts(category)),
    map((products) =>
      products.length > 0
        ? ({ status: 'ready', products } as const)
        : ({ status: 'empty' } as const),
    ),
    catchError(() => of({ status: 'error' } as const)),
    startWith({ status: 'loading' } as const),
  );

  readonly state = toSignal(this.products$, { requireSync: true });

  setCategory(category?: string) {
    this.selectedCategory.set(category);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.uiFeedback.showAdd(product.name);
  }
}
