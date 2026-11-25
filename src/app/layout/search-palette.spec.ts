import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { Nav } from '../core/nav.service';
import { SearchPalette } from './search-palette';

@Component({ template: '' })
class Blank {}

describe('SearchPalette', () => {
  let fixture: ComponentFixture<SearchPalette>;
  let el: HTMLElement;
  let nav: Nav;
  let router: Router;

  const dialog = () => el.querySelector('dialog')!;
  const input = () => el.querySelector<HTMLInputElement>('input')!;
  const results = () => [...el.querySelectorAll<HTMLLIElement>('li.result')];
  const type = async (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (k: string, target: EventTarget = input(), init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', {
      key: k,
      bubbles: true,
      cancelable: true,
      ...init,
    });
    target.dispatchEvent(event);
    await fixture.whenStable();
    return event;
  };
  const open = async () => {
    nav.searchOpen.set(true);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    // jsdom does not implement modal dialogs
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }])],
    });
    await TestBed.inject(I18n).use('es');
    nav = TestBed.inject(Nav);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SearchPalette);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('toggles with Ctrl+K or Cmd+K and opens the modal dialog', async () => {
    const event = await key('k', document, { ctrlKey: true });
    expect(event.defaultPrevented).toBe(true);
    expect(nav.searchOpen()).toBe(true);
    expect(dialog().open).toBe(true);
    await key('K', document, { metaKey: true });
    expect(nav.searchOpen()).toBe(false);
    expect(dialog().open).toBe(false);
  });

  it('ignores other shortcuts', async () => {
    await key('k', document);
    await key('j', document, { ctrlKey: true });
    expect(nav.searchOpen()).toBe(false);
  });

  it('shows a hint until at least two characters are typed', async () => {
    await open();
    expect(el.querySelector('.palette__empty')?.textContent?.trim()).toBeTruthy();
    await type('m');
    expect(results()).toHaveLength(0);
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('finds operators and categories ignoring case and accents, best matches first', async () => {
    await open();
    await type('SWITCHMAP');
    expect(results()[0].textContent).toContain('switchMap');
    await type('transformación');
    expect(results()[0].querySelector('.result__title')?.classList).not.toContain('mono');
    expect(results().length).toBeLessThanOrEqual(8);
  });

  it('says when nothing matches', async () => {
    await open();
    await type('zzzz');
    expect(el.querySelector('.palette__empty')?.textContent).toContain('zzzz');
  });

  it('moves the selection with the arrow keys, wrapping around', async () => {
    await open();
    await type('map');
    const total = results().length;
    expect(total).toBeGreaterThan(1);
    await key('ArrowUp');
    expect(results()[total - 1].getAttribute('aria-selected')).toBe('true');
    expect(input().getAttribute('aria-activedescendant')).toBe(`search-opt-${total - 1}`);
    await key('ArrowDown');
    expect(results()[0].getAttribute('aria-selected')).toBe('true');
    await key('ArrowDown');
    expect(results()[1].getAttribute('aria-selected')).toBe('true');
    results()[0].dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(results()[0].getAttribute('aria-selected')).toBe('true');
    const other = await key('Tab');
    expect(other.defaultPrevented).toBe(false);
  });

  it('navigates to the selected result with Enter and closes', async () => {
    await open();
    await type('switchMap');
    await key('Enter');
    await fixture.whenStable();
    expect(router.url).toBe('/es/operators/transformation/switchMap');
    expect(nav.searchOpen()).toBe(false);
  });

  it('navigates when a result is clicked', async () => {
    await open();
    await type('filter');
    const url = results()[0];
    url.click();
    await fixture.whenStable();
    expect(router.url).toMatch(/^\/es\/operators\/filtering/);
  });

  it('ignores keys when there are no results', async () => {
    await open();
    const event = await key('Enter');
    expect(event.defaultPrevented).toBe(false);
    expect(nav.searchOpen()).toBe(true);
  });

  it('closes when the backdrop is clicked but not when the box is', async () => {
    await open();
    el.querySelector<HTMLElement>('.palette__box')!.click();
    expect(nav.searchOpen()).toBe(true);
    dialog().click();
    expect(nav.searchOpen()).toBe(false);
  });

  it('syncs the state when the dialog is closed by the browser (Esc)', async () => {
    await open();
    dialog().dispatchEvent(new Event('close'));
    expect(nav.searchOpen()).toBe(false);
  });
});
