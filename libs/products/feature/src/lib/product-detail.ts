import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '@zampa/products/data-access';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, of, startWith, switchMap } from 'rxjs';
import { Product } from '@zampa/shared';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CartService } from '@zampa/cart/data-access';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { UiFeedbackService } from '@zampa/ui';

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
  protected readonly activeSlide = signal(0);
  protected readonly selectedImageIndex = signal(0);

  // Computed list of images for the gallery
  protected readonly images = computed(() => {
    const state = this.productState();
    if (state.status !== 'ready') return [];

    // Support new images array or fallback to legacy imageUrl
    let imgs: string[] = [];
    if (state.product.images && state.product.images.length > 0) {
      imgs = state.product.images;
    } else if (state.product.imageUrl) {
      imgs = [state.product.imageUrl];
    }

    // Filter duplicates just in case
    return [...new Set(imgs)];
  });

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

  onScroll(event: Event) {
    // Simple logic to update active dot based on scroll position
    const element = event.target as HTMLElement;
    const slideWidth = element.scrollWidth / this.images().length;
    const currentIndex = Math.round(element.scrollLeft / slideWidth);
    this.activeSlide.set(currentIndex);
  }

  addToCart(product: Product): void {
    const safeQty = Math.max(1, Math.floor(this.qtyControl.value ?? 1));

    this.cartService.addToCart(product, safeQty);
    this.uiFeedback.showAdd(product.name);
  }

  protected handleImageError(): void {
    this.imageError.set(true);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  prevImage(): void {
    const current = this.selectedImageIndex();
    const total = this.images().length;
    if (total > 0) {
      this.selectedImageIndex.set((current - 1 + total) % total);
    }
  }

  nextImage(): void {
    const current = this.selectedImageIndex();
    const total = this.images().length;
    if (total > 0) {
      this.selectedImageIndex.set((current + 1) % total);
    }
  }
}
