import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClientTesting(), MessageService],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
