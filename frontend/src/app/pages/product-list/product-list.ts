import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Observable, startWith } from 'rxjs';
import { Product } from '@org/shared';
import { SkeletonModule } from 'primeng/skeleton';
import { CartService } from '../../features/cart/cart.service';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductCardComponent,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly uiFeedback = inject(UiFeedbackService);

  protected readonly skeletonItems = Array.from({ length: 6 });
  products$: Observable<Product[] | null> = this.productService
    .getProducts()
    .pipe(startWith(null));

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.uiFeedback.showAdd(product.name);
  }
}
