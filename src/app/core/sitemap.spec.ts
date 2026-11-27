import { CATEGORIES } from '../content/catalog';
import { LANGS } from '../content/model';
import { buildSitemap } from './sitemap';

describe('buildSitemap', () => {
  it('is a urlset with the xhtml namespace', () => {
    const xml = buildSitemap();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.trim().endsWith('</urlset>')).toBe(true);
  });

  it('lists every page once per language', () => {
    const xml = buildSitemap();
    const pages = 1 + CATEGORIES.reduce((n, c) => n + 1 + c.items.length, 0);
    expect(xml.match(/<loc>/g)).toHaveLength(pages * LANGS.length);
    expect(xml).toContain('<loc>https://playrxjs.com/en</loc>');
    expect(xml).toContain('<loc>https://playrxjs.com/es/operators/transformation/switchMap</loc>');
  });

  it('adds hreflang alternates and x-default to each url', () => {
    const xml = buildSitemap();
    const home = xml.split('</url>')[0];
    expect(home).toContain('hreflang="en" href="https://playrxjs.com/en"');
    expect(home).toContain('hreflang="es" href="https://playrxjs.com/es"');
    expect(home).toContain('hreflang="x-default" href="https://playrxjs.com/en"');
  });

  it('leaves out lastmod and priority, which would not be accurate', () => {
    const xml = buildSitemap();
    expect(xml).not.toContain('<lastmod>');
    expect(xml).not.toContain('<priority>');
  });
});
