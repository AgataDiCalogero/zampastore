import { TestBed } from '@angular/core/testing';
import { Orders } from '@org/orders/feature';

describe('Orders', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orders],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Orders);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
