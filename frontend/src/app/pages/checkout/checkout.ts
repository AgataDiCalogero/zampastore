import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CartItem, CartService } from '../../features/cart/cart.service';
import { PaymentService } from '../../services/payment.service';
import { CreateCheckoutSessionRequest, ShippingAddress } from '@org/shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type ShippingOption = {
  label: string;
  value: string;
  subtitle: string;
};

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private readonly cartService = inject(CartService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cartItems$ = this.cartService.cartItems$;
  protected readonly cartTotal$ = this.cartService.cartTotal$;

  protected readonly shippingOptions: ShippingOption[] = [
    {
      label: 'Standard (2-3 giorni)',
      value: 'standard',
      subtitle: 'Gratuita',
    },
    {
      label: 'Express (24h)',
      value: 'express',
      subtitle: '€ 4,90',
    },
  ];

  protected readonly form = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    postalCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
    country: new FormControl('Italia', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    shippingMethod: new FormControl(this.shippingOptions[0].value, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected submitting = false;
  protected errorMessage: string | null = null;
  private cartSnapshot: CartItem[] = [];

  constructor() {
    this.cartItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.cartSnapshot = items;
        if (items.length === 0) {
          void this.router.navigateByUrl('/carrello');
        }
      });
  }

  protected submit(): void {
    if (this.submitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.cartSnapshot.length === 0) {
      this.errorMessage = 'Il carrello e vuoto.';
      return;
    }

    this.errorMessage = null;
    this.submitting = true;

    const address = this.form.getRawValue();
    const shippingAddress: ShippingAddress = {
      firstName: address.firstName.trim(),
      lastName: address.lastName.trim(),
      address: address.address.trim(),
      city: address.city.trim(),
      postalCode: address.postalCode.trim(),
      country: address.country.trim(),
    };
    const payload: CreateCheckoutSessionRequest = {
      items: this.cartSnapshot.map((item) => ({
        productId: item.product.id,
        qty: item.qty,
      })),
      shippingAddress,
    };

    this.paymentService
      .createCheckoutSession(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (response) => {
          window.location.assign(response.url);
        },
        error: () => {
          this.errorMessage =
            'Non e stato possibile avviare il pagamento. Riprova.';
        },
      });
  }
}
