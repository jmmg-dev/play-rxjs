import { ExampleMap } from '../model';

export default {
  delay: {
    code: `import { delay, of } from 'rxjs';

const obs$ = of('hello world!!!').pipe(delay(2000));

obs$.subscribe((resp: string) => console.log(resp));`,
  },
  delayWhen: {
    code: `import { delayWhen, of, timer } from 'rxjs';

const obs$ = of('error', 'success').pipe(
  delayWhen((resp: string) => timer(resp === 'error' ? 2000 : 0)),
);

obs$.subscribe((resp: string) => console.log(resp));`,
  },
  dematerialize: {
    code: `import { dematerialize, materialize, of } from 'rxjs';

const obs$ = of(1, 2, 3).pipe(materialize(), dematerialize());

obs$.subscribe((n: number) => console.log(n));`,
  },
  finalize: {
    code: `import { finalize, of } from 'rxjs';

const obs$ = of(1, 2, 3).pipe(finalize(() => console.log('finalize')));

obs$.subscribe((n: number) => console.log(n));`,
  },
  firstValueFrom: {
    code: `import { firstValueFrom, interval, map } from 'rxjs';

const run = async () => {
  console.log('Waiting for the first value...');
  const value = await firstValueFrom(interval(1000).pipe(map((n: number) => 'value ' + n)));
  console.log('Promise resolved with -> ' + value);
};

run();`,
  },
  lastValueFrom: {
    code: `import { interval, lastValueFrom, take } from 'rxjs';

const run = async () => {
  console.log('Waiting for the observable to complete...');
  const value = await lastValueFrom(interval(500).pipe(take(4)));
  console.log('Promise resolved with the last value -> ' + value);
};

run();`,
  },
  materialize: {
    code: `import { materialize, of } from 'rxjs';

const obs$ = of(1, 2, 3).pipe(materialize());

obs$.subscribe((resp) => console.log(resp));`,
  },
  observeOn: {
    code: `import { asyncScheduler, observeOn, of } from 'rxjs';

console.log('before subscribe');

of(1, 2, 3)
  .pipe(observeOn(asyncScheduler)) // values are delivered asynchronously
  .subscribe((n: number) => console.log('value ' + n));

console.log('after subscribe (printed before the values!)');`,
  },
  repeat: {
    code: `import { of, repeat } from 'rxjs';

const obs$ = of(1, 2, 3).pipe(repeat(2));

obs$.subscribe((n: number) => console.log(n));`,
  },
  subscribeOn: {
    code: `import { asyncScheduler, merge, of, subscribeOn } from 'rxjs';

const a$ = of('A1', 'A2').pipe(subscribeOn(asyncScheduler)); // subscription is delayed
const b$ = of('B1', 'B2');

merge(a$, b$).subscribe((data: string) => console.log(data));`,
  },
  tap: {
    code: `import { of, tap } from 'rxjs';

const obs$ = of(1, 2, 3).pipe(tap((n: number) => console.log('tap -> ' + n)));

obs$.subscribe((n: number) => console.log(n));`,
  },
  timeInterval: {
    code: `import { interval, timeInterval } from 'rxjs';

const obs$ = interval(1000).pipe(timeInterval());

obs$.subscribe((resp) => console.log(resp));`,
  },
  timeout: {
    code: `import { timeout, timer } from 'rxjs';

const obs$ = timer(3000).pipe(timeout(2000));

obs$.subscribe({
  error: (e: Error) => console.log(e.message),
});`,
  },
  timestamp: {
    code: `import { interval, timestamp } from 'rxjs';

const obs$ = interval(1000).pipe(timestamp());

obs$.subscribe((resp) => console.log(resp));`,
  },
  toArray: {
    code: `import { interval, take, toArray } from 'rxjs';

const obs$ = interval(500).pipe(take(5), toArray());

obs$.subscribe((numbers: number[]) => console.log(numbers));`,
  },
} satisfies ExampleMap;
