import { UiControl } from '../content/model';

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'system';

export interface SandboxHandlers {
  onLog: (level: LogLevel, text: string) => void;
  onHeight: (height: number) => void;
}

export interface SandboxLabels {
  running: string;
  helpers: string;
  /** Resolves a UI label / placeholder key. */
  label: (key: string) => string;
}

const MESSAGE_TAG = 'playrxjs';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderUi(ui: UiControl[], labels: SandboxLabels): string {
  return ui
    .map((control) => {
      switch (control.kind) {
        case 'button':
          return `<button type="button" id="${control.id}" class="btn btn--${control.variant ?? 'primary'}">${escapeHtml(labels.label(control.label))}</button>`;
        case 'input':
          return `<input type="text" id="${control.id}" class="input" autocomplete="off" placeholder="${escapeHtml(labels.label(control.placeholder))}" />`;
        case 'box':
          return `<div class="track"><div id="${control.id}" class="box"></div></div>`;
      }
    })
    .join('');
}

/**
 * Runtime injected into the sandbox iframe. It is plain ES5-ish JS on purpose and
 * communicates with the host page exclusively through postMessage.
 */
const RUNTIME = `
(function () {
  var TAG = '${MESSAGE_TAG}';
  var host = window.parent;
  function send(type, payload) { host.postMessage({ tag: TAG, type: type, payload: payload }, '*'); }

  function fmt(v, depth, seen) {
    depth = depth || 0; seen = seen || [];
    if (v === null) return 'null';
    var t = typeof v;
    if (t === 'undefined') return 'undefined';
    if (t === 'string') return depth ? "'" + v + "'" : v;
    if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
    if (t === 'symbol') return v.toString();
    if (t === 'function') return '[Function' + (v.name ? ': ' + v.name : '') + ']';
    if (v instanceof Error) return v.name + ': ' + v.message;
    if (typeof Event !== 'undefined' && v instanceof Event) return '[' + v.constructor.name + ' ' + v.type + ']';
    if (typeof Node !== 'undefined' && v instanceof Node) return '<' + v.nodeName.toLowerCase() + (v.id ? '#' + v.id : '') + '>';
    if (v instanceof Date) return v.toISOString();
    if (seen.indexOf(v) >= 0) return '[Circular]';
    if (depth > 5) return Array.isArray(v) ? '[…]' : '{…}';
    seen = seen.concat([v]);
    var isArr = Array.isArray(v);
    var keys = isArr ? null : Object.keys(v);
    var parts = isArr
      ? v.map(function (x) { return fmt(x, depth + 1, seen); })
      : keys.map(function (k) { return (/^[A-Za-z_$][\\w$]*$/.test(k) ? k : "'" + k + "'") + ': ' + fmt(v[k], depth + 1, seen); });
    var ctor = v.constructor && v.constructor.name;
    var prefix = !isArr && ctor && ctor !== 'Object' ? ctor + ' ' : '';
    var open = isArr ? '[' : '{', close = isArr ? ']' : '}';
    if (!parts.length) return prefix + open + close;
    var compact = prefix + open + (isArr ? '' : ' ') + parts.join(', ') + (isArr ? '' : ' ') + close;
    if (compact.length <= 72 && compact.indexOf('\\n') < 0) return compact;
    var pad = new Array(depth + 2).join('  ');
    return prefix + open + '\\n' + pad + parts.join(',\\n' + pad) + '\\n' + pad.slice(2) + close;
  }

  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (level) {
    console[level] = function () {
      var text = Array.prototype.slice.call(arguments).map(function (a) { return fmt(a); }).join(' ');
      send('log', { level: level === 'debug' ? 'log' : level, text: text });
    };
  });

  function reportError(err) {
    console.error(err && err.name ? err.name + ': ' + err.message : 'Error: ' + fmt(err));
  }
  window.addEventListener('error', function (e) { e.preventDefault(); reportError(e.error || { name: 'Error', message: e.message }); });
  window.addEventListener('unhandledrejection', function (e) { e.preventDefault(); reportError(e.reason); });

  if (typeof rxjs === 'undefined') {
    send('log', { level: 'error', text: 'RxJS could not be loaded in the sandbox (are you offline?)' });
    return;
  }
  rxjs.config.onUnhandledError = reportError;

  var modules = {
    rxjs: rxjs,
    'rxjs/operators': rxjs.operators,
    'rxjs/ajax': rxjs.ajax,
    'rxjs/fetch': rxjs.fetch,
    'rxjs/webSocket': rxjs.webSocket,
  };
  function require(name) {
    if (modules[name]) return modules[name];
    throw new Error("Module '" + name + "' is not available in the playground");
  }

  // Simulated HTTP service used by the examples (no real network involved)
  var USERS = [
    { name: 'Jhon', firstName: 'Trump', age: 40, job: 'Front end developer', salary: 30000 },
    { name: 'Patricia', firstName: 'Biden', age: 36, job: 'Quality Manager', salary: 40000 },
    { name: 'Benito', firstName: 'Aznar', age: 12, job: 'Youtuber', salary: 50000 }
  ];
  var HOBBIES = [
    { name: 'Jhon', hobbies: ['fishing, music, sport'] },
    { name: 'Patricia', hobbies: ['Read, music, go to gym'] },
    { name: 'Benito', hobbies: ['run, football, go to restaurants'] }
  ];
  function http(data, ms) {
    return rxjs.defer(function () { return rxjs.of(JSON.parse(JSON.stringify(data))); }).pipe(rxjs.delay(ms == null ? 400 : ms));
  }
  var userService = {
    getUsers: function (ms) { return http(USERS, ms); },
    getHobbies: function (ms) { return http(HOBBIES, ms); },
    gethobbies: function (ms) { return http(HOBBIES, ms); }
  };

  var started = Date.now();
  var clock = document.getElementById('clock');
  setInterval(function () {
    var s = Math.floor((Date.now() - started) / 1000);
    clock.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }, 1000);

  function reportHeight() { send('height', document.documentElement.scrollHeight); }
  window.addEventListener('resize', reportHeight);

  window.addEventListener('message', function (e) {
    if (e.source !== host || !e.data || e.data.tag !== TAG || e.data.type !== 'run') return;
    try {
      var module = { exports: {} };
      new Function('require', 'exports', 'module', 'userService', e.data.code)(require, module.exports, module, userService);
    } catch (err) {
      reportError(err);
    }
  });

  reportHeight();
  send('ready');
})();
`;

const STYLES = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html { overflow: hidden; }
  html, body { margin: 0; background: transparent; color: #f5f2f0; font: 14px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; }
  .ui { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 14px 16px 6px; }
  .ui:empty { display: none; }
  .btn { min-height: 38px; padding: 8px 18px; border: 0; border-radius: 999px; font: 600 14px system-ui, sans-serif; color: #2f2630; cursor: pointer; transition: transform .12s ease, box-shadow .2s ease; }
  .btn:active { transform: scale(.96); }
  .btn--primary { background: #f299fb; }
  .btn--primary:hover { box-shadow: 0 0 0 1px rgba(242,153,251,.3), 0 8px 26px -8px rgba(242,153,251,.7); }
  .btn--secondary { background: #a3feff; }
  .btn--secondary:hover { box-shadow: 0 0 0 1px rgba(163,254,255,.3), 0 8px 26px -8px rgba(163,254,255,.7); }
  .btn:focus-visible, .input:focus-visible { outline: 2px solid #a3feff; outline-offset: 2px; }
  .input { flex: 1; min-width: 220px; padding: 10px 14px; border: 1px solid rgba(242,153,251,.35); border-radius: 10px; background: rgba(245,242,240,.05); color: #f5f2f0; font: 14px system-ui, sans-serif; }
  .track { position: relative; width: 100%; max-width: 300px; height: 60px; border: 1px dashed rgba(163,254,255,.35); border-radius: 12px; }
  .box { position: absolute; left: 8px; top: 8px; width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #f299fb, #a3feff); box-shadow: 0 0 24px rgba(242,153,251,.6); }
  .status { display: flex; align-items: center; gap: 8px; padding: 8px 16px 10px; font: 12px ui-monospace, Menlo, monospace; color: rgba(245,242,240,.6); }
  .pulse { width: 8px; height: 8px; border-radius: 50%; background: #8dffb5; box-shadow: 0 0 0 0 rgba(141,255,181,.6); animation: pulse 1.6s infinite; }
  .status__helpers { margin-left: auto; opacity: .7; }
  @keyframes pulse { 70% { box-shadow: 0 0 0 8px rgba(141,255,181,0); } 100% { box-shadow: 0 0 0 0 rgba(141,255,181,0); } }
`;

export function buildSrcdoc(rxjsUrl: string, ui: UiControl[], labels: SandboxLabels): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${STYLES}</style>
<script src="${rxjsUrl}"></script></head><body>
<div class="ui">${renderUi(ui, labels)}</div>
<div class="status"><span class="pulse"></span><span>${escapeHtml(labels.running)}</span><span id="clock">00:00</span><span class="status__helpers">${escapeHtml(labels.helpers)}</span></div>
<script>${RUNTIME}</script></body></html>`;
}

/** Runs user code inside a throw-away, cross-origin sandboxed iframe. */
export class Sandbox {
  private frame?: HTMLIFrameElement;
  private pendingCode?: string;

  private readonly listener = (event: MessageEvent) => {
    const frame = this.frame;
    if (!frame || event.source !== frame.contentWindow) return;
    const data = event.data as { tag?: string; type?: string; payload?: unknown };
    if (data?.tag !== MESSAGE_TAG) return;
    if (data.type === 'ready' && this.pendingCode !== undefined) {
      frame.contentWindow?.postMessage({ tag: MESSAGE_TAG, type: 'run', code: this.pendingCode }, '*');
      this.pendingCode = undefined;
    } else if (data.type === 'log') {
      const { level, text } = data.payload as { level: LogLevel; text: string };
      this.handlers.onLog(level, text);
    } else if (data.type === 'height') {
      this.handlers.onHeight(Number(data.payload) || 0);
    }
  };

  constructor(
    private readonly host: HTMLElement,
    private readonly handlers: SandboxHandlers,
  ) {
    window.addEventListener('message', this.listener);
  }

  get running(): boolean {
    return !!this.frame;
  }

  run(code: string, ui: UiControl[], labels: SandboxLabels): void {
    this.stop();
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('title', 'RxJS sandbox');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    frame.className = 'sandbox-frame';
    frame.srcdoc = buildSrcdoc(`${location.origin}/vendor/rxjs.umd.min.js`, ui, labels);
    this.pendingCode = code;
    this.frame = frame;
    this.host.appendChild(frame);
  }

  stop(): void {
    this.frame?.remove();
    this.frame = undefined;
    this.pendingCode = undefined;
  }

  destroy(): void {
    this.stop();
    window.removeEventListener('message', this.listener);
  }
}
