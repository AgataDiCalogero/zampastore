import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { Product } from '@org/shared';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  product$: Observable<Product | undefined> = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) =>
      id ? this.productService.getProductById(id) : of(undefined),
    ),
  );
}
