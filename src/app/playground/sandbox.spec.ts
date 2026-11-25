import type { Mock } from 'vitest';
import { buildSrcdoc, Sandbox, SandboxHandlers, SandboxLabels } from './sandbox';

const labels: SandboxLabels = {
  running: 'Running <now>',
  helpers: 'userService "ready"',
  label: (key) => `label:${key}`,
};

describe('buildSrcdoc', () => {
  it('loads RxJS, renders the UI controls with escaped labels and injects the runtime', () => {
    const html = buildSrcdoc(
      'https://x.test/rxjs.js',
      [
        { kind: 'button', id: 'btn-a', label: 'click' },
        { kind: 'button', id: 'btn-b', label: 'other', variant: 'secondary' },
        { kind: 'input', id: 'in', placeholder: 'type' },
        { kind: 'box', id: 'box' },
      ],
      labels,
    );
    expect(html).toContain('<script src="https://x.test/rxjs.js"></script>');
    expect(html).toContain(
      '<button type="button" id="btn-a" class="btn btn--primary">label:click</button>',
    );
    expect(html).toContain('class="btn btn--secondary">label:other</button>');
    expect(html).toContain('id="in" class="input" autocomplete="off" placeholder="label:type"');
    expect(html).toContain('<div class="track"><div id="box" class="box"></div></div>');
    expect(html).toContain('Running &lt;now&gt;');
    expect(html).toContain('userService &quot;ready&quot;');
    expect(html).toContain("var TAG = 'playrxjs'");
  });

  it('leaves the UI empty when the example has no controls', () => {
    expect(buildSrcdoc('r.js', [], labels)).toContain('<div class="ui"></div>');
  });
});

describe('Sandbox', () => {
  let host: HTMLElement;
  let onLog: Mock<SandboxHandlers['onLog']>;
  let onHeight: Mock<SandboxHandlers['onHeight']>;
  let sandbox: Sandbox;

  const frame = () => host.querySelector('iframe')!;
  const fromFrame = (data: unknown, source: MessageEventSource | null = frame().contentWindow) =>
    window.dispatchEvent(new MessageEvent('message', { data, source }));

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    onLog = vi.fn<SandboxHandlers['onLog']>();
    onHeight = vi.fn<SandboxHandlers['onHeight']>();
    sandbox = new Sandbox(host, { onLog, onHeight });
  });

  afterEach(() => {
    sandbox.destroy();
    host.remove();
  });

  it('runs the code in a sandboxed iframe that only allows scripts', () => {
    expect(sandbox.running).toBe(false);
    sandbox.run('console.log(1)', [], labels);
    expect(sandbox.running).toBe(true);
    expect(frame().getAttribute('sandbox')).toBe('allow-scripts');
    expect(frame().getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(frame().srcdoc).toContain(`${location.origin}/vendor/rxjs.umd.min.js`);
  });

  it('sends the code once the frame is ready, and only once', () => {
    sandbox.run('the code', [], labels);
    const post = vi.spyOn(frame().contentWindow!, 'postMessage');
    fromFrame({ tag: 'playrxjs', type: 'ready' });
    fromFrame({ tag: 'playrxjs', type: 'ready' });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith({ tag: 'playrxjs', type: 'run', code: 'the code' }, '*');
  });

  it('forwards logs and heights reported by the frame', () => {
    sandbox.run('x', [], labels);
    fromFrame({ tag: 'playrxjs', type: 'log', payload: { level: 'warn', text: 'careful' } });
    fromFrame({ tag: 'playrxjs', type: 'height', payload: 120 });
    fromFrame({ tag: 'playrxjs', type: 'height', payload: 'not a number' });
    expect(onLog).toHaveBeenCalledWith('warn', 'careful');
    expect(onHeight.mock.calls).toEqual([[120], [0]]);
  });

  it('ignores messages from other windows, without the tag or of unknown type', () => {
    fromFrame(
      { tag: 'playrxjs', type: 'log', payload: { level: 'log', text: 'no frame yet' } },
      window,
    );
    sandbox.run('x', [], labels);
    fromFrame(
      { tag: 'playrxjs', type: 'log', payload: { level: 'log', text: 'from page' } },
      window,
    );
    fromFrame({ type: 'log', payload: { level: 'log', text: 'untagged' } });
    fromFrame(null);
    fromFrame({ tag: 'playrxjs', type: 'other' });
    expect(onLog).not.toHaveBeenCalled();
  });

  it('replaces the frame on every run and removes it when stopped', () => {
    sandbox.run('a', [], labels);
    const first = frame();
    sandbox.run('b', [], labels);
    expect(host.querySelectorAll('iframe')).toHaveLength(1);
    expect(frame()).not.toBe(first);
    sandbox.stop();
    expect(host.querySelector('iframe')).toBeNull();
    expect(sandbox.running).toBe(false);
  });

  it('stops listening to messages once destroyed', () => {
    sandbox.run('x', [], labels);
    const win = frame().contentWindow;
    sandbox.destroy();
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { tag: 'playrxjs', type: 'log', payload: {} },
        source: win,
      }),
    );
    expect(onLog).not.toHaveBeenCalled();
  });
});
