import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProductList } from '@org/products/feature';

describe('ProductList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        provideRouter([]),
        MessageService,
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductList);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
