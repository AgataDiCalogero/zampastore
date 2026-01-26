import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CheckoutSuccess } from './checkout-success';

describe('CheckoutSuccess', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutSuccess],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CheckoutSuccess);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
