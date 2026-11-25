import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CATEGORIES } from '../content/catalog';
import { I18n } from '../core/i18n/i18n.service';
import { Nav } from '../core/nav.service';
import { Sidebar } from './sidebar';

@Component({ template: '' })
class Blank {}

describe('Sidebar', () => {
  const setup = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }])],
    });
    await TestBed.inject(I18n).use('es');
    await TestBed.inject(Router).navigateByUrl(url);
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, nav: TestBed.inject(Nav) };
  };

  it('lists every category with its item count', async () => {
    const { el } = await setup('/es');
    const cats = el.querySelectorAll('details.cat');
    expect(cats).toHaveLength(CATEGORIES.length);
    expect(cats[0].querySelector('.cat__count')?.textContent).toBe(
      String(CATEGORIES[0].items.length),
    );
  });

  it('opens only the category of the current page', async () => {
    const { el } = await setup('/es/operators/transformation/map');
    const open = [...el.querySelectorAll<HTMLDetailsElement>('details.cat')].filter((d) => d.open);
    expect(open).toHaveLength(1);
    expect(open[0].querySelector('.cat__link')?.getAttribute('href')).toBe(
      '/es/operators/transformation',
    );
  });

  it('marks new and deprecated operators', async () => {
    const { el } = await setup('/es');
    expect(el.querySelectorAll('.dot').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('.dot--deprecated').length).toBeGreaterThan(0);
  });

  it('ends with a support link that closes the drawer', async () => {
    const { el, nav, fixture } = await setup('/es');
    const support = el.querySelector<HTMLAnchorElement>('a.support-link')!;
    expect(support.getAttribute('href')).toBe('/es#support');
    expect(support.textContent).toContain('Apoyar');
    nav.drawerOpen.set(true);
    fixture.detectChanges();
    support.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(nav.drawerOpen()).toBe(false);
  });

  it('closes with the close button, the backdrop, Escape and after navigating', async () => {
    const { el, nav, fixture } = await setup('/es');
    const reopen = () => {
      nav.drawerOpen.set(true);
      fixture.detectChanges();
    };
    reopen();
    expect(el.querySelector('.sidebar')?.classList).toContain('sidebar--open');
    el.querySelector<HTMLButtonElement>('.sidebar__close')!.click();
    expect(nav.drawerOpen()).toBe(false);
    reopen();
    el.querySelector<HTMLElement>('.backdrop')!.click();
    expect(nav.drawerOpen()).toBe(false);
    reopen();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(nav.drawerOpen()).toBe(false);
    reopen();
    await TestBed.inject(Router).navigateByUrl('/es/subjects');
    fixture.detectChanges();
    expect(nav.drawerOpen()).toBe(false);
  });
});
