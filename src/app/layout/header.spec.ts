import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { Nav } from '../core/nav.service';
import { Header } from './header';

describe('Header', () => {
  let el: HTMLElement;
  let nav: Nav;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(I18n).use('es');
    nav = TestBed.inject(Nav);
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('links the brand and the PRx logo to the home of the current language', () => {
    expect(el.querySelector('a.brand')?.getAttribute('href')).toBe('/es');
    const logo = el.querySelector('a.header__logo');
    expect(logo?.getAttribute('href')).toBe('/es');
    expect(logo?.getAttribute('aria-label')).toContain('Play RxJS');
  });

  it('links the heart to the support section with a translated label', () => {
    const heart = el.querySelector('a.header__support');
    expect(heart?.getAttribute('href')).toBe('/es#support');
    expect(heart?.getAttribute('aria-label')).toBe('Apoya mis proyectos');
    expect(heart?.getAttribute('title')).toBe('Apoya mis proyectos');
  });

  it('opens the menu drawer and the search palette', () => {
    const menu = el.querySelector<HTMLButtonElement>('.header__menu')!;
    menu.click();
    expect(nav.drawerOpen()).toBe(true);
    el.querySelector<HTMLButtonElement>('.search-trigger')!.click();
    expect(nav.searchOpen()).toBe(true);
  });
});
