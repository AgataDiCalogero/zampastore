import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { Product } from '@org/shared';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { CartService } from '../../features/cart/cart.service';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-product-detail',
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ImageModule,
    InputNumberModule,
    FormsModule,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  protected qty = 1;

  product$: Observable<Product | undefined> = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) =>
      id ? this.productService.getProductById(id) : of(undefined),
    ),
  );

  addToCart(product: Product): void {
    const safeQty = Math.max(1, Math.floor(this.qty ?? 1));

    this.cartService.addToCart(product, safeQty);
  }
}
