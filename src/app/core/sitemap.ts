import { CATEGORIES } from '../content/catalog';
import { LANGS } from '../content/model';
import { localizedUrl } from './seo.service';

/**
 * XML sitemap with hreflang alternates for every documentation page.
 * No lastmod (it would be the request date, which search engines learn to ignore) and no
 * priority (Google ignores it).
 */
export function buildSitemap(): string {
  const paths = [
    '',
    ...CATEGORIES.flatMap((c) => [`/${c.path}`, ...c.items.map((i) => `/${c.path}/${i.id}`)]),
  ];
  const urls = paths.flatMap((path) =>
    LANGS.map((lang) => {
      const alternates = [
        ...LANGS.map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${localizedUrl(l, path)}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl('en', path)}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${localizedUrl(lang, path)}</loc>\n${alternates}\n  </url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}
