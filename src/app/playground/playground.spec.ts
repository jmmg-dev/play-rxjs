import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorView } from '@codemirror/view';
import { I18n } from '../core/i18n/i18n.service';
import { Playground } from './playground';

describe('Playground', () => {
  let fixture: ComponentFixture<Playground>;
  let el: HTMLElement;

  const button = (selector: string) => el.querySelector<HTMLButtonElement>(selector)!;
  const resetButton = () =>
    [...el.querySelectorAll<HTMLButtonElement>('.pg__actions button')].find((b) =>
      b.textContent?.includes('Reset'),
    )!;
  const frame = () => el.querySelector('iframe');
  const fromFrame = async (data: unknown) => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { tag: 'playrxjs', ...(data as object) },
        source: frame()!.contentWindow,
      }),
    );
    await fixture.whenStable();
  };
  const logs = () =>
    [...el.querySelectorAll('.pg__logs .log')].map(
      (li) => li.querySelector('.log__text')?.textContent,
    );
  const loadEditor = async () => {
    el.querySelector<HTMLElement>('.pg__static')!.dispatchEvent(new Event('focus'));
    await vi.waitFor(() => expect(el.querySelector('.cm-editor')).not.toBeNull());
    await fixture.whenStable();
    return EditorView.findFromDOM(el.querySelector('.cm-editor')!)!;
  };

  beforeEach(async () => {
    await TestBed.inject(I18n).use('en');
    fixture = TestBed.createComponent(Playground);
    fixture.componentRef.setInput(
      'code',
      "import { of } from 'rxjs';\nof(1, 2).subscribe(console.log);",
    );
    fixture.componentRef.setInput('name', 'of');
    el = fixture.nativeElement;
    document.body.appendChild(el);
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    el.remove();
  });

  it('shows the highlighted code with line numbers before the editor loads', () => {
    expect(el.querySelector('.pg__file')?.textContent).toContain('of.ts');
    expect(el.querySelectorAll('.pg__gutter span')).toHaveLength(2);
    expect(el.querySelector('.pg__code')?.innerHTML).toContain('tok-');
    expect(el.querySelector('.pg__static')?.getAttribute('aria-label')).toContain('of');
    expect(el.querySelector('.pg__info')).toBeNull();
    expect(resetButton().disabled).toBe(true);
    expect(el.querySelector('.pg__empty')?.textContent).toBeTruthy();
  });

  it('upgrades to the CodeMirror editor when focused, and only once', async () => {
    const view = await loadEditor();
    expect(view.state.doc.toString()).toContain('of(1, 2)');
    expect(el.querySelector('.pg__static')).toBeNull();
    await (fixture.componentInstance as unknown as { loadEditor(): Promise<void> }).loadEditor();
    expect(el.querySelectorAll('.cm-editor')).toHaveLength(1);
  });

  it('loads the editor on its own when the browser is idle', async () => {
    vi.useFakeTimers();
    const local = TestBed.createComponent(Playground);
    local.componentRef.setInput('code', 'of(1)');
    local.componentRef.setInput('name', 'idle');
    local.detectChanges();
    await vi.advanceTimersByTimeAsync(1600);
    vi.useRealTimers();
    await vi.waitFor(() => expect(local.nativeElement.querySelector('.cm-editor')).not.toBeNull());
    local.destroy();
  });

  it('marks the example as modified after editing and restores it with Reset', async () => {
    const view = await loadEditor();
    view.dispatch({ changes: { from: 0, insert: '// edited\n' } });
    await fixture.whenStable();
    expect(el.querySelector('.pg__modified')).not.toBeNull();
    expect(resetButton().disabled).toBe(false);
    resetButton().click();
    await fixture.whenStable();
    expect(el.querySelector('.pg__modified')).toBeNull();
    expect(view.state.doc.toString()).not.toContain('// edited');
  });

  it('runs the code in the sandbox, shows its logs and stops', async () => {
    button('.pg__run').click();
    await vi.waitFor(() => expect(frame()).not.toBeNull(), 5000);
    await fixture.whenStable();
    expect(el.querySelector('.pg')?.classList).toContain('pg--running');
    expect(el.querySelector('.pg__empty')?.textContent).toContain('Running…');

    const post = vi.spyOn(frame()!.contentWindow!, 'postMessage');
    await fromFrame({ type: 'ready' });
    expect(post.mock.calls[0][0]).toMatchObject({ type: 'run' });
    expect((post.mock.calls[0][0] as { code: string }).code).toContain("require('rxjs')");

    await fromFrame({ type: 'log', payload: { level: 'log', text: '1' } });
    await fromFrame({ type: 'log', payload: { level: 'error', text: 'boom' } });
    await fromFrame({ type: 'height', payload: 80 });
    expect(logs()).toEqual(['1', 'boom']);
    expect(el.querySelector('.log--error')).not.toBeNull();
    expect(el.querySelector<HTMLElement>('.pg__sandbox')!.style.height).toBe('80px');

    button('.btn--secondary').click();
    await fixture.whenStable();
    expect(frame()).toBeNull();
    expect(el.querySelector('.pg')?.classList).not.toContain('pg--running');
    expect(logs()).toEqual(['1', 'boom']);

    button('.pg__clear').click();
    await fixture.whenStable();
    expect(logs()).toEqual([]);
  });

  it('runs with Ctrl+Enter from the editor using the edited code', async () => {
    const view = await loadEditor();
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: 'console.log(userService)' },
    });
    el.querySelector('.cm-content')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await vi.waitFor(() => expect(frame()).not.toBeNull(), 5000);
    expect(frame()!.srcdoc).toContain('userService');
  });

  it('reports compile errors in the console without running', async () => {
    const view = await loadEditor();
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: 'const = ;' } });
    button('.pg__run').click();
    await vi.waitFor(() => expect(logs().length).toBe(1), 5000);
    expect(logs()[0]).toContain('Compilation error');
    expect(frame()).toBeNull();
  });

  it('keeps only the last 300 log lines', async () => {
    button('.pg__run').click();
    await vi.waitFor(() => expect(frame()).not.toBeNull(), 5000);
    for (let i = 0; i < 305; i++) {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { tag: 'playrxjs', type: 'log', payload: { level: 'log', text: String(i) } },
          source: frame()!.contentWindow,
        }),
      );
    }
    await fixture.whenStable();
    expect(logs()).toHaveLength(300);
    expect(logs()[0]).toBe('5');
  });

  it('shows the explanation panel when the example has one', async () => {
    fixture.componentRef.setInput('info', '<p>What it does</p>');
    await fixture.whenStable();
    const toggle = button('.pg__info-toggle');
    const panel = el.querySelector<HTMLElement>('.pg__info')!;
    expect(panel.textContent).toContain('What it does');
    expect(panel.hasAttribute('inert')).toBe(true);
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(false);
  });

  it('does not start running when destroyed while compiling', async () => {
    button('.pg__run').click();
    fixture.destroy();
    await new Promise((r) => setTimeout(r, 50));
    expect(frame()).toBeNull();
  });
});
