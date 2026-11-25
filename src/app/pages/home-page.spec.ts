import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OPERATOR_CATEGORIES } from '../content/catalog';
import { I18n } from '../core/i18n/i18n.service';
import { HomePage } from './home-page';

describe('HomePage', () => {
  const render = async (lang: 'en' | 'es') => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(I18n).use(lang);
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('sets the home SEO title and description in the page language', async () => {
    await render('es');
    const doc = TestBed.inject(DOCUMENT);
    expect(doc.title).toBe(TestBed.inject(I18n).t('seo.homeTitle'));
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://playrxjs.com/es',
    );
  });

  it('shows the stats and links every operator category', async () => {
    const el = await render('en');
    expect(el.querySelectorAll('.stats__item')).toHaveLength(3);
    const categories = el.querySelectorAll('#operators a.category');
    expect(categories).toHaveLength(OPERATOR_CATEGORIES.length);
    expect(categories[0].getAttribute('href')).toBe(`/en/${OPERATOR_CATEGORIES[0].path}`);
  });

  it('presents the project with LinkedIn, GitHub and jmmg.dev links', async () => {
    const el = await render('en');
    expect(el.querySelector('#about-title')?.textContent).toBe('About the project');
    const links = [...el.querySelectorAll<HTMLAnchorElement>('.about__links a')];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['LinkedIn', 'GitHub', 'jmmg.dev']);
    expect(links[1].href).toBe('https://github.com/jmmg-dev/play-rxjs');
    expect(links[2].href).toBe('https://jmmg.dev/');
  });

  it('ends with the support section and a Ko-fi button that opens in a new tab', async () => {
    const el = await render('es');
    const support = el.querySelector('#support')!;
    expect(support).toBe(el.querySelector('.home')!.lastElementChild);
    expect(support.querySelector('h2')?.textContent).toBe('Apoya mis proyectos');
    expect(support.textContent).toContain('¡Muchas gracias! :)');
    const kofi = support.querySelector<HTMLAnchorElement>('.support__methods a')!;
    expect(kofi.href).toBe('https://ko-fi.com/jmmgdev');
    expect(kofi.target).toBe('_blank');
    expect(kofi.rel).toBe('noopener');
    expect(kofi.classList).toContain('btn--primary');
    expect(kofi.textContent).toContain('Invítame a un café en Ko-fi');
  });
});
