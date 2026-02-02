import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@org/products/data-access';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, of, startWith, switchMap } from 'rxjs';
import { Product } from '@org/shared';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CartService } from '@org/cart/data-access';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { UiFeedbackService } from '@org/ui';

@Component({
  selector: 'app-product-detail',
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    ReactiveFormsModule,
    SkeletonModule,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly uiFeedback = inject(UiFeedbackService);
  protected readonly imageError = signal(false);
  protected readonly qtyControl = new FormControl<number>(1, {
    nonNullable: true,
    validators: [Validators.min(1)],
  });

  protected readonly productState = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) =>
        id ? this.productService.getProductById(id) : of(undefined),
      ),
      map((product) =>
        product
          ? ({ status: 'ready', product } as const)
          : ({ status: 'not-found' } as const),
      ),
      startWith({ status: 'loading' } as const),
    ),
    { requireSync: true },
  );

  addToCart(product: Product): void {
    const safeQty = Math.max(1, Math.floor(this.qtyControl.value ?? 1));

    this.cartService.addToCart(product, safeQty);
    this.uiFeedback.showAdd(product.name);
  }

  protected handleImageError(): void {
    this.imageError.set(true);
  }
}
