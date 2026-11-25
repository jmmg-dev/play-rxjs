import { DEFAULT_LANG, isLang, LANGS } from './model';

describe('isLang', () => {
  it('accepts every supported language', () => {
    for (const lang of LANGS) expect(isLang(lang)).toBe(true);
  });

  it('rejects unknown languages and non-string values', () => {
    expect(isLang('fr')).toBe(false);
    expect(isLang('')).toBe(false);
    expect(isLang(undefined)).toBe(false);
    expect(isLang(null)).toBe(false);
    expect(isLang(1)).toBe(false);
  });

  it('uses English as the default language', () => {
    expect(DEFAULT_LANG).toBe('en');
  });
});
