import { TestBed } from '@angular/core/testing';
import { CheckoutSuccess } from './checkout-success';

describe('CheckoutSuccess', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutSuccess],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CheckoutSuccess);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
