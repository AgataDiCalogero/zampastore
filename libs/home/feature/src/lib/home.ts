import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Product } from '@org/shared';
import { ProductService } from '@org/products/data-access';
import { ProductCardComponent, UiFeedbackService } from '@org/ui';
import { CartService } from '@org/cart/data-access';

type HomeProductsState =
  | { status: 'loading' }
  | { status: 'ready'; products: Product[] }
  | { status: 'empty' }
  | { status: 'error' };

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    ProductCardComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly uiFeedback = inject(UiFeedbackService);

  protected readonly featuredState$: Observable<HomeProductsState> =
    this.productService.getProducts().pipe(
      map((products) => products.slice(0, 4)),
      map((products) =>
        products.length > 0
          ? ({ status: 'ready', products } as const)
          : ({ status: 'empty' } as const),
      ),
      catchError(() => of({ status: 'error' } as const)),
      startWith({ status: 'loading' } as const),
    );

  protected readonly skeletonItems = Array.from({ length: 4 });

  protected addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.uiFeedback.showAdd(product.name);
  }
}
