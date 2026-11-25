import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { I18n } from './core/i18n/i18n.service';

class NoopObserver {
  observe() {}
  disconnect() {}
}

describe('routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    vi.stubGlobal('IntersectionObserver', NoopObserver);
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => vi.unstubAllGlobals());

  const visit = async (url: string) => {
    await harness.navigateByUrl(url);
    await harness.fixture.whenStable();
    return harness.routeNativeElement as HTMLElement;
  };

  it('redirects the root to the default language', async () => {
    await visit('/');
    expect(TestBed.inject(Router).url).toBe('/en');
  });

  it('renders the home page and loads the dictionary of the language in the url', async () => {
    const el = await visit('/es');
    expect(el.querySelector('app-home-page')).not.toBeNull();
    expect(TestBed.inject(I18n).lang()).toBe('es');
  });

  it('renders category pages', async () => {
    const el = await visit('/en/operators/filtering');
    expect(el.querySelector('app-category-page')).not.toBeNull();
  });

  it('renders operator pages with their example and marble diagram', async () => {
    const el = await visit('/en/operators/transformation/map');
    await vi.waitFor(() => expect(el.querySelector('app-operator-page')).not.toBeNull());
    expect(el.querySelector('app-playground')).not.toBeNull();
    expect(el.querySelector('app-marble-diagram')).not.toBeNull();
  });

  it('shows the not found page for unknown items, sections and languages', async () => {
    expect(
      (await visit('/en/operators/transformation/nope')).querySelector('app-not-found-page'),
    ).not.toBeNull();
    expect((await visit('/es/nope')).querySelector('app-not-found-page')).not.toBeNull();
    expect((await visit('/fr/whatever')).querySelector('app-not-found-page')).not.toBeNull();
    expect(TestBed.inject(I18n).lang()).toBe('en');
  });

  it('bootstraps through the root component outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
