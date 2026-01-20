import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeAll(() => {
    if (!globalThis.matchMedia) {
      const noop = () => undefined;
      globalThis.matchMedia = (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: noop,
        removeListener: noop,
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => false,
      });
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render layout shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-menubar')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
