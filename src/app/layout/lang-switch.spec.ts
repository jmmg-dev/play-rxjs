import { Component, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { LangSwitch } from './lang-switch';

@Component({ template: '' })
class Blank {}

describe('LangSwitch', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }])],
    });
    await TestBed.inject(I18n).use('en');
    await TestBed.inject(Router).navigateByUrl('/en/operators/filtering/filter');
    const fixture = TestBed.createComponent(LangSwitch);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('links each language to the same page', () => {
    const links = [...el.querySelectorAll('a')];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['EN', 'ES']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/en/operators/filtering/filter',
      '/es/operators/filtering/filter',
    ]);
    expect(links.map((a) => a.getAttribute('hreflang'))).toEqual(['en', 'es']);
  });

  it('marks the current language and only offers a title for the other one', () => {
    const [en, es] = el.querySelectorAll('a');
    expect(en.getAttribute('aria-current')).toBe('true');
    expect(en.getAttribute('title')).toBeNull();
    expect(es.getAttribute('aria-current')).toBeNull();
    expect(es.getAttribute('title')).toBeTruthy();
  });

  it('remembers the chosen language in a cookie', () => {
    const doc = TestBed.inject(DOCUMENT);
    el.querySelectorAll('a')[1].dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(doc.cookie).toContain('lang=es');
  });
});
