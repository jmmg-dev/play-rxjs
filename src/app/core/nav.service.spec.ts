import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { I18n } from './i18n/i18n.service';
import { Nav } from './nav.service';

@Component({ template: '' })
class Blank {}

describe('Nav', () => {
  let nav: Nav;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }])],
    });
    nav = TestBed.inject(Nav);
    router = TestBed.inject(Router);
  });

  it('builds links with the current language prefix', async () => {
    expect(nav.link()).toBe('/en');
    expect(nav.link('operators/filtering')).toBe('/en/operators/filtering');
    expect(nav.link('/subjects')).toBe('/en/subjects');
    await TestBed.inject(I18n).use('es');
    expect(nav.link('subjects')).toBe('/es/subjects');
    expect(nav.link('subjects', 'en')).toBe('/en/subjects');
  });

  it('exposes the path without the language, query or fragment', async () => {
    await router.navigateByUrl('/es/operators/filtering/filter?x=1#top');
    expect(nav.url()).toBe('/es/operators/filtering/filter?x=1#top');
    expect(nav.restPath()).toBe('/operators/filtering/filter');
  });

  it('returns an empty path on the home page', async () => {
    await router.navigateByUrl('/en');
    expect(nav.restPath()).toBe('');
  });

  it('keeps the first segment when it is not a language', async () => {
    await router.navigateByUrl('/unknown/page');
    expect(nav.restPath()).toBe('/unknown/page');
  });

  it('starts with the drawer and the search closed', () => {
    expect(nav.drawerOpen()).toBe(false);
    expect(nav.searchOpen()).toBe(false);
  });
});
