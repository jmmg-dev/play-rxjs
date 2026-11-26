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

  const toggles = (el: HTMLElement) => [...el.querySelectorAll<HTMLButtonElement>('.cat__toggle')];
  const expanded = (el: HTMLElement) => toggles(el).filter((b) => b.ariaExpanded === 'true');

  it('lists every category with its item count, without nesting the link in the toggle', async () => {
    const { el } = await setup('/es');
    expect(toggles(el)).toHaveLength(CATEGORIES.length);
    const first = toggles(el)[0];
    expect(first.textContent?.trim()).toBe(String(CATEGORIES[0].items.length));
    expect(first.getAttribute('aria-label')).toMatch(new RegExp(`^${CATEGORIES[0].items.length} `));
    expect(first.querySelector('a')).toBeNull();
    expect(el.querySelector('summary, details')).toBeNull();
  });

  it('opens only the category of the current page', async () => {
    const { el } = await setup('/es/operators/transformation/map');
    expect(expanded(el)).toHaveLength(1);
    const list = el.querySelector<HTMLUListElement>(
      `#${expanded(el)[0].getAttribute('aria-controls')}`,
    )!;
    expect(list.hidden).toBe(false);
    expect(list.querySelector('a.is-active')?.getAttribute('href')).toBe(
      '/es/operators/transformation/map',
    );
    expect(el.querySelectorAll('ul.cat__items:not([hidden])')).toHaveLength(1);
  });

  it('opens and closes sections by hand until the next navigation', async () => {
    const { el, fixture } = await setup('/es/operators/transformation/map');
    const [first] = toggles(el);
    const current = expanded(el)[0];
    first.click();
    current.click();
    fixture.detectChanges();
    expect(first.ariaExpanded).toBe('true');
    expect(current.ariaExpanded).toBe('false');
    await TestBed.inject(Router).navigateByUrl('/es/operators/transformation/filter');
    fixture.detectChanges();
    expect(first.ariaExpanded).toBe('false');
    expect(current.ariaExpanded).toBe('true');
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
