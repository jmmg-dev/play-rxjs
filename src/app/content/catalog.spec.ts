import {
  CATEGORIES,
  FLAT_ITEMS,
  getCategory,
  getItem,
  GROUPS,
  loadExamples,
  loadMarble,
  OPERATOR_CATEGORIES,
  TOTAL_ITEMS,
  TOTAL_OPERATORS,
} from './catalog';

describe('catalog', () => {
  it('has unique category keys and paths', () => {
    expect(new Set(CATEGORIES.map((c) => c.key)).size).toBe(CATEGORIES.length);
    expect(new Set(CATEGORIES.map((c) => c.path)).size).toBe(CATEGORIES.length);
  });

  it('places every category in a known group', () => {
    for (const c of CATEGORIES) expect(GROUPS).toContain(c.group);
  });

  it('has unique item ids inside each category', () => {
    for (const c of CATEGORIES) expect(new Set(c.items.map((i) => i.id)).size).toBe(c.items.length);
  });

  it('only counts operator categories in the operator totals', () => {
    expect(OPERATOR_CATEGORIES.every((c) => c.group === 'operators')).toBe(true);
    expect(TOTAL_OPERATORS).toBe(OPERATOR_CATEGORIES.reduce((n, c) => n + c.items.length, 0));
    expect(TOTAL_ITEMS).toBe(FLAT_ITEMS.length);
    expect(TOTAL_ITEMS).toBeGreaterThan(TOTAL_OPERATORS);
  });

  it('keeps the flat list in catalog order', () => {
    expect(FLAT_ITEMS[0].category).toBe(CATEGORIES[0]);
    expect(FLAT_ITEMS.at(-1)?.category).toBe(CATEGORIES.at(-1));
  });

  it('finds categories by key and returns undefined otherwise', () => {
    expect(getCategory('filtering')?.path).toBe('operators/filtering');
    expect(getCategory('nope')).toBeUndefined();
    expect(getCategory(undefined)).toBeUndefined();
    expect(getCategory(null)).toBeUndefined();
  });

  it('finds items inside a category', () => {
    expect(getItem('transformation', 'switchMap')).toEqual({ id: 'switchMap' });
    expect(getItem('combination', 'exhaust')?.deprecated).toBe('exhaustAll');
    expect(getItem('transformation', 'nope')).toBeUndefined();
    expect(getItem('nope', 'switchMap')).toBeUndefined();
  });

  it('loads an example for every item of every category', async () => {
    for (const c of CATEGORIES) {
      const examples = await loadExamples(c.key);
      for (const item of c.items)
        expect(examples[item.id]?.code, `${c.key}/${item.id}`).toBeTruthy();
    }
  });

  it('loads a marble diagram when it exists', async () => {
    const marble = await loadMarble('transformation', 'map');
    expect(marble?.op).toBeTruthy();
    expect(marble?.outputs.length).toBeGreaterThan(0);
    expect(await loadMarble('transformation', 'nope')).toBeUndefined();
  });
});
