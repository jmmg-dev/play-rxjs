import { transpile } from './transpile';

describe('transpile', () => {
  it('strips TypeScript types and turns imports into require calls', () => {
    const js = transpile("import { of } from 'rxjs';\nconst n: number = 1;\nof(n).subscribe();");
    expect(js).toContain("require('rxjs')");
    expect(js).not.toContain(': number');
  });

  it('keeps modern syntax untouched', () => {
    expect(transpile('const f = async (a = 1) => a ?? 2;')).toContain('async (a = 1) => a ?? 2');
  });

  it('throws on invalid code', () => {
    expect(() => transpile('const = ;')).toThrow();
  });
});
