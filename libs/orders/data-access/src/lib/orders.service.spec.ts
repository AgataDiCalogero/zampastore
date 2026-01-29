import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { OrdersService } from './orders.service';
import { Order, OrderDetail } from '@org/shared';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches orders list', () => {
    const orders: Order[] = [
      {
        id: 'ord-1',
        totalCents: 1290,
        createdAt: '2026-01-29T10:00:00.000Z',
        status: 'paid',
      },
    ];

    let result: Order[] | undefined;
    service.getOrders().subscribe((value) => (result = value));

    const req = httpMock.expectOne('/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush(orders);

    expect(result).toEqual(orders);
  });

  it('fetches order detail by id', () => {
    const detail: OrderDetail = {
      id: 'ord-2',
      totalCents: 2490,
      createdAt: '2026-01-29T11:00:00.000Z',
      status: 'pending',
      items: [
        {
          productId: 'prod-001',
          name: 'Crocchette premium pollo',
          unitPriceCents: 2490,
          qty: 1,
          lineTotalCents: 2490,
        },
      ],
      shippingAddress: {
        firstName: 'Maria',
        lastName: 'Rossi',
        address: 'Via Roma 10',
        city: 'Torino',
        postalCode: '10100',
        country: 'Italia',
      },
    };

    let result: OrderDetail | undefined;
    service.getOrderById(detail.id).subscribe((value) => (result = value));

    const req = httpMock.expectOne(`/api/orders/${detail.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(detail);

    expect(result).toEqual(detail);
  });
});
