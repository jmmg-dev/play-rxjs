// Smoke test: every example compiles, runs without errors for a few seconds and has EN/ES texts.
// Usage: node scripts/check-examples.mjs
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { transform } from 'sucrase';

const require = createRequire(import.meta.url);
globalThis.requestAnimationFrame ??= (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.cancelAnimationFrame ??= clearTimeout;
const rxjs = require('rxjs');
const root = new URL('../src/app/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const locales = {
  en: JSON.parse(readFileSync(join(root, 'core/i18n/locales/en.json'), 'utf8')),
  es: JSON.parse(readFileSync(join(root, 'core/i18n/locales/es.json'), 'utf8')),
};
const loadTs = (file) => {
  const js = transform(readFileSync(file, 'utf8'), { transforms: ['typescript', 'imports'] }).code;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(require, module, module.exports);
  return module.exports;
};

const catalogSrc = readFileSync(join(root, 'content/catalog.ts'), 'utf8').replace(/import\('\.\/examples\/[^']+'\)/g, 'null');
const { CATEGORIES } = (() => {
  const js = transform(catalogSrc, { transforms: ['typescript', 'imports'] }).code;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(() => ({}), module, module.exports);
  return module.exports;
})();

const fileFor = { basicConcepts: 'basic', realLife: 'real-life' };
const fakeEl = () => ({ addEventListener() {}, removeEventListener() {}, style: {}, value: '' });
const document = { getElementById: fakeEl, addEventListener() {}, removeEventListener() {} };
const offline = (name) => () => rxjs.throwError(() => new Error(name + ' disabled in smoke test'));
const modules = {
  rxjs,
  'rxjs/ajax': { ajax: Object.assign(offline('ajax'), { getJSON: offline('ajax') }) },
  'rxjs/fetch': { fromFetch: offline('fetch') },
  'rxjs/webSocket': { webSocket: () => new rxjs.Subject() },
};
const userService = { getUsers: () => rxjs.of([]).pipe(rxjs.delay(10)), getHobbies: () => rxjs.of([]) };

let failures = 0;
const reports = [];
const lateErrors = [];
const timers = [];
for (const category of CATEGORIES) {
  const examples = loadTs(join(root, `content/examples/${fileFor[category.key] ?? category.key}.ts`)).default;
  const ids = category.items.map((i) => i.id);
  const extra = Object.keys(examples).filter((id) => !ids.includes(id));
  if (extra.length) (failures++, console.log(`✗ ${category.key}: examples without catalog entry: ${extra}`));
  for (const id of ids) {
    const problems = [];
    for (const lang of ['en', 'es']) {
      const entry = locales[lang][category.key]?.[id];
      if (!entry?.title || !entry?.description || !entry?.example) problems.push(`missing ${lang} text`);
    }
    const example = examples[id];
    if (!example) problems.push('missing example');
    else {
      try {
        const js = transform(example.code, { transforms: ['typescript', 'imports'], disableESTransforms: true }).code;
        const logs = [];
        const fakeConsole = { log: (...a) => logs.push(a), error: (...a) => problems.push('console.error ' + a.join(' ')) };
        rxjs.config.onUnhandledError = (e) => lateErrors.push(`${category.key}/${id}? ${e?.message}`);
        const setI = (fn, ms) => (timers.push(setInterval(fn, ms)), timers.at(-1));
        new Function('require', 'exports', 'module', 'userService', 'document', 'console', 'setInterval', js)(
          (n) => modules[n] ?? (() => { throw new Error('module ' + n); })(),
          {}, { exports: {} }, userService, document, fakeConsole, setI,
        );
      } catch (err) {
        problems.push(err.message);
      }
    }
    reports.push({ name: `${category.key}/${id}`, problems });
  }
}
setTimeout(() => {
  for (const r of reports.filter((r) => r.problems.length)) {
    failures++;
    console.log(`✗ ${r.name}: ${r.problems.join(' | ')}`);
  }
  if (lateErrors.length) (failures++, console.log('✗ async errors:', lateErrors));
  console.log(failures ? `\n${failures} problem(s)` : '\nAll examples OK');
  process.exit(failures ? 1 : 0);
}, 3000);
