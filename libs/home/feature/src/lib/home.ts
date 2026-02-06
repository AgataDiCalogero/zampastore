import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, map, of, startWith } from 'rxjs';
import { Product } from '@zampa/shared';
import { ProductService } from '@zampa/products/data-access';
import { ProductCardComponent, UiFeedbackService } from '@zampa/ui';
import { CartService } from '@zampa/cart/data-access';

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

  protected readonly featuredState = toSignal(
    this.productService.getProducts().pipe(
      map((products) => products.slice(0, 4)),
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

  protected readonly skeletonItems = Array.from({ length: 4 });

  protected addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.uiFeedback.showAdd(product.name);
  }
}
