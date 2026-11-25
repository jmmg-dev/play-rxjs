import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n.service';
import { TranslatePipe } from './translate.pipe';

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(() => {
    i18n = TestBed.inject(I18n);
  });

  it('starts in English with an empty dictionary', () => {
    expect(i18n.lang()).toBe('en');
    expect(i18n.t('ui.home')).toBe('ui.home');
  });

  it('loads the dictionary of the selected language', async () => {
    await i18n.use('es');
    expect(i18n.lang()).toBe('es');
    expect(i18n.t('support.menu')).toBe('Apoyar');
    await i18n.use('en');
    expect(i18n.t('support.menu')).toBe('Support');
  });

  it('reuses a dictionary that was already loaded', async () => {
    await i18n.use('en');
    const first = i18n.t('support.title');
    await i18n.use('es');
    await i18n.use('en');
    expect(i18n.t('support.title')).toBe(first);
  });

  it('returns the key for missing or non-text entries', async () => {
    await i18n.use('en');
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');
    expect(i18n.t('support')).toBe('support');
    expect(i18n.has('support.title')).toBe(true);
    expect(i18n.has('support')).toBe(false);
  });

  it('replaces {params} and leaves unknown ones empty', async () => {
    await i18n.use('en');
    const template = i18n.t('seo.categoryTitle');
    expect(template).toContain('{title}');
    expect(i18n.t('seo.categoryTitle', { title: 'Filtering' })).toBe(
      template.replace('{title}', 'Filtering'),
    );
    expect(i18n.t('seo.operatorTitle', { name: 'map' })).not.toContain('{');
  });

  it('is exposed to templates through the t pipe', async () => {
    await i18n.use('es');
    const pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
    expect(pipe.transform('support.menu')).toBe('Apoyar');
    expect(pipe.transform('seo.categoryTitle', { title: 'X' })).toContain('X');
  });
});
