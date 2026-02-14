import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { MessageService } from 'primeng/api';
import { API_BASE_URL } from '@zampa/shared';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect } from 'vitest';
import { ProductDetail } from './product-detail';

describe('ProductDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideRouter([]),
        MessageService,
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'p-001' })) },
        },
        { provide: API_BASE_URL, useValue: '' },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should select image by index', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    const component = fixture.componentInstance;
    component.selectImage(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).selectedImageIndex()).toBe(2);
  });

  it('should go to next image', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    const component = fixture.componentInstance;

    // Mock images
    Object.defineProperty(component, 'images', {
      value: () => ['img1', 'img2', 'img3'],
    });

    component.selectImage(0);
    component.nextImage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).selectedImageIndex()).toBe(1);

    component.nextImage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).selectedImageIndex()).toBe(2);

    component.nextImage();
    // loop back to start
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).selectedImageIndex()).toBe(0);
  });

  it('should go to previous image', () => {
    const fixture = TestBed.createComponent(ProductDetail);
    const component = fixture.componentInstance;

    // Mock images
    Object.defineProperty(component, 'images', {
      value: () => ['img1', 'img2', 'img3'],
    });

    component.selectImage(0);
    component.prevImage();
    // loop back to end
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).selectedImageIndex()).toBe(2);

    component.prevImage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((component as any).selectedImageIndex()).toBe(1);
  });
});
