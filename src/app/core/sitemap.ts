import { CATEGORIES } from '../content/catalog';
import { LANGS } from '../content/model';
import { localizedUrl } from './seo.service';

/** XML sitemap with hreflang alternates for every documentation page. */
export function buildSitemap(): string {
  const paths = [
    { path: '', priority: '1.0' },
    ...CATEGORIES.flatMap((c) => [
      { path: `/${c.path}`, priority: '0.8' },
      ...c.items.map((i) => ({ path: `/${c.path}/${i.id}`, priority: '0.7' })),
    ]),
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = paths.flatMap(({ path, priority }) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${localizedUrl(l, path)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl('en', path)}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${localizedUrl(lang, path)}</loc>\n${alternates}\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}
