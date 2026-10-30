import { inject } from '@angular/core';
import { CanMatchFn, ResolveFn, Routes } from '@angular/router';
import { CATEGORIES, getItem, loadExamples, loadMarble } from './content/catalog';
import { CategoryKey, DEFAULT_LANG, ExampleDef, isLang, MarbleData } from './content/model';
import { I18n } from './core/i18n/i18n.service';
import { Shell } from './layout/shell';

const langGuard: CanMatchFn = (_route, segments) => isLang(segments[0]?.path);

const itemGuard: CanMatchFn = (route, segments) => {
  const id = segments.at(-1)?.path ?? '';
  return !!getItem(route.data?.['category'], id);
};

const i18nResolver: ResolveFn<boolean> = async (route) => {
  const lang = route.paramMap.get('lang');
  await inject(I18n).use(isLang(lang) ? lang : DEFAULT_LANG);
  return true;
};

const exampleResolver: ResolveFn<ExampleDef | undefined> = async (route) => {
  const examples = await loadExamples(route.data['category'] as CategoryKey);
  return examples[route.paramMap.get('id') ?? ''];
};

const marbleResolver: ResolveFn<MarbleData | undefined> = (route) =>
  loadMarble(route.data['category'] as CategoryKey, route.paramMap.get('id') ?? '');

const categoryPage = () => import('./pages/category-page').then((m) => m.CategoryPage);
const operatorPage = () => import('./pages/operator-page').then((m) => m.OperatorPage);
const notFoundPage = () => import('./pages/not-found-page').then((m) => m.NotFoundPage);

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: DEFAULT_LANG },
  {
    path: ':lang',
    canMatch: [langGuard],
    component: Shell,
    resolve: { i18n: i18nResolver },
    children: [
      { path: '', loadComponent: () => import('./pages/home-page').then((m) => m.HomePage) },
      ...CATEGORIES.flatMap((category) => [
        { path: category.path, loadComponent: categoryPage, data: { category: category.key } },
        {
          path: `${category.path}/:id`,
          canMatch: [itemGuard],
          loadComponent: operatorPage,
          data: { category: category.key },
          resolve: { example: exampleResolver, marble: marbleResolver },
        },
      ]),
      { path: '**', loadComponent: notFoundPage },
    ],
  },
  {
    path: '**',
    component: Shell,
    resolve: { i18n: i18nResolver },
    children: [{ path: '**', loadComponent: notFoundPage }],
  },
];
