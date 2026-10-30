import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LANGS, Lang } from '../content/model';
import { I18n } from './i18n/i18n.service';
import { AUTHOR, OG_IMAGE, SITE_NAME, SITE_URL } from './site';

export interface Crumb {
  name: string;
  /** Path without language prefix ('' for home). */
  path: string;
}

export interface SeoData {
  title: string;
  description: string;
  /** Path without language prefix, starting with '/' or '' for home. */
  path: string;
  type?: 'website' | 'article';
  breadcrumbs?: Crumb[];
  /** Extra JSON-LD nodes appended to the page graph. */
  schema?: Record<string, unknown>[];
  noindex?: boolean;
}

const OG_LOCALES: Record<Lang, string> = { en: 'en_US', es: 'es_ES' };

export function localizedUrl(lang: Lang, path: string): string {
  return `${SITE_URL}/${lang}${path}`;
}

@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly i18n = inject(I18n);

  update(data: SeoData): void {
    const lang = this.i18n.lang();
    const url = localizedUrl(lang, data.path);
    const image = SITE_URL + OG_IMAGE.path;

    this.doc.documentElement.lang = lang;
    this.title.setTitle(data.title);

    const tags: [attr: 'name' | 'property', key: string, content: string][] = [
      ['name', 'description', data.description],
      ['name', 'keywords', this.i18n.t('seo.keywords')],
      ['name', 'author', AUTHOR.name],
      ['name', 'robots', data.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'],
      ['property', 'og:type', data.type ?? 'website'],
      ['property', 'og:site_name', SITE_NAME],
      ['property', 'og:title', data.title],
      ['property', 'og:description', data.description],
      ['property', 'og:url', url],
      ['property', 'og:locale', OG_LOCALES[lang]],
      ['property', 'og:image', image],
      ['property', 'og:image:width', String(OG_IMAGE.width)],
      ['property', 'og:image:height', String(OG_IMAGE.height)],
      ['property', 'og:image:alt', SITE_NAME],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', data.title],
      ['name', 'twitter:description', data.description],
      ['name', 'twitter:image', image],
    ];
    for (const [attr, key, content] of tags) {
      this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
    }
    this.meta.removeTag('property="og:locale:alternate"');
    for (const other of LANGS.filter((l) => l !== lang)) {
      this.meta.addTag({ property: 'og:locale:alternate', content: OG_LOCALES[other] });
    }

    this.setLinks(data, url);
    this.setJsonLd(data, lang, url);
  }

  private setLinks(data: SeoData, url: string): void {
    const head = this.doc.head;
    head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    const add = (attrs: Record<string, string>) => {
      const link = this.doc.createElement('link');
      Object.entries(attrs).forEach(([k, v]) => link.setAttribute(k, v));
      head.appendChild(link);
    };
    add({ rel: 'canonical', href: url });
    if (data.noindex) return;
    for (const lang of LANGS) {
      add({ rel: 'alternate', hreflang: lang, href: localizedUrl(lang, data.path) });
    }
    add({ rel: 'alternate', hreflang: 'x-default', href: localizedUrl('en', data.path) });
  }

  private setJsonLd(data: SeoData, lang: Lang, url: string): void {
    const website = {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: [...LANGS],
      author: { '@id': `${SITE_URL}/#author` },
    };
    const author = {
      '@type': 'Person',
      '@id': `${SITE_URL}/#author`,
      name: AUTHOR.name,
      jobTitle: AUTHOR.jobTitle,
      url: AUTHOR.portfolio,
      sameAs: [AUTHOR.linkedin],
    };
    const page = {
      '@type': data.type === 'article' ? 'TechArticle' : 'WebPage',
      '@id': `${url}#page`,
      url,
      name: data.title,
      headline: data.title,
      description: data.description,
      inLanguage: lang,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      author: { '@id': `${SITE_URL}/#author` },
      image: SITE_URL + OG_IMAGE.path,
      about: { '@type': 'Thing', name: 'RxJS', sameAs: 'https://rxjs.dev' },
    };
    const graph: Record<string, unknown>[] = [website, author, page, ...(data.schema ?? [])];
    if (data.breadcrumbs?.length) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: data.breadcrumbs.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: localizedUrl(lang, crumb.path),
        })),
      });
    }

    let script = this.doc.head.querySelector<HTMLScriptElement>('script#ld-json');
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'ld-json';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  }
}
