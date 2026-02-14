import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { CartItem, CartService } from '@zampa/cart/data-access';
import { UiFeedbackService } from '@zampa/ui';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

type CartRowForm = {
  productId: FormControl<string>;
  quantity: FormControl<number>;
};

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    ConfirmDialogModule,
    RouterLink,
    NgOptimizedImage,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly uiFeedback = inject(UiFeedbackService);
  private readonly confirmationService = inject(ConfirmationService);
  private cartItemIds: string[] = [];

  protected readonly cartItems = this.cartService.cartItems;
  protected readonly cartTotal = this.cartService.cartTotal;
  protected readonly skeletonRows = Array.from({ length: 3 });

  protected readonly state = computed(() => {
    const items = this.cartItems();
    return items.length > 0
      ? ({ status: 'ready', items } as const)
      : ({ status: 'empty' } as const);
  });

  protected readonly form = new FormGroup({
    items: new FormArray<FormGroup<CartRowForm>>([]),
  });

  protected get itemsArray(): FormArray<FormGroup<CartRowForm>> {
    return this.form.controls.items;
  }

  constructor() {
    effect(() => {
      this.syncForm(this.cartItems());
    });
  }

  protected removeItem(productId: string): void {
    const items = this.cartItems();
    const removedItem = items.find(
      (cartItem) => cartItem.product.id === productId,
    );
    this.cartService.removeItem(productId);
    if (removedItem) {
      this.uiFeedback.showRemove(removedItem.product.name, () => {
        this.cartService.addToCart(removedItem.product, removedItem.qty);
      });
    } else {
      this.uiFeedback.showRemove('Elemento');
    }
  }

  protected confirmOrder(): void {
    void this.router.navigateByUrl('/checkout');
  }

  protected clearCart(): void {
    const items = this.cartItems();
    if (items.length === 0) {
      return;
    }
    this.confirmationService.confirm({
      key: 'clear-cart',
      header: 'Svuotare il carrello?',
      message: 'Rimuoveremo tutti i prodotti dal carrello.',
      icon: 'pi pi-trash',
      acceptLabel: 'Svuota',
      acceptButtonStyleClass: 'p-button-danger cart-clear-confirm-accept',
      rejectLabel: 'Annulla',
      rejectButtonStyleClass:
        'p-button-secondary p-button-outlined cart-clear-confirm-reject',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.cartService.clearCart();
        this.uiFeedback.showCartCleared(() => {
          items.forEach((item) =>
            this.cartService.addToCart(item.product, item.qty),
          );
        });
      },
    });
  }

  private syncForm(items: CartItem[]): void {
    const ids = items.map((item) => item.product.id);
    const sameStructure =
      ids.length === this.cartItemIds.length &&
      ids.every((id, index) => id === this.cartItemIds[index]);

    if (!sameStructure) {
      this.cartItemIds = ids;
      this.rebuildForm(items);
      return;
    }

    items.forEach((item, index) => {
      const control = this.itemsArray.at(index)?.controls.quantity;
      if (control && control.value !== item.qty) {
        control.setValue(item.qty, { emitEvent: false });
      }
    });
  }

  private rebuildForm(items: CartItem[]): void {
    const rows = items.map((item) => this.createRow(item));
    const formArray = new FormArray<FormGroup<CartRowForm>>(rows);
    this.form.setControl('items', formArray);
  }

  private createRow(item: CartItem): FormGroup<CartRowForm> {
    const group = new FormGroup<CartRowForm>({
      productId: new FormControl(item.product.id, { nonNullable: true }),
      quantity: new FormControl(item.qty, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(99),
        ],
      }),
    });

    group.controls.quantity.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((qty) => {
        if (group.controls.quantity.invalid) {
          return;
        }
        this.cartService.updateQuantity(item.product.id, qty);
        this.uiFeedback.showQuantityUpdated(item.product.name, qty);
      });

    return group;
  }
}
