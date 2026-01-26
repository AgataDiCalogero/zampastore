import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@org/products/data-access';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, of, startWith, switchMap } from 'rxjs';
import { Product } from '@org/shared';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { CartService } from '@org/cart/data-access';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { UiFeedbackService } from '@org/ui';

type ProductState =
  | { status: 'loading' }
  | { status: 'ready'; product: Product }
  | { status: 'not-found' };

@Component({
  selector: 'app-product-detail',
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ImageModule,
    InputNumberModule,
    ReactiveFormsModule,
    SkeletonModule,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly uiFeedback = inject(UiFeedbackService);
  protected readonly qtyControl = new FormControl<number>(1, {
    nonNullable: true,
    validators: [Validators.min(1)],
  });

  protected readonly productState$: Observable<ProductState> =
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
    );

  addToCart(product: Product): void {
    const safeQty = Math.max(1, Math.floor(this.qtyControl.value ?? 1));

    this.cartService.addToCart(product, safeQty);
    this.uiFeedback.showAdd(product.name);
  }
}
