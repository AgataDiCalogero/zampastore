import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { Product } from '@org/shared';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../features/cart/cart.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, ImageModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  products$: Observable<Product[]> = this.productService.getProducts();

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }
}
