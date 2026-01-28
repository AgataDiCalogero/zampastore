import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CheckoutSuccess } from './checkout-success';

describe('CheckoutSuccess', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutSuccess],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ orderId: 'ord-1' })),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CheckoutSuccess);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
