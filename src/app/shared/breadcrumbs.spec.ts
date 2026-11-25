import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Breadcrumbs } from './breadcrumbs';

describe('Breadcrumbs', () => {
  it('links every crumb but the last one, which is marked as the current page', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Breadcrumbs);
    fixture.componentRef.setInput('crumbs', [
      { name: 'Home', path: '' },
      { name: 'Transformation', path: '/operators/transformation' },
      { name: 'map', path: '/operators/transformation/map' },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = [...el.querySelectorAll('a')];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Home', 'Transformation']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/en',
      '/en/operators/transformation',
    ]);
    expect(el.querySelector('[aria-current="page"]')?.textContent).toBe('map');
  });
});
