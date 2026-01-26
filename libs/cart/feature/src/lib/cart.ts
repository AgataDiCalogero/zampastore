import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged, take } from 'rxjs';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CartItem, CartService } from '@org/cart/data-access';
import { UiFeedbackService } from '@org/ui';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CartRowForm = {
  productId: FormControl<string>;
  quantity: FormControl<number>;
};

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    RouterLink,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly uiFeedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);
  private rowSubscriptions: Subscription[] = [];
  private cartItemIds: string[] = [];
  protected readonly cartItems$ = this.cartService.cartItems$;
  protected readonly cartTotal$ = this.cartService.cartTotal$;

  protected readonly form = new FormGroup({
    items: new FormArray<FormGroup<CartRowForm>>([]),
  });

  protected get itemsArray(): FormArray<FormGroup<CartRowForm>> {
    return this.form.controls.items;
  }

  constructor() {
    this.cartItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => this.syncForm(items));
  }

  protected removeItem(productId: string): void {
    this.cartItems$.pipe(take(1)).subscribe((items) => {
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
    });
  }

  protected confirmOrder(): void {
    void this.router.navigateByUrl('/checkout');
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
    this.rowSubscriptions.forEach((sub) => sub.unsubscribe());
    this.rowSubscriptions = [];

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

    const sub = group.controls.quantity.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((qty) => {
        if (group.controls.quantity.invalid) {
          return;
        }
        this.cartService.updateQuantity(item.product.id, qty);
      });
    this.rowSubscriptions.push(sub);

    return group;
  }
}
