import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { Orders } from './orders';

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
