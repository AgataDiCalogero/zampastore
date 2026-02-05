import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Product } from '@zampa/shared';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    NgOptimizedImage,
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  protected readonly imageError = signal(false);
  protected readonly secondaryImageError = signal(false);

  protected get mainImage(): string | undefined {
    return (
      this.product.imageUrl ||
      (this.product.images?.length ? this.product.images[0] : undefined)
    );
  }

  protected get secondaryImage(): string | undefined {
    if (!this.product.images || this.product.images.length < 2)
      return undefined;

    // Find first image that isn't the primary one
    const primary = this.mainImage;
    return (
      this.product.images.find((img) => img !== primary) ||
      this.product.images[1]
    );
  }

  protected handleAddToCart(): void {
    this.addToCart.emit(this.product);
  }

  protected handleImageError(): void {
    this.imageError.set(true);
  }

  protected handleSecondaryImageError(): void {
    this.secondaryImageError.set(true);
  }
}
