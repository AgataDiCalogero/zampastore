import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { Product } from '@org/shared';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ImageModule, ButtonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  protected handleAddToCart(): void {
    this.addToCart.emit(this.product);
  }
}
