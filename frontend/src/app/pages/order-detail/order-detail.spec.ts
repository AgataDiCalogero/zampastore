import { TestBed } from '@angular/core/testing';
import { OrderDetail } from './order-detail';

describe('OrderDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetail],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OrderDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
