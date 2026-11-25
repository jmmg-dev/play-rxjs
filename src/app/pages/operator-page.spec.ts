import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CATEGORIES, FLAT_ITEMS } from '../content/catalog';
import { CategoryKey, ExampleDef, MarbleData } from '../content/model';
import { I18n } from '../core/i18n/i18n.service';
import { OperatorPage } from './operator-page';

class NoopObserver {
  observe() {
    // Diagrams never scroll into view in jsdom
  }
  disconnect() {
    // Nothing to release
  }
}

describe('OperatorPage', () => {
  beforeEach(() => vi.stubGlobal('IntersectionObserver', NoopObserver));
  afterEach(() => vi.unstubAllGlobals());

  const render = async (
    category: CategoryKey,
    id: string,
    extra: { example?: ExampleDef; marble?: MarbleData } = {},
  ) => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    await TestBed.inject(I18n).use('en');
    const fixture = TestBed.createComponent(OperatorPage);
    fixture.componentRef.setInput('category', category);
    fixture.componentRef.setInput('id', id);
    if (extra.example) fixture.componentRef.setInput('example', extra.example);
    if (extra.marble) fixture.componentRef.setInput('marble', extra.marble);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };
  const ldGraph = () =>
    JSON.parse(TestBed.inject(DOCUMENT).head.querySelector('script#ld-json')!.textContent!)[
      '@graph'
    ];

  it('shows the title, description, breadcrumbs and links to its category', async () => {
    const el = await render('transformation', 'switchMap');
    expect(el.querySelector('h1')?.textContent).toContain('switchMap');
    expect(el.querySelector('h1')?.classList).toContain('mono');
    expect(el.querySelector('.doc__description')?.innerHTML).toContain('<p>');
    expect(el.querySelector('.doc__category')?.getAttribute('href')).toBe(
      '/en/operators/transformation',
    );
    expect(el.querySelectorAll('.crumbs li')).toHaveLength(3);
  });

  it('links the previous and next pages and the other items of the section', async () => {
    const index = FLAT_ITEMS.findIndex((e) => e.item.id === 'switchMap');
    const el = await render('transformation', 'switchMap');
    const prev = FLAT_ITEMS[index - 1];
    const next = FLAT_ITEMS[index + 1];
    expect(el.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe(
      `/en/${prev.category.path}/${prev.item.id}`,
    );
    expect(el.querySelector('a[rel="next"]')?.getAttribute('href')).toBe(
      `/en/${next.category.path}/${next.item.id}`,
    );
    const transformation = CATEGORIES.find((c) => c.key === 'transformation')!;
    expect(el.querySelectorAll('.related a.chip')).toHaveLength(transformation.items.length - 1);
  });

  it('has no previous link on the first page and no next link on the last one', async () => {
    const first = FLAT_ITEMS[0];
    let el = await render(first.category.key, first.item.id);
    expect(el.querySelector('a[rel="prev"]')).toBeNull();
    expect(el.querySelector('h1')?.classList).not.toContain('mono');
    TestBed.resetTestingModule();
    const last = FLAT_ITEMS.at(-1)!;
    el = await render(last.category.key, last.item.id);
    expect(el.querySelector('a[rel="next"]')).toBeNull();
  });

  it('warns about deprecated operators and badges new ones', async () => {
    let el = await render('combination', 'exhaust');
    expect(el.querySelector('.callout code')?.textContent).toBe('exhaustAll');
    expect(el.querySelector('.badge--deprecated')).not.toBeNull();
    TestBed.resetTestingModule();
    el = await render('combination', 'exhaustAll');
    expect(el.querySelector('.badge--new')).not.toBeNull();
    expect(el.querySelector('.callout')).toBeNull();
  });

  it('renders the marble diagram and the playground when they exist', async () => {
    const el = await render('transformation', 'map', {
      example: { code: 'of(1).pipe(map((x) => x * 2))' },
      marble: { op: 'map', duration: 10, inputs: [], outputs: [{ events: [{ t: 1, v: '2' }] }] },
    });
    expect(el.querySelector('app-marble-diagram')).not.toBeNull();
    expect(el.querySelector('#playground-title')).not.toBeNull();
    expect(el.querySelector('app-playground')).not.toBeNull();
  });

  it('publishes an article with its source code in JSON-LD', async () => {
    await render('transformation', 'map', { example: { code: 'of(1)' } });
    const doc = TestBed.inject(DOCUMENT);
    expect(doc.title).toMatch(/^map · .+ \| Play RxJS$/);
    expect(doc.head.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe(
      'article',
    );
    const code = ldGraph().find((n: { '@type': string }) => n['@type'] === 'SoftwareSourceCode');
    expect(code).toMatchObject({
      text: 'of(1)',
      programmingLanguage: 'TypeScript',
      inLanguage: 'en',
    });
  });

  it('omits the playground and the code schema when there is no example', async () => {
    const el = await render('transformation', 'map');
    expect(el.querySelector('app-playground')).toBeNull();
    expect(el.querySelector('app-marble-diagram')).toBeNull();
    expect(ldGraph().some((n: { '@type': string }) => n['@type'] === 'SoftwareSourceCode')).toBe(
      false,
    );
  });
});
