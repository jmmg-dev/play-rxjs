import { Injectable, signal } from '@angular/core';
import { DEFAULT_LANG, Lang } from '../../content/model';

type Dict = Record<string, unknown>;

const loaders: Record<Lang, () => Promise<{ default: Dict }>> = {
  en: () => import('./locales/en.json'),
  es: () => import('./locales/es.json'),
};

/**
 * Minimal signal based i18n. Dictionaries are lazy chunks resolved by the router
 * before rendering, so the server always outputs the page in the right language.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<Lang>(DEFAULT_LANG);
  private readonly dict = signal<Dict>({});
  private readonly cache = new Map<Lang, Dict>();

  async use(lang: Lang): Promise<void> {
    let dict = this.cache.get(lang);
    if (!dict) {
      dict = (await loaders[lang]()).default;
      this.cache.set(lang, dict);
    }
    this.dict.set(dict);
    this.lang.set(lang);
  }

  /** Translates a dotted key. Missing keys return the key itself. */
  t(key: string, params?: Record<string, string | number>): string {
    let node: unknown = this.dict();
    for (const part of key.split('.')) {
      node = node && typeof node === 'object' ? (node as Dict)[part] : undefined;
    }
    if (typeof node !== 'string') return key;
    return params ? node.replace(/\{(\w+)\}/g, (_, p: string) => String(params[p] ?? '')) : node;
  }

  has(key: string): boolean {
    return this.t(key) !== key;
  }
}
