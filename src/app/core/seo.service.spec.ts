import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n/i18n.service';
import { localizedUrl, Seo } from './seo.service';

describe('Seo', () => {
  let seo: Seo;
  let doc: Document;

  const meta = (selector: string) =>
    doc.head.querySelector(`meta[${selector}]`)?.getAttribute('content');
  const ldJson = () => JSON.parse(doc.head.querySelector('script#ld-json')!.textContent!);

  beforeEach(async () => {
    await TestBed.inject(I18n).use('es');
    seo = TestBed.inject(Seo);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    doc.head
      .querySelectorAll('meta, link[rel="canonical"], link[rel="alternate"], script#ld-json')
      .forEach((el) => el.remove());
  });

  it('builds absolute localized urls on the production domain', () => {
    expect(localizedUrl('en', '')).toBe('https://playrxjs.com/en');
    expect(localizedUrl('es', '/subjects')).toBe('https://playrxjs.com/es/subjects');
  });

  it('sets the title, language, description and indexable robots tag', () => {
    seo.update({ title: 'Título', description: 'Descripción', path: '/subjects' });
    expect(doc.title).toBe('Título');
    expect(doc.documentElement.lang).toBe('es');
    expect(meta('name="description"')).toBe('Descripción');
    expect(meta('name="robots"')).toContain('index, follow');
    expect(meta('name="keywords"')).toContain('RxJS');
  });

  it('fills Open Graph and Twitter cards with absolute urls and the page locale', () => {
    seo.update({ title: 'T', description: 'D', path: '/subjects' });
    expect(meta('property="og:url"')).toBe('https://playrxjs.com/es/subjects');
    expect(meta('property="og:type"')).toBe('website');
    expect(meta('property="og:locale"')).toBe('es_ES');
    expect(meta('property="og:image"')).toBe('https://playrxjs.com/images/social_media.jpg');
    expect(meta('name="twitter:card"')).toBe('summary_large_image');
    const alternates = [...doc.head.querySelectorAll('meta[property="og:locale:alternate"]')];
    expect(alternates.map((m) => m.getAttribute('content'))).toEqual(['en_US']);
  });

  it('adds a self canonical and hreflang links for every language plus x-default', () => {
    seo.update({ title: 'T', description: 'D', path: '/subjects' });
    const href = (sel: string) => doc.head.querySelector(sel)?.getAttribute('href');
    expect(href('link[rel="canonical"]')).toBe('https://playrxjs.com/es/subjects');
    expect(href('link[hreflang="en"]')).toBe('https://playrxjs.com/en/subjects');
    expect(href('link[hreflang="es"]')).toBe('https://playrxjs.com/es/subjects');
    expect(href('link[hreflang="x-default"]')).toBe('https://playrxjs.com/en/subjects');
  });

  it('replaces the previous tags instead of duplicating them', () => {
    seo.update({ title: 'A', description: 'A', path: '' });
    seo.update({ title: 'B', description: 'B', path: '/x' });
    expect(doc.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(doc.head.querySelectorAll('link[hreflang]')).toHaveLength(3);
    expect(doc.head.querySelectorAll('meta[property="og:locale:alternate"]')).toHaveLength(1);
    expect(doc.head.querySelectorAll('script#ld-json')).toHaveLength(1);
    expect(meta('name="description"')).toBe('B');
  });

  it('marks noindex pages and skips their hreflang links', () => {
    seo.update({ title: 'T', description: 'D', path: '/missing', noindex: true });
    expect(meta('name="robots"')).toBe('noindex, follow');
    expect(doc.head.querySelector('link[rel="canonical"]')).not.toBeNull();
    expect(doc.head.querySelector('link[hreflang]')).toBeNull();
  });

  it('describes the site, the author and the page in JSON-LD', () => {
    seo.update({ title: 'T', description: 'D', path: '' });
    const graph = ldJson()['@graph'];
    const website = graph.find((n: { '@type': string }) => n['@type'] === 'WebSite');
    const person = graph.find((n: { '@type': string }) => n['@type'] === 'Person');
    const page = graph.find((n: { '@type': string }) => n['@type'] === 'WebPage');
    expect(website.url).toBe('https://playrxjs.com');
    expect(website.sameAs).toEqual(['https://github.com/jmmg-dev/play-rxjs']);
    expect(person.url).toBe('https://jmmg.dev');
    expect(page.inLanguage).toBe('es');
    expect(page.url).toBe('https://playrxjs.com/es');
    expect(graph.some((n: { '@type': string }) => n['@type'] === 'BreadcrumbList')).toBe(false);
  });

  it('uses TechArticle for articles and adds breadcrumbs and extra schema nodes', () => {
    seo.update({
      title: 'map',
      description: 'D',
      path: '/operators/transformation/map',
      type: 'article',
      breadcrumbs: [
        { name: 'Inicio', path: '' },
        { name: 'map', path: '/operators/transformation/map' },
      ],
      schema: [{ '@type': 'HowTo', name: 'extra' }],
    });
    expect(meta('property="og:type"')).toBe('article');
    const graph = ldJson()['@graph'];
    expect(graph.some((n: { '@type': string }) => n['@type'] === 'TechArticle')).toBe(true);
    expect(graph.some((n: { '@type': string }) => n['@type'] === 'HowTo')).toBe(true);
    const crumbs = graph.find((n: { '@type': string }) => n['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'map',
      item: 'https://playrxjs.com/es/operators/transformation/map',
    });
  });

  it('escapes < in JSON-LD so the script cannot be closed early', () => {
    seo.update({ title: '</script><b>', description: 'D', path: '' });
    const raw = doc.head.querySelector('script#ld-json')!.textContent!;
    expect(raw).not.toContain('</script>');
    expect(ldJson()['@graph'].find((n: { '@type': string }) => n['@type'] === 'WebPage').name).toBe(
      '</script><b>',
    );
  });
});
