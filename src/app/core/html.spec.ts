import { firstParagraph, stripHtml, truncate } from './html';

describe('stripHtml', () => {
  it('removes tags, entities and extra whitespace', () => {
    expect(stripHtml('<p>Hello <b>world</b>&nbsp;!</p>\n<p> Bye </p>')).toBe('Hello world! Bye');
  });

  it('removes the space left before punctuation', () => {
    expect(stripHtml('<b>map</b> , <i>filter</i> .')).toBe('map, filter.');
  });
});

describe('firstParagraph', () => {
  it('returns the inner markup of the first paragraph', () => {
    expect(firstParagraph('<p>One <b>bold</b></p><p>Two</p>')).toBe('One <b>bold</b>');
  });

  it('returns the input when there is no paragraph', () => {
    expect(firstParagraph('plain text')).toBe('plain text');
  });
});

describe('truncate', () => {
  it('keeps text that fits untouched', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('exactly10!', 10)).toBe('exactly10!');
  });

  it('cuts on a word boundary, drops trailing punctuation and adds an ellipsis', () => {
    expect(truncate('one two three, four five', 16)).toBe('one two three…');
  });

  it('uses 158 characters by default', () => {
    const result = truncate('word '.repeat(50));
    expect(result.length).toBeLessThanOrEqual(158);
    expect(result.endsWith('…')).toBe(true);
  });
});
