// Generates src/app/content/marbles.json by RUNNING the real RxJS operators on virtual time,
// so the diagrams can never disagree with what the library actually does.
// Usage: npm run marbles (add --print to dump every diagram as text)
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rx = require('rxjs');
const { TestScheduler } = require('rxjs/testing');
const {
  of, from, map, timer, EMPTY, NEVER, throwError, interval, range, generate, iif, defer, delay, take, mergeMap,
  toArray, Subject, BehaviorSubject, ReplaySubject, AsyncSubject, merge, concat, forkJoin, race, zip, combineLatest,
  mapTo, takeUntil, filter,
} = rx;

const OUT = new URL('../src/app/content/marbles.json', import.meta.url);
const num = map(Number);
const L = '-a---b---c---|';
const D = '---1---2----3|';
const N = '-1-2-3-4-5|';
const BURST = '-a-b-c-----d-e---|';
const late = (t, obs) => timer(t).pipe(mergeMap(() => obs));
const inners = (w) => w.pipe(mergeMap((win) => win.pipe(toArray())));

/** Higher-order source: letters on the first lane select the inner lanes below. */
const higher = ([outer, ...lanes]) => {
  const dict = Object.fromEntries(lanes.map((s, i) => ['ABC'[i], s]));
  return outer.pipe(map((k) => dict[k]));
};
const higherLabels = ['source$', 'A', 'B', 'C'];

const SPECS = {
  // ---------- Combination ----------
  'combination/combineLatest': { ins: [L, D], labels: ['a$', 'b$'], op: 'combineLatest([a$, b$])', run: ([a, b]) => combineLatest([a, b]) },
  'combination/combineLatestAll': { ins: [L, D], labels: ['a$', 'b$'], op: 'of(a$, b$).pipe(combineLatestAll())', run: ([a, b]) => of(a, b).pipe(rx.combineLatestAll()) },
  'combination/combineLatestWith': { ins: [L, D], labels: ['a$', 'b$'], op: 'a$.pipe(combineLatestWith(b$))', run: ([a, b]) => a.pipe(rx.combineLatestWith(b)) },
  'combination/concat': { ins: ['-a-b|', '--1-2-3|'], labels: ['a$', 'b$'], op: 'concat(a$, b$)', run: ([a, b]) => concat(a, b) },
  'combination/concatAll': { ins: ['-a-b|', '--1-2-3|'], labels: ['a$', 'b$'], op: 'of(a$, b$).pipe(concatAll())', run: ([a, b]) => of(a, b).pipe(rx.concatAll()) },
  'combination/concatWith': { ins: ['-a-b|', '--1-2-3|'], labels: ['a$', 'b$'], op: 'a$.pipe(concatWith(b$))', run: ([a, b]) => a.pipe(rx.concatWith(b)) },
  'combination/endWith': { ins: ['-a--b--|'], op: "endWith('z')", run: ([a]) => a.pipe(rx.endWith('z')) },
  'combination/exhaust': { ins: ['-A----B------C--|', '--1-2-3|', '-------4-5|', '-------------6-7|'], labels: higherLabels, hot: true, op: 'exhaust()', run: (i, h) => higher(i).pipe(rx.exhaust()) },
  'combination/exhaustAll': { ins: ['-A----B------C--|', '--1-2-3|', '-------4-5|', '-------------6-7|'], labels: higherLabels, hot: true, op: 'exhaustAll()', run: (i, h) => higher(i).pipe(rx.exhaustAll()) },
  'combination/forkJoin': { ins: ['-a---b|', '--1-----2|'], labels: ['a$', 'b$'], op: 'forkJoin([a$, b$])', run: ([a, b]) => forkJoin([a, b]) },
  'combination/merge': { ins: ['-a---b---c|', '---1---2---|'], labels: ['a$', 'b$'], op: 'merge(a$, b$)', run: ([a, b]) => merge(a, b) },
  'combination/mergeAll': { ins: ['-A---B---|', '--1---2---|', '------3---4|'], labels: higherLabels.slice(0, 3), hot: true, op: 'mergeAll()', run: (i, h) => higher(i).pipe(rx.mergeAll()) },
  'combination/mergeWith': { ins: ['-a---b---c|', '---1---2---|'], labels: ['a$', 'b$'], op: 'a$.pipe(mergeWith(b$))', run: ([a, b]) => a.pipe(rx.mergeWith(b)) },
  'combination/race': { ins: ['---a--b--c|', '-1---2--3--|'], labels: ['a$', 'b$'], op: 'race(a$, b$)', run: ([a, b]) => race(a, b) },
  'combination/raceWith': { ins: ['---a--b--c|', '-1---2--3--|'], labels: ['a$', 'b$'], op: 'a$.pipe(raceWith(b$))', run: ([a, b]) => a.pipe(rx.raceWith(b)) },
  'combination/startWith': { ins: ['---a--b--|'], op: "startWith('z')", run: ([a]) => a.pipe(rx.startWith('z')) },
  'combination/switchAll': { ins: ['-A-----B-----|', '--1-2-3-4|', '---------5-6|'], labels: higherLabels.slice(0, 3), hot: true, op: 'switchAll()', run: (i, h) => higher(i).pipe(rx.switchAll()) },
  'combination/withLatestFrom': { ins: ['---a---b---c|', '-1---2---3--|'], labels: ['a$', 'b$'], op: 'a$.pipe(withLatestFrom(b$))', run: ([a, b]) => a.pipe(rx.withLatestFrom(b)) },
  'combination/zip': { ins: [L, D], labels: ['a$', 'b$'], op: 'zip(a$, b$)', run: ([a, b]) => zip(a, b) },
  'combination/zipAll': { ins: [L, D], labels: ['a$', 'b$'], op: 'of(a$, b$).pipe(zipAll())', run: ([a, b]) => of(a, b).pipe(rx.zipAll()) },
  'combination/zipWith': { ins: ['-a---b---c|', '---1---2---3---4|'], labels: ['a$', 'b$'], op: 'a$.pipe(zipWith(b$))', run: ([a, b]) => a.pipe(rx.zipWith(b)) },

  // ---------- Conditional ----------
  'conditional/defaultIfEmpty': { ins: ['------|'], op: "defaultIfEmpty('z')", run: ([a]) => a.pipe(rx.defaultIfEmpty('z')) },
  'conditional/every': { ins: ['-5-9-3-8|'], op: 'every((n) => n >= 5)', run: ([a]) => a.pipe(num, rx.every((n) => n >= 5)) },
  'conditional/find': { ins: ['-1-3-7-9|'], op: 'find((n) => n >= 5)', run: ([a]) => a.pipe(num, rx.find((n) => n >= 5)) },
  'conditional/findIndex': { ins: ['-1-3-7-9|'], op: 'findIndex((n) => n >= 5)', run: ([a]) => a.pipe(num, rx.findIndex((n) => n >= 5)) },
  'conditional/isEmpty': { ins: ['-----|'], op: 'isEmpty()', run: ([a]) => a.pipe(rx.isEmpty()) },
  'conditional/sequenceEqual': { ins: ['-1-2-3|', '--1-2-4|'], labels: ['a$', 'b$'], op: 'a$.pipe(sequenceEqual(b$))', run: ([a, b]) => a.pipe(rx.sequenceEqual(b)) },
  'conditional/throwIfEmpty': { ins: ['-----|'], op: 'throwIfEmpty()', run: ([a]) => a.pipe(rx.throwIfEmpty()) },

  // ---------- Creation ----------
  'creation/defer': { ins: [], op: 'defer(() => of(++count))', run: () => { let n = 0; const d = defer(() => of(++n)); return [['A', late(1, d)], ['B', late(6, d)]]; }, until: 10 },
  'creation/EMPTY': { ins: [], op: 'EMPTY', run: () => EMPTY, until: 8 },
  'creation/from': { ins: [], op: 'from([1, 2, 3])', run: () => from([1, 2, 3]), until: 8 },
  'creation/fromEvent': { ins: ['--c---c-c-----'], labels: ['DOM'], op: "fromEvent(button, 'click')", run: ([a]) => a.pipe(mapTo('e')), until: 14 },
  'creation/generate': { ins: [], op: 'generate({ initialState: 1, ... x * 2 })', run: () => generate({ initialState: 1, condition: (x) => x <= 64, iterate: (x) => x * 2 }), until: 10 },
  'creation/iif': { ins: ['-a-b|', '--1-2|'], labels: ['a$', 'b$'], op: 'iif(() => 5 > 10, a$, b$)', run: ([a, b]) => iif(() => 5 > 10, a, b) },
  'creation/interval': { ins: [], op: 'interval(30)', run: () => interval(3), until: 16 },
  'creation/NEVER': { ins: [], op: 'NEVER', run: () => NEVER, until: 12 },
  'creation/of': { ins: [], op: "of('a', 'b', 'c')", run: () => of('a', 'b', 'c'), until: 8 },
  'creation/range': { ins: [], op: 'range(1, 5)', run: () => range(1, 5), until: 8 },
  'creation/throwError': { ins: [], op: "throwError(() => new Error())", run: () => throwError(() => new Error('e')), until: 8 },
  'creation/timer': { ins: [], op: 'timer(50)', run: () => timer(5), until: 10 },

  // ---------- Error handling ----------
  'error/catchError': { ins: ['-a-b-#', '-y-z|'], labels: ['source$', 'fallback$'], op: 'catchError(() => fallback$)', run: ([a, b]) => a.pipe(rx.catchError(() => b)) },
  'error/onErrorResumeNext': { ins: ['-a-b-#', '-1-2|'], labels: ['a$', 'b$'], op: 'onErrorResumeNext(a$, b$)', run: ([a, b]) => rx.onErrorResumeNext(a, b) },
  'error/retry': { ins: ['-a-b-#'], op: 'retry(1)', run: ([a]) => a.pipe(rx.retry(1)) },
  'error/retryWhen': { ins: ['-a-b-#'], op: 'retryWhen((e) => e.pipe(delay(20), take(2)))', run: ([a]) => a.pipe(rx.retryWhen((e) => e.pipe(delay(2), take(2)))) },

  // ---------- Filtering ----------
  'filtering/audit': { ins: [BURST], op: 'audit(() => timer(30))', run: ([a]) => a.pipe(rx.audit(() => timer(3))) },
  'filtering/auditTime': { ins: [BURST], op: 'auditTime(30)', run: ([a]) => a.pipe(rx.auditTime(3)) },
  'filtering/debounce': { ins: [BURST], op: 'debounce(() => timer(30))', run: ([a]) => a.pipe(rx.debounce(() => timer(3))) },
  'filtering/debounceTime': { ins: [BURST], op: 'debounceTime(30)', run: ([a]) => a.pipe(rx.debounceTime(3)) },
  'filtering/distinct': { ins: ['-a-b-a-c-b-d|'], op: 'distinct()', run: ([a]) => a.pipe(rx.distinct()) },
  'filtering/distinctUntilChanged': { ins: ['-a-a-b-b-a-c|'], op: 'distinctUntilChanged()', run: ([a]) => a.pipe(rx.distinctUntilChanged()) },
  'filtering/distinctUntilKeyChanged': { ins: ['-a-a-b-b-a-c|'], op: "distinctUntilKeyChanged('name')", run: ([a]) => a.pipe(map((name) => ({ name })), rx.distinctUntilKeyChanged('name'), map((u) => u.name)) },
  'filtering/elementAt': { ins: ['-a-b-c-d|'], op: 'elementAt(2)', run: ([a]) => a.pipe(rx.elementAt(2)) },
  'filtering/filter': { ins: [N], op: 'filter((n) => n % 2 === 0)', run: ([a]) => a.pipe(num, filter((n) => n % 2 === 0)) },
  'filtering/first': { ins: [N], op: 'first((n) => n > 2)', run: ([a]) => a.pipe(num, rx.first((n) => n > 2)) },
  'filtering/ignoreElements': { ins: ['-a-b-c|'], op: 'ignoreElements()', run: ([a]) => a.pipe(rx.ignoreElements()) },
  'filtering/last': { ins: [N], op: 'last((n) => n < 4)', run: ([a]) => a.pipe(num, rx.last((n) => n < 4)) },
  'filtering/sample': { ins: ['-a-b-c-d-e-|', '---x---x--x-|'], labels: ['source$', 'notifier$'], op: 'sample(notifier$)', run: ([a, b]) => a.pipe(rx.sample(b)) },
  'filtering/sampleTime': { ins: ['-a-b-c-d-e-f-|'], op: 'sampleTime(40)', run: ([a]) => a.pipe(rx.sampleTime(4)) },
  'filtering/single': { ins: ['-1-2-3-4|'], op: 'single((n) => n === 3)', run: ([a]) => a.pipe(num, rx.single((n) => n === 3)) },
  'filtering/skip': { ins: ['-a-b-c-d|'], op: 'skip(2)', run: ([a]) => a.pipe(rx.skip(2)) },
  'filtering/skipLast': { ins: ['-a-b-c-d|'], op: 'skipLast(2)', run: ([a]) => a.pipe(rx.skipLast(2)) },
  'filtering/skipUntil': { ins: ['-a-b-c-d-e|', '-----x|'], labels: ['source$', 'notifier$'], op: 'skipUntil(notifier$)', run: ([a, b]) => a.pipe(rx.skipUntil(b)) },
  'filtering/skipWhile': { ins: [N], op: 'skipWhile((n) => n < 3)', run: ([a]) => a.pipe(num, rx.skipWhile((n) => n < 3)) },
  'filtering/take': { ins: ['-a-b-c-d|'], op: 'take(2)', run: ([a]) => a.pipe(take(2)) },
  'filtering/takeLast': { ins: ['-a-b-c-d|'], op: 'takeLast(2)', run: ([a]) => a.pipe(rx.takeLast(2)) },
  'filtering/takeUntil': { ins: ['-a-b-c-d-e|', '-----x|'], labels: ['source$', 'notifier$'], op: 'takeUntil(notifier$)', run: ([a, b]) => a.pipe(takeUntil(b)) },
  'filtering/takeWhile': { ins: [N], op: 'takeWhile((n) => n < 3)', run: ([a]) => a.pipe(num, rx.takeWhile((n) => n < 3)) },
  'filtering/throttle': { ins: [BURST], op: 'throttle(() => timer(30))', run: ([a]) => a.pipe(rx.throttle(() => timer(3))) },
  'filtering/throttleTime': { ins: [BURST], op: 'throttleTime(30)', run: ([a]) => a.pipe(rx.throttleTime(3)) },

  // ---------- Mathematical ----------
  'mathematical/count': { ins: [N], op: 'count((n) => n > 3)', run: ([a]) => a.pipe(num, rx.count((n) => n > 3)) },
  'mathematical/max': { ins: ['-2-7-4-5|'], op: 'max()', run: ([a]) => a.pipe(num, rx.max()) },
  'mathematical/min': { ins: ['-4-7-2-5|'], op: 'min()', run: ([a]) => a.pipe(num, rx.min()) },
  'mathematical/reduce': { ins: ['-1-2-3-4|'], op: 'reduce((acc, n) => acc + n, 0)', run: ([a]) => a.pipe(num, rx.reduce((acc, n) => acc + n, 0)) },

  // ---------- Multicasting ----------
  'multicasting/share': { ins: ['-a-b-c-d-e|'], op: 'share()', run: ([a]) => { const s = a.pipe(rx.share()); return [['A', s], ['B', late(4, s)]]; } },
  'multicasting/shareReplay': { ins: ['-a-b-c-d-e|'], op: 'shareReplay(2)', run: ([a]) => { const s = a.pipe(rx.shareReplay(2)); return [['A', s], ['B', late(6, s)]]; } },

  // ---------- Transformation ----------
  'transformation/buffer': { ins: ['-a-b-c-d-e-|', '---x---x---|'], labels: ['source$', 'notifier$'], op: 'buffer(notifier$)', run: ([a, b]) => a.pipe(rx.buffer(b)) },
  'transformation/bufferCount': { ins: ['-a-b-c-d-e|'], op: 'bufferCount(2)', run: ([a]) => a.pipe(rx.bufferCount(2)) },
  'transformation/bufferTime': { ins: ['-a-b-c-d-e-f|'], op: 'bufferTime(50)', run: ([a]) => a.pipe(rx.bufferTime(5)) },
  'transformation/bufferToggle': { ins: ['-a-b-c-d-e-f-g|', '---o-----o----|'], labels: ['source$', 'openings$'], op: 'bufferToggle(openings$, () => timer(30))', run: ([a, b]) => a.pipe(rx.bufferToggle(b, () => timer(3))) },
  'transformation/bufferWhen': { ins: ['-a-b-c-d-e-f|'], op: 'bufferWhen(() => timer(40))', run: ([a]) => a.pipe(rx.bufferWhen(() => timer(4))) },
  'transformation/concatMap': { ins: ['-a-b-----|', '-1-2|'], labels: ['source$', 'inner$'], op: 'concatMap((v) => inner$)', run: ([a], h) => a.pipe(rx.concatMap((v) => h.cold('-1-2|').pipe(map((x) => v + x)))) },
  'transformation/concatMapTo': { ins: ['-a-b-----|', '-1-2|'], labels: ['source$', 'inner$'], op: 'concatMapTo(inner$)', run: ([a, b]) => a.pipe(rx.concatMapTo(b)) },
  'transformation/exhaustMap': { ins: ['-a-b-----c-----|', '-1-2-3|'], labels: ['source$', 'inner$'], op: 'exhaustMap((v) => inner$)', run: ([a], h) => a.pipe(rx.exhaustMap((v) => h.cold('-1-2-3|').pipe(map((x) => v + x)))) },
  'transformation/expand': { ins: ['-1------|'], op: 'expand((x) => x < 8 ? of(x * 2).pipe(delay(20)) : EMPTY)', run: ([a]) => a.pipe(num, rx.expand((x) => (x < 8 ? of(x * 2).pipe(delay(2)) : EMPTY))) },
  'transformation/groupBy': { ins: [N], op: 'groupBy((n) => n % 2)', run: ([a]) => a.pipe(num, rx.groupBy((n) => n % 2), mergeMap((g) => g.pipe(toArray()))) },
  'transformation/map': { ins: ['-1-2-3|'], op: 'map((n) => n * 10)', run: ([a]) => a.pipe(num, map((n) => n * 10)) },
  'transformation/mapTo': { ins: ['-a-b-c|'], op: "mapTo('z')", run: ([a]) => a.pipe(rx.mapTo('z')) },
  'transformation/mergeMap': { ins: ['-a---b---|', '-1---2|'], labels: ['source$', 'inner$'], op: 'mergeMap((v) => inner$)', run: ([a], h) => a.pipe(mergeMap((v) => h.cold('-1---2|').pipe(map((x) => v + x)))) },
  'transformation/mergeMapTo': { ins: ['-a---b---|', '-1---2|'], labels: ['source$', 'inner$'], op: 'mergeMapTo(inner$)', run: ([a, b]) => a.pipe(rx.mergeMapTo(b)) },
  'transformation/mergeScan': { ins: ['-1-2-3|'], op: 'mergeScan((acc, n) => of(acc + n), 0)', run: ([a]) => a.pipe(num, rx.mergeScan((acc, n) => of(acc + n), 0)) },
  'transformation/pairwise': { ins: ['-a-b-c-d|'], op: 'pairwise()', run: ([a]) => a.pipe(rx.pairwise()) },
  'transformation/partition': { ins: [N], op: 'partition(source$, (n) => n % 2 === 0)', run: ([a]) => { const [yes, no] = rx.partition(a.pipe(num), (n) => n % 2 === 0); return [['true', yes], ['false', no]]; } },
  'transformation/pluck': { ins: ['-a-b-c|'], op: "pluck('name')", run: ([a]) => a.pipe(map((name) => ({ name })), rx.pluck('name')) },
  'transformation/scan': { ins: ['-1-2-3-4|'], op: 'scan((acc, n) => acc + n)', run: ([a]) => a.pipe(num, rx.scan((acc, n) => acc + n)) },
  'transformation/switchMap': { ins: ['-a---b-------|', '-1-2-3|'], labels: ['source$', 'inner$'], op: 'switchMap((v) => inner$)', run: ([a], h) => a.pipe(rx.switchMap((v) => h.cold('-1-2-3|').pipe(map((x) => v + x)))) },
  'transformation/switchMapTo': { ins: ['-a---b-------|', '-1-2-3|'], labels: ['source$', 'inner$'], op: 'switchMapTo(inner$)', run: ([a, b]) => a.pipe(rx.switchMapTo(b)) },
  'transformation/switchScan': { ins: ['-1-2---3|'], op: 'switchScan((acc, n) => of(acc + n).pipe(delay(30)), 0)', run: ([a]) => a.pipe(num, rx.switchScan((acc, n) => of(acc + n).pipe(delay(3)), 0)) },
  'transformation/window': { ins: ['-a-b-c-d-e-|', '---x---x---|'], labels: ['source$', 'notifier$'], op: 'window(notifier$)', run: ([a, b]) => inners(a.pipe(rx.window(b))) },
  'transformation/windowCount': { ins: ['-a-b-c-d-e|'], op: 'windowCount(2)', run: ([a]) => inners(a.pipe(rx.windowCount(2))) },
  'transformation/windowTime': { ins: ['-a-b-c-d-e-f|'], op: 'windowTime(50)', run: ([a]) => inners(a.pipe(rx.windowTime(5))) },
  'transformation/windowToggle': { ins: ['-a-b-c-d-e-f-g|', '---o-----o----|'], labels: ['source$', 'openings$'], op: 'windowToggle(openings$, () => timer(30))', run: ([a, b]) => inners(a.pipe(rx.windowToggle(b, () => timer(3)))) },
  'transformation/windowWhen': { ins: ['-a-b-c-d-e-f|'], op: 'windowWhen(() => timer(40))', run: ([a]) => inners(a.pipe(rx.windowWhen(() => timer(4)))) },

  // ---------- Utility ----------
  'utility/delay': { ins: ['-a-b-c|'], op: 'delay(30)', run: ([a]) => a.pipe(delay(3)) },
  'utility/delayWhen': { ins: ['-a-b-c|'], op: "delayWhen((v) => timer(v === 'a' ? 60 : 0))", run: ([a]) => a.pipe(rx.delayWhen((v) => timer(v === 'a' ? 6 : 0))) },
  'utility/dematerialize': { ins: ['-a-b|'], op: 'materialize(), dematerialize()', run: ([a]) => a.pipe(rx.materialize(), rx.dematerialize()) },
  'utility/materialize': { ins: ['-a-b|'], op: 'materialize()', run: ([a]) => a.pipe(rx.materialize(), map((n) => (n.kind === 'N' ? `N(${n.value})` : n.kind))) },
  'utility/repeat': { ins: ['-a-b|'], op: 'repeat(2)', run: ([a]) => a.pipe(rx.repeat(2)) },
  'utility/timeInterval': { ins: ['-a---b-c|'], op: 'timeInterval()', run: ([a]) => a.pipe(rx.timeInterval(), map((i) => `${i.value}:${i.interval * 10}`)) },
  'utility/timeout': { ins: ['-a-b--------c|'], op: 'timeout(30)', run: ([a]) => a.pipe(rx.timeout(3)) },
  'utility/timestamp': { ins: ['-a---b-c|'], op: 'timestamp()', run: ([a]) => a.pipe(rx.timestamp(), map((t) => `${t.value}@${t.timestamp * 10}`)) },
  'utility/toArray': { ins: ['-a-b-c-d|'], op: 'toArray()', run: ([a]) => a.pipe(toArray()) },

  // ---------- Subjects ----------
  'subjects/subject': { ins: ['-a--b--c--d|'], labels: ['next()'], op: 'new Subject()', run: ([a]) => { const s = new Subject(); a.subscribe(s); return [['A', s], ['B', late(5, s)]]; } },
  'subjects/behaviorSubject': { ins: ['-a--b--c--d|'], labels: ['next()'], op: "new BehaviorSubject('z')", run: ([a]) => { const s = new BehaviorSubject('z'); a.subscribe(s); return [['A', s], ['B', late(5, s)]]; } },
  'subjects/replaySubject': { ins: ['-a--b--c--d|'], labels: ['next()'], op: 'new ReplaySubject(2)', run: ([a]) => { const s = new ReplaySubject(2); a.subscribe(s); return [['A', s], ['B', late(8, s)]]; } },
  'subjects/asyncSubject': { ins: ['-a--b--c|'], labels: ['next()'], op: 'new AsyncSubject()', run: ([a]) => { const s = new AsyncSubject(); a.subscribe(s); return [['A', s], ['B', late(10, s)]]; }, until: 13 },
};

const label = (v) => {
  if (Array.isArray(v)) return `[${v.map(label).join(',')}]`;
  if (v instanceof Error) return 'error';
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return String(v);
};

function record(obs, now, until, sink) {
  const lane = { events: [] };
  const stop = timer(until);
  obs.pipe(takeUntil(stop)).subscribe({
    next: (v) => lane.events.push({ t: now(), v: label(v) }),
    error: () => (lane.error = now()),
    complete: () => {
      if (now() < until) lane.complete = now();
    },
  });
  sink.push(lane);
  return lane;
}

function build(key, spec) {
  const scheduler = new TestScheduler(() => {});
  const diagram = { op: spec.op, inputs: [], outputs: [] };
  const insLen = Math.max(0, ...spec.ins.map((s) => s.length));
  const until = spec.until ?? insLen * 3 + 12;
  scheduler.run((helpers) => {
        const now = () => scheduler.now();
    const makeIn = (s, i) => (spec.hot && i > 0 ? helpers.hot(s) : helpers.cold(s));
    spec.ins.forEach((s, i) => {
      const lane = record(makeIn(s, i), now, until, diagram.inputs);
      if (spec.labels?.[i]) lane.label = spec.labels[i];
    });
    const result = spec.run(spec.ins.map(makeIn), { cold: helpers.cold });
    const outs = Array.isArray(result) ? result : [[undefined, result]];
    outs.forEach(([name, obs]) => {
      const lane = record(obs, now, until, diagram.outputs);
      if (name) lane.label = name;
    });
  });
  const lanes = [...diagram.inputs, ...diagram.outputs];
  const last = Math.max(0, ...lanes.flatMap((l) => [...l.events.map((e) => e.t), l.complete ?? 0, l.error ?? 0]));
  diagram.duration = spec.until ?? last + 2;
  return diagram;
}

const out = {};
for (const [key, spec] of Object.entries(SPECS)) out[key] = build(key, spec);
writeFileSync(OUT, JSON.stringify(out) + '\n');

if (process.argv.includes('--print')) {
  const row = (l) => {
    const ev = l.events.map((e) => `${e.t}:${e.v}`).join('  ');
    const end = l.complete !== undefined ? `  |${l.complete}` : l.error !== undefined ? `  X${l.error}` : '';
    return `${(l.label ?? '').padEnd(9)} ${ev}${end}`;
  };
  for (const [key, d] of Object.entries(out)) {
    console.log(`\n${key}  ==> ${d.op}`);
    d.inputs.forEach((l) => console.log('  in  ' + row(l)));
    d.outputs.forEach((l) => console.log('  OUT ' + row(l)));
  }
}
console.log(`\n${Object.keys(out).length} diagrams written`);
