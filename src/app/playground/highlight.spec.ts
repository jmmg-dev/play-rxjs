import { highlightLines } from './highlight';

describe('highlightLines', () => {
  it('returns one HTML line per source line', () => {
    expect(highlightLines('a\nb\nc')).toHaveLength(3);
  });

  it('wraps tokens in the editor highlight classes', () => {
    const [line] = highlightLines('const x: number = 1; // hi');
    expect(line).toContain('<span class="tok-keyword">const</span>');
    expect(line).toContain('tok-number');
    expect(line).toContain('tok-comment');
    expect(line).toContain('tok-typeName');
  });

  it('escapes HTML in the source', () => {
    const [line] = highlightLines("const s = '<b>&</b>';");
    expect(line).toContain('&lt;b&gt;&amp;&lt;/b&gt;');
    expect(line).not.toContain('<b>');
  });

  it('keeps plain text without wrapping it', () => {
    expect(highlightLines('   ')).toEqual(['   ']);
  });
});
