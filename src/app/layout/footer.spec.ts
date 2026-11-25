import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OPERATOR_CATEGORIES } from '../content/catalog';
import { I18n } from '../core/i18n/i18n.service';
import { Footer } from './footer';

describe('Footer', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(I18n).use('en');
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('shows the tagline and the Powered by JMMG.dev credit', () => {
    expect(el.textContent).toContain('Made with ♥ for the developer community.');
    const credit = el.querySelector<HTMLAnchorElement>('.poweredby a')!;
    expect(credit.getAttribute('href')).toBe('https://jmmg.dev');
    expect(credit.getAttribute('target')).toBe('_blank');
    expect(credit.getAttribute('rel')).toBe('noopener');
    expect(el.querySelector('.poweredby')?.textContent).toContain('© 2026 JMMG.dev');
  });

  it('no longer shows the author line', () => {
    expect(el.textContent).not.toContain('Author');
  });

  it('links every operator category', () => {
    const links = el.querySelectorAll('.footer__links a');
    expect(links).toHaveLength(OPERATOR_CATEGORIES.length);
    expect(links[0].getAttribute('href')).toBe(`/en/${OPERATOR_CATEGORIES[0].path}`);
  });

  it('links LinkedIn, the GitHub repository and jmmg.dev in that order', () => {
    const social = [...el.querySelectorAll('.footer__social a')];
    expect(social.map((a) => a.getAttribute('aria-label'))).toEqual([
      'LinkedIn',
      'GitHub',
      'jmmg.dev',
    ]);
    expect(social[1].getAttribute('href')).toBe('https://github.com/jmmg-dev/play-rxjs');
    expect(social[2].getAttribute('href')).toBe('https://jmmg.dev');
  });
});
