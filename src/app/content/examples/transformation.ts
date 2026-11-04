import { ExampleMap } from '../model';

const animals = `from([
  { name: 'Rufy', species: 'cat' },
  { name: 'Benito', species: 'dog' },
  { name: 'Mini', species: 'cat' },
  { name: 'Pedro', species: 'dog' },`;

export default {
  buffer: {
    code: `import { buffer, fromEvent, interval } from 'rxjs';

const click$ = fromEvent(document.getElementById('btn-click-buffer')!, 'click');
const trigger$ = interval(3000);

click$
  .pipe(buffer(trigger$))
  .subscribe((clicks: Event[]) => console.log(clicks.length + ' clicks in 3s'));`,
    ui: [{ kind: 'button', id: 'btn-click-buffer', label: 'countClicks' }],
  },
  bufferCount: {
    code: `import { bufferCount, fromEvent } from 'rxjs';

const click$ = fromEvent(document.getElementById('btn-click-buffer-count')!, 'click');

click$
  .pipe(bufferCount(5))
  .subscribe((clicks: Event[]) => console.log(clicks.length + ' clicks'));`,
    ui: [{ kind: 'button', id: 'btn-click-buffer-count', label: 'make5Clicks' }],
  },
  bufferTime: {
    code: `import { bufferTime, interval } from 'rxjs';

const interval$ = interval(1000);

interval$
  .pipe(bufferTime(3000))
  .subscribe((n: number[]) => console.log(n));`,
  },
  bufferToggle: {
    code: `import { bufferToggle, fromEvent, interval, take, tap } from 'rxjs';

const start$ = fromEvent(document.getElementById('btn-click-buffer-toggle-start')!, 'click').pipe(
  tap(() => console.log('Buffer opened')),
);
// Called once per opened buffer: the next click on the stop button closes it
const stop$ = () =>
  fromEvent(document.getElementById('btn-click-buffer-toggle-stop')!, 'click').pipe(
    take(1),
    tap(() => console.log('Buffer closed')),
  );
const interval$ = interval(1000); // Starts counting when you press Run

interval$
  .pipe(bufferToggle(start$, stop$))
  .subscribe((n: number[]) => console.log('values ->', n));`,
    ui: [
      { kind: 'button', id: 'btn-click-buffer-toggle-start', label: 'start' },
      { kind: 'button', id: 'btn-click-buffer-toggle-stop', label: 'stop', variant: 'secondary' },
    ],
  },
  bufferWhen: {
    code: `import { bufferWhen, fromEvent, interval, tap } from 'rxjs';

const interval$ = interval(1000); // Starts counting when you press Run
const click$ = fromEvent(document.getElementById('btn-click-buffer-when')!, 'click').pipe(
  tap(() => console.log('Click: the buffer is emitted and a new one starts')),
);

interval$
  .pipe(bufferWhen(() => click$))
  .subscribe((n: number[]) => console.log('values ->', n));`,
    ui: [{ kind: 'button', id: 'btn-click-buffer-when', label: 'makeClick' }],
  },
  concatMap: {
    code: `import { concatMap, fromEvent, interval, map, take } from 'rxjs';

let clicks = 0;

fromEvent(document.getElementById('btn-start-cc-map')!, 'click')
  .pipe(
    map(() => ++clicks),
    concatMap((click: number) =>
      interval(1000).pipe(
        take(3),
        map((n: number) => 'click ' + click + ' -> ' + n),
      ),
    ),
  )
  .subscribe((data: string) => console.log(data));`,
    ui: [{ kind: 'button', id: 'btn-start-cc-map', label: 'makeSeveralClicks' }],
  },
  concatMapTo: {
    code: `import { concatMapTo, fromEvent, interval, take, tap } from 'rxjs';

fromEvent(document.getElementById('btn-start-cc-map-to')!, 'click')
  .pipe(
    tap(() => console.log('click')),
    concatMapTo(interval(1000).pipe(take(3))), // Same inner observable for every click
  )
  .subscribe((n: number) => console.log('count -> ' + n));`,
    ui: [{ kind: 'button', id: 'btn-start-cc-map-to', label: 'makeSeveralClicks' }],
  },
  exhaustMap: {
    code: `import { exhaustMap, fromEvent, map, tap } from 'rxjs';

let clicks = 0;

// userService simulates an HTTP service with 2s of latency
fromEvent(document.getElementById('btn-start-exhaust-map')!, 'click')
  .pipe(
    map(() => ++clicks),
    tap((click: number) => console.log('click ' + click)),
    exhaustMap((click: number) =>
      // Clicks are ignored while this request is loading
      userService.getUsers(2000).pipe(map((users: IUser[]) => 'click ' + click + ' -> ' + users.length + ' users loaded')),
    ),
  )
  .subscribe((result: string) => console.log(result));`,
    ui: [{ kind: 'button', id: 'btn-start-exhaust-map', label: 'makeSeveralClicks' }],
  },
  expand: {
    code: `import { expand, of, take } from 'rxjs';

of(1)
  .pipe(
    expand((x: number) => of(x + 10)),
    take(5),
  )
  .subscribe((x: number) => console.log(x));`,
  },
  groupBy: {
    code: `import { from, groupBy, mergeMap, toArray } from 'rxjs';

const animals$ = ${animals}
]);

const species$ = animals$.pipe(
  groupBy(({ species }) => species),
  mergeMap((species$) => species$.pipe(toArray())),
);

species$.subscribe((species) => console.log(species));`,
  },
  map: {
    code: `import { map } from 'rxjs';

// userService.getUsers() simulates an HTTP GET request
userService
  .getUsers()
  .pipe(
    map((users: IUser[]) =>
      users.map((u: IUser) => ({ ...u, name: u.name + ' ****--****' })),
    ),
  )
  .subscribe((data: IUser[]) => console.log(data));`,
  },
  mapTo: {
    code: `import { from, mapTo } from 'rxjs';

from(['orange', 'lemon', 'melon'])
  .pipe(mapTo('strawberry'))
  .subscribe((data: string) => console.log(data));`,
  },
  mergeMap: {
    code: `import { delay, from, mergeMap, of } from 'rxjs';

// Simulates a request that takes a different time for each id
const request = (id: number, ms: number) => of('response ' + id + ' (' + ms + 'ms)').pipe(delay(ms));

from([
  { id: 1, ms: 1500 },
  { id: 2, ms: 500 },
  { id: 3, ms: 1000 },
])
  .pipe(
    mergeMap(({ id, ms }) => request(id, ms)), // All requests run at the same time
  )
  .subscribe((data: string) => console.log(data));`,
  },
  mergeMapTo: {
    code: `import { delay, interval, mergeMapTo, of, take, tap } from 'rxjs';

interval(400)
  .pipe(
    take(3),
    tap((n: number) => console.log('ping ' + n)),
    mergeMapTo(of('pong').pipe(delay(1000))), // Same inner observable, the value is ignored
  )
  .subscribe((data: string) => console.log(data));`,
  },
  mergeScan: {
    code: `import { mergeScan, of } from 'rxjs';

of(1, 10, 20)
  .pipe(
    mergeScan((acc: number, value: number) => {
      return of(acc + value);
    }, 0), // The accumulator starts at 0.
  )
  .subscribe((result: number) => console.log(result));`,
  },
  pairwise: {
    code: `import { of, pairwise } from 'rxjs';

of(1, 10, 20)
  .pipe(pairwise())
  .subscribe((result: [number, number]) => console.log(result));`,
  },
  partition: {
    code: `import { from, partition } from 'rxjs';

const animals$ = ${animals}
  { name: 'Marc', species: 'monkey' },
]);

const [cats$, others$] = partition(animals$, ({ species }) => species === 'cat');

cats$.subscribe((cat) => console.log('cat ->', cat));
others$.subscribe((other) => console.log('other ->', other));`,
  },
  pluck: {
    code: `import { from, pluck } from 'rxjs';

const animals$ = ${animals}
]);

animals$
  .pipe(pluck('name'))
  .subscribe((name: string) => console.log(name));`,
  },
  scan: {
    code: `import { of, scan } from 'rxjs';

of(1, 10, 20)
  .pipe(scan((acc: number, value: number) => acc + value))
  .subscribe((result: number) => console.log(result));`,
  },
  switchMap: {
    code: `import { fromEvent, interval, map, switchMap } from 'rxjs';

let clicks = 0;

fromEvent(document.getElementById('btn-start-sw-map')!, 'click')
  .pipe(
    map(() => ++clicks),
    switchMap((click: number) =>
      interval(1000).pipe(map((n: number) => 'click ' + click + ' -> ' + n)),
    ),
  )
  .subscribe((data: string) => console.log(data));`,
    ui: [{ kind: 'button', id: 'btn-start-sw-map', label: 'makeSeveralClicks' }],
  },
  switchMapTo: {
    code: `import { fromEvent, interval, switchMapTo, tap } from 'rxjs';

fromEvent(document.getElementById('btn-start-sw-map-to')!, 'click')
  .pipe(
    tap(() => console.log('click')),
    switchMapTo(interval(1000)), // Restarts the interval on every click
  )
  .subscribe((n: number) => console.log('count -> ' + n));`,
    ui: [{ kind: 'button', id: 'btn-start-sw-map-to', label: 'makeSeveralClicks' }],
  },
  switchScan: {
    code: `import { delay, interval, of, switchScan, take } from 'rxjs';

// Like scan, but the accumulator returns an observable.
// If a new value arrives before it emits, the previous one is cancelled.
interval(400)
  .pipe(
    take(5),
    switchScan((acc: number, value: number) => of(acc + value).pipe(delay(value % 2 ? 100 : 600)), 0),
  )
  .subscribe((total: number) => console.log('total -> ' + total));`,
  },
  window: {
    code: `import { interval, mergeMap, toArray, window } from 'rxjs';

const source$ = interval(1000);
const closingNotifier$ = interval(3000);

source$
  .pipe(
    window(closingNotifier$),
    mergeMap((window$) => window$.pipe(toArray())),
  )
  .subscribe((data: number[]) => console.log(data));`,
  },
  windowCount: {
    code: `import { mergeMap, of, toArray, windowCount } from 'rxjs';

const source$ = of(1, 2, 3, 4, 5, 6);

source$
  .pipe(
    windowCount(3, 2), // Windows of 3 elements, starting every 2 values
    mergeMap((window$) => window$.pipe(toArray())),
  )
  .subscribe((data: number[]) => console.log(data));`,
  },
  windowTime: {
    code: `import { interval, mergeMap, toArray, windowTime } from 'rxjs';

const source$ = interval(1000);

source$
  .pipe(
    windowTime(3000),
    mergeMap((window$) => window$.pipe(toArray())),
  )
  .subscribe((data: number[]) => console.log(data));`,
  },
  windowToggle: {
    code: `import { interval, mergeMap, toArray, windowToggle } from 'rxjs';

const source$ = interval(700);
const openings$ = interval(3000);
const closings = () => interval(2000);

source$
  .pipe(
    windowToggle(openings$, closings),
    mergeMap((window$) => window$.pipe(toArray())),
  )
  .subscribe((data: number[]) => console.log(data));`,
  },
  windowWhen: {
    code: `import { interval, mergeMap, toArray, windowWhen } from 'rxjs';

const source$ = interval(1000);

source$
  .pipe(
    windowWhen(() => interval(3000)),
    mergeMap((window$) => window$.pipe(toArray())),
  )
  .subscribe((data: number[]) => console.log(data));`,
  },
} satisfies ExampleMap;
