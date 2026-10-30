import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { CATEGORIES } from './content/catalog';
import { LANGS } from './content/model';

const langParams = async () => LANGS.map((lang) => ({ lang }));

/** Every documentation page is prerendered (SSG) per language; anything else is rendered on demand. */
export const serverRoutes: ServerRoute[] = [
  { path: ':lang', renderMode: RenderMode.Prerender, getPrerenderParams: langParams },
  ...CATEGORIES.flatMap((category): ServerRoute[] => [
    {
      path: `:lang/${category.path}`,
      renderMode: RenderMode.Prerender,
      getPrerenderParams: langParams,
    },
    {
      path: `:lang/${category.path}/:id`,
      renderMode: RenderMode.Prerender,
      fallback: PrerenderFallback.Server,
      getPrerenderParams: async () =>
        LANGS.flatMap((lang) => category.items.map((item) => ({ lang, id: item.id }))),
    },
  ]),
  { path: '**', renderMode: RenderMode.Server },
];
