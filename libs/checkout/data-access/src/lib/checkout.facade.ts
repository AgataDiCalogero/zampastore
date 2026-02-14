import {
  Injectable,
  effect,
  inject,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CartItem, CartService } from '@zampa/cart/data-access';
import { PaymentService } from '@zampa/payment/data-access';
import { CreateCheckoutSessionRequest, ShippingAddress } from '@zampa/shared';
import { HttpErrorResponse } from '@angular/common/http';

export type ShippingOption = {
  label: string;
  value: string;
  subtitle: string;
  cost: number;
};

export type CheckoutForm = {
  email: FormControl<string>;
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
  private readonly platformId = inject(PLATFORM_ID);

  readonly cartItems = this.cartService.cartItems;
  readonly cartTotal = this.cartService.cartTotal;

  readonly shippingOptions: ShippingOption[] = [
    {
      label: 'Standard (2-3 giorni)',
      value: 'standard',
      subtitle: 'Gratuita',
      cost: 0,
    },
    {
      label: 'Express (24h)',
      value: 'express',
      subtitle: '€ 4,90',
      cost: 4.9,
    },
  ];

  readonly selectedShippingMethod = signal<ShippingOption | undefined>(
    this.shippingOptions[0],
  );

  // We need to listen to form value changes, but since Reactive Forms aren't signals, we use toSignal or primitive approach.
  // Simplified approach: rely on the fact that we can't easily signal-wrap the form control without boilerplate.
  // Instead, let's expose specific signals.

  readonly shippingCost = signal(0);

  readonly grandTotal = computed(() => this.cartTotal() + this.shippingCost());

  readonly form = new FormGroup<CheckoutForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
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
      validators: [Validators.required, Validators.minLength(5)],
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    postalCode: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{5}$/)],
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
  private readonly STORAGE_KEY = 'checkout_form_state';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        try {
          const value = JSON.parse(savedState);
          this.form.patchValue(value);
        } catch (e) {
          console.error('Failed to restore checkout state', e);
        }
      }

      // Save state on change
      this.form.valueChanges.subscribe((value) => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(value));
      });
    }

    // Update shipping cost when method changes
    this.form.controls.shippingMethod.valueChanges.subscribe((value) => {
      const option = this.shippingOptions.find((opt) => opt.value === value);
      this.shippingCost.set(option?.cost ?? 0);
      this.selectedShippingMethod.set(option);
    });

    // Pre-fill from Auth (via CartService to respect module boundaries)
    effect(() => {
      const user = this.cartService.authUser();
      if (user) {
        // We use 'any' or a specific shape because patches expects values, not Controls
        const patches: Record<string, string> = {};

        // Parse name parts
        const fullName = (user.name ?? '').trim();
        const [firstName, ...lastParts] = fullName
          ? fullName.split(/\s+/)
          : [''];
        const lastName = lastParts.join(' ');

        // Smart Merge: Only fill if field is PRISTINE (untouched) and EMPTY
        // This ensures we never overwrite user edits or deliberate deletions.

        const controls = this.form.controls;

        if (controls.email.pristine && !controls.email.value && user.email) {
          patches['email'] = user.email;
        }

        if (
          controls.firstName.pristine &&
          !controls.firstName.value &&
          firstName
        ) {
          patches['firstName'] = firstName;
        }

        if (
          controls.lastName.pristine &&
          !controls.lastName.value &&
          lastName
        ) {
          patches['lastName'] = lastName;
        }

        if (Object.keys(patches).length > 0) {
          this.form.patchValue(patches);
        }
      }
    });

    effect(() => {
      const items = this.cartItems();
      this.cartSnapshot = items;
      if (items.length === 0) {
        // Safe navigation logic might be needed here too if using window.location, but router is safe
        void this.router.navigateByUrl('/carrello');
      }
    });
  }

  async checkStockAvailability(): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 800));
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

    this.checkStockAvailability().then((isAvailable) => {
      if (!isAvailable) {
        this.errorMessage.set('Alcuni prodotti non sono più disponibili.');
        this.submitting.set(false);
        return;
      }

      this.proceedToPayment();
    });
  }

  private proceedToPayment(): void {
    const raw = this.form.getRawValue();
    const shippingAddress: ShippingAddress = {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      address: raw.address.trim(),
      city: raw.city.trim(),
      postalCode: raw.postalCode.trim(),
      country: raw.country.trim(),
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
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.STORAGE_KEY);
            globalThis.location.href = response.url;
          }
        },
        error: (error: unknown) => {
          if (
            error instanceof HttpErrorResponse &&
            typeof error.error?.message === 'string'
          ) {
            this.errorMessage.set(error.error.message);
            return;
          }
          this.errorMessage.set(
            'Impossibile procedere al pagamento. Riprova più tardi.',
          );
        },
      });
  }
}
