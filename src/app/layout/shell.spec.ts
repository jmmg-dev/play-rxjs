import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { Shell } from './shell';

describe('Shell', () => {
  it('renders the layout and moves focus to the main content from the skip link', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(I18n).use('es');
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    TestBed.inject(DOCUMENT).body.appendChild(el);

    for (const part of ['app-header', 'app-sidebar', 'app-footer', 'app-search-palette']) {
      expect(el.querySelector(part)).not.toBeNull();
    }
    const main = el.querySelector('main')!;
    expect(main.getAttribute('lang')).toBe('es');

    const skip = el.querySelector<HTMLAnchorElement>('.skip-link')!;
    expect(skip.getAttribute('href')).toMatch(/#main$/);
    const click = new MouseEvent('click', { cancelable: true });
    skip.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(TestBed.inject(DOCUMENT).activeElement).toBe(main);
    el.remove();
  });
});
