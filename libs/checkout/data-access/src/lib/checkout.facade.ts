import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartItem, CartService } from '@org/cart/data-access';
import { PaymentService } from '@org/payment/data-access';
import { CreateCheckoutSessionRequest, ShippingAddress } from '@org/shared';

export type ShippingOption = {
  label: string;
  value: string;
  subtitle: string;
};

type CheckoutForm = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  address: FormControl<string>;
  city: FormControl<string>;
  postalCode: FormControl<string>;
  country: FormControl<string>;
  shippingMethod: FormControl<string>;
};

@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private readonly cartService = inject(CartService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cartItems$ = this.cartService.cartItems$;
  readonly cartTotal$ = this.cartService.cartTotal$;

  readonly shippingOptions: ShippingOption[] = [
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

  readonly form = new FormGroup<CheckoutForm>({
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

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
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

  submit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.cartSnapshot.length === 0) {
      this.errorMessage.set('Il carrello è vuoto.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

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
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          window.location.assign(response.url);
        },
        error: () => {
          this.errorMessage.set(
            'Non è stato possibile avviare il pagamento. Riprova.',
          );
        },
      });
  }
}
