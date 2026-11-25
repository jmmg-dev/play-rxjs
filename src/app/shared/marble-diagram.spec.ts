import { TestBed } from '@angular/core/testing';
import { MarbleData } from '../content/model';
import { MarbleDiagram } from './marble-diagram';

class FakeObserver {
  static last?: FakeObserver;
  observed: Element[] = [];
  disconnected = false;
  constructor(readonly callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
    FakeObserver.last = this;
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
}

describe('MarbleDiagram', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
  });
  afterEach(() => vi.unstubAllGlobals());

  const render = async (data: MarbleData) => {
    const fixture = TestBed.createComponent(MarbleDiagram);
    fixture.componentRef.setInput('data', data);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  const pills = (el: HTMLElement) =>
    [...el.querySelectorAll('g.pill')].map((g) => ({
      tone: [...g.classList].find((c) => c.startsWith('pill--')),
      x: Number(g.querySelector('text')!.getAttribute('x')),
      label: g.querySelector('text')!.textContent,
    }));

  it('draws input and output lanes with the operator box and an accessible summary', async () => {
    const { el } = await render({
      op: 'map(x => x * 10)',
      duration: 100,
      inputs: [
        {
          events: [
            { t: 10, v: '1' },
            { t: 50, v: '2' },
          ],
          complete: 80,
        },
      ],
      outputs: [
        {
          events: [
            { t: 10, v: '10' },
            { t: 50, v: '20' },
          ],
          complete: 80,
        },
      ],
    });
    expect(el.querySelector('.op__text')?.textContent).toBe('map(x => x * 10)');
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toBe('map(x => x * 10) → 10, 20');
    expect(pills(el).map((p) => p.label)).toEqual(['1', '2', '10', '20']);
    expect(el.querySelectorAll('line.end')).toHaveLength(2);
    expect(el.querySelector('.lane__arrow')).toBeNull();
    expect(el.querySelector('.lane__label')).toBeNull();
  });

  it('colours letters pink, numbers cyan and anything else with the gradient', async () => {
    const { el } = await render({
      op: 'merge',
      duration: 100,
      inputs: [],
      outputs: [
        {
          events: [
            { t: 10, v: 'a' },
            { t: 40, v: '7' },
            { t: 70, v: '1a' },
          ],
        },
      ],
    });
    expect(pills(el).map((p) => p.tone)).toEqual(['pill--pink', 'pill--cyan', 'pill--grad']);
  });

  it('shows labels, errors and an open arrow for lanes that never end', async () => {
    const { el } = await render({
      op: 'combineLatest',
      duration: 100,
      inputs: [{ label: 'a$', events: [{ t: 10, v: 'a' }] }],
      outputs: [{ label: 'out', events: [{ t: 20, v: 'x' }], error: 90 }],
    });
    expect([...el.querySelectorAll('.lane__label')].map((t) => t.textContent)).toEqual([
      'a$',
      'out',
    ]);
    expect(el.querySelector('.end--error')).not.toBeNull();
    expect(el.querySelectorAll('.lane__arrow')).toHaveLength(1);
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toContain('out: x');
  });

  it('spreads simultaneous values and keeps the last one inside the diagram', async () => {
    const { el } = await render({
      op: 'of',
      duration: 100,
      inputs: [],
      outputs: [
        {
          events: [
            { t: 100, v: '1' },
            { t: 100, v: '2' },
            { t: 100, v: '3' },
          ],
          complete: 100,
        },
      ],
    });
    const xs = pills(el).map((p) => p.x);
    expect(xs[0]).toBeLessThan(xs[1]);
    expect(xs[1]).toBeLessThan(xs[2]);
    expect(xs[2]).toBeLessThanOrEqual(600 - 34 + 8);
  });

  it('plays the sweep once, the first time it is on screen', async () => {
    const { fixture, el } = await render({
      op: 'take(1)',
      duration: 10,
      inputs: [],
      outputs: [{ events: [] }],
    });
    const observer = FakeObserver.last!;
    expect(observer.observed[0]).toBe(el.querySelector('svg'));
    observer.callback([{ isIntersecting: false }]);
    await fixture.whenStable();
    expect(el.querySelector('.curtain--play')).toBeNull();
    observer.callback([{ isIntersecting: true }]);
    await fixture.whenStable();
    expect(el.querySelector('.curtain--play')).not.toBeNull();
    expect(observer.disconnected).toBe(true);
    fixture.destroy();
  });
});
