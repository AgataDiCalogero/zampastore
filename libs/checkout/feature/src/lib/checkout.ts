import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { CheckoutFacade } from '@zampa/checkout/data-access';

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
    SkeletonModule,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout {
  private readonly checkoutFacade = inject(CheckoutFacade);

  protected readonly cartItems = this.checkoutFacade.cartItems;
  protected readonly cartTotal = this.checkoutFacade.cartTotal;
  protected readonly shippingCost = this.checkoutFacade.shippingCost;
  protected readonly grandTotal = this.checkoutFacade.grandTotal;
  protected readonly shippingOptions = this.checkoutFacade.shippingOptions;
  protected readonly selectedShippingMethod =
    this.checkoutFacade.selectedShippingMethod;
  protected readonly form = this.checkoutFacade.form;
  protected readonly submitting = this.checkoutFacade.submitting;
  protected readonly errorMessage = this.checkoutFacade.errorMessage;

  protected submit(): void {
    this.checkoutFacade.submit();
  }
}
