import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Cart } from '@org/cart/feature';

describe('Cart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Cart);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
