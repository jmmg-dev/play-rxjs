import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CATEGORIES, getCategory } from '../content/catalog';
import { CategoryKey } from '../content/model';
import { I18n } from '../core/i18n/i18n.service';
import { CategoryPage } from './category-page';

describe('CategoryPage', () => {
  const render = async (category: CategoryKey) => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(I18n).use('en');
    const fixture = TestBed.createComponent(CategoryPage);
    fixture.componentRef.setInput('category', category);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };
  const ldGraph = () =>
    JSON.parse(TestBed.inject(DOCUMENT).head.querySelector('script#ld-json')!.textContent!)[
      '@graph'
    ];

  it('lists a card per item linking to its page, with code style for operators', async () => {
    const el = await render('combination');
    const cat = getCategory('combination')!;
    const cards = el.querySelectorAll<HTMLAnchorElement>('a.card');
    expect(cards).toHaveLength(cat.items.length);
    expect(cards[0].getAttribute('href')).toBe(`/en/${cat.path}/${cat.items[0].id}`);
    expect(el.querySelector('.card__title')?.classList).toContain('mono');
    expect(el.querySelectorAll('.badge--new').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('.badge--deprecated').length).toBeGreaterThan(0);
    expect(el.querySelector('.card__text')?.innerHTML).not.toContain('<p>');
  });

  it('uses normal text for concept pages and links every other section', async () => {
    const el = await render('basicConcepts');
    expect(el.querySelector('.card__title')?.classList).not.toContain('mono');
    expect(el.querySelectorAll('.others a.chip')).toHaveLength(CATEGORIES.length - 1);
    expect(el.querySelectorAll('.crumbs li')).toHaveLength(2);
  });

  it('publishes SEO data with the category list and breadcrumbs', async () => {
    await render('filtering');
    const doc = TestBed.inject(DOCUMENT);
    const title = TestBed.inject(I18n).t('filtering.title');
    expect(doc.title).toBe(TestBed.inject(I18n).t('seo.categoryTitle', { title }));
    const description = doc.head
      .querySelector('meta[name="description"]')!
      .getAttribute('content')!;
    expect(description.length).toBeLessThanOrEqual(158);
    expect(description).not.toMatch(/<[^>]+>/);
    const list = ldGraph().find((n: { '@type': string }) => n['@type'] === 'ItemList');
    expect(list.numberOfItems).toBe(getCategory('filtering')!.items.length);
    expect(list.itemListElement[0].url).toMatch(
      /^https:\/\/playrxjs\.com\/en\/operators\/filtering\//,
    );
  });
});
