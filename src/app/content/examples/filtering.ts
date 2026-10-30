import { ExampleMap } from '../model';

const users = `of(
  { name: 'Jhon', age: 2 },
  { name: 'Jhon', age: 3 },
  { name: 'Mari', age: 4 },
  { name: 'Mari', age: 4 },
  { name: 'Beni', age: 5 },
)`;

export default {
  audit: {
    code: `import { audit, fromEvent, interval } from 'rxjs';

const click$ = fromEvent(document.getElementById('btn-click-audit')!, 'click');
const obs$ = click$.pipe(audit(() => interval(2000)));

obs$.subscribe(() => console.log('audit -> Click made!!'));`,
    ui: [{ kind: 'button', id: 'btn-click-audit', label: 'makeClick' }],
  },
  auditTime: {
    code: `import { auditTime, fromEvent } from 'rxjs';

const click$ = fromEvent(document.getElementById('btn-click-audit-time')!, 'click');
const obs$ = click$.pipe(auditTime(2000));

obs$.subscribe(() => console.log('auditTime -> Click made!!'));`,
    ui: [{ kind: 'button', id: 'btn-click-audit-time', label: 'makeClick' }],
  },
  debounce: {
    code: `import { debounce, fromEvent, interval } from 'rxjs';

const keys$ = fromEvent<KeyboardEvent>(document, 'keydown');
const obs$ = keys$.pipe(debounce(() => interval(1000)));

obs$.subscribe((event) => console.log('The last key pressed is ' + event.key));`,
    ui: [{ kind: 'input', id: 'input-keys', placeholder: 'typeHere' }],
  },
  debounceTime: {
    code: `import { debounceTime, fromEvent } from 'rxjs';

const keys$ = fromEvent<KeyboardEvent>(document, 'keydown');
const obs$ = keys$.pipe(debounceTime(1000));

obs$.subscribe((event) => console.log('The last key pressed is ' + event.key));`,
    ui: [{ kind: 'input', id: 'input-keys', placeholder: 'typeHere' }],
  },
  distinct: {
    code: `import { distinct, of } from 'rxjs';

const numbers$ = of(1, 2, 2, 3, 2, 3, 3, 4, 5, 4, 6, 7, 6, 7, 8);
const obs$ = numbers$.pipe(distinct());

obs$.subscribe((number: number) => console.log(number));`,
  },
  distinctUntilChanged: {
    code: `import { distinctUntilChanged, of } from 'rxjs';

const numbers$ = of(1, 2, 2, 3, 2, 3, 3, 4, 5, 4, 6, 7, 6, 7, 8);
const obs$ = numbers$.pipe(distinctUntilChanged());

obs$.subscribe((number: number) => console.log(number));`,
  },
  distinctUntilKeyChanged: {
    code: `import { distinctUntilKeyChanged, of } from 'rxjs';

const users$ = ${users}.pipe(distinctUntilKeyChanged('name'));

users$.subscribe((user) => console.log(user));`,
  },
  elementAt: {
    code: `import { elementAt, of } from 'rxjs';

const users$ = ${users}.pipe(elementAt(3));

users$.subscribe((user) => console.log(user));`,
  },
  filter: {
    code: `import { distinctUntilKeyChanged, filter, of } from 'rxjs';

const users$ = ${users}.pipe(
  distinctUntilKeyChanged('name'),
  filter((user) => user.age > 3),
);

users$.subscribe((user) => console.log(user));`,
  },
  first: {
    code: `import { first, of } from 'rxjs';

const users$ = ${users}.pipe(first((user) => user.age > 3));

users$.subscribe((user) => console.log(user));`,
  },
  ignoreElements: {
    code: `import { ignoreElements, of } from 'rxjs';

const obs$ = of(1, 2, 3).pipe(ignoreElements());

obs$.subscribe({
  next: () => console.log('success'), // It never runs.
  error: () => console.log('error'), // It passes errors
  complete: () => console.log('complete'), // It passes the completion signal
});`,
  },
  last: {
    code: `import { last, of } from 'rxjs';

const users$ = ${users}.pipe(last((user) => user.age > 5, 'No user was found'));

users$.subscribe((user) => console.log(user));`,
  },
  sample: {
    code: `import { interval, sample } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(sample(interval(5000)));

obs$.subscribe((n: number) => console.log(n));`,
  },
  sampleTime: {
    code: `import { interval, sampleTime } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(sampleTime(3000));

obs$.subscribe((n: number) => console.log(n));`,
  },
  single: {
    code: `import { of, single } from 'rxjs';

const numbers$ = of(1, 2, 3, 4, 5);
const obs1$ = numbers$.pipe(single((n: number) => n >= 5));
const obs2$ = numbers$.pipe(single((n: number) => n >= 4)); // It will throw an error when more than one result is found.

obs1$.subscribe((n: number) => console.log(n));
obs2$.subscribe({
  error: (e: Error) => console.log(e.message),
});`,
  },
  skip: {
    code: `import { of, skip } from 'rxjs';

const numbers$ = of(1, 2, 3, 4);
const obs$ = numbers$.pipe(skip(2));

obs$.subscribe((number: number) => console.log(number));`,
  },
  skipLast: {
    code: `import { of, skipLast } from 'rxjs';

const numbers$ = of(1, 2, 3, 4);
const obs$ = numbers$.pipe(skipLast(2));

obs$.subscribe((number: number) => console.log(number));`,
  },
  skipUntil: {
    code: `import { interval, skipUntil } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(skipUntil(interval(3000)));

obs$.subscribe((number: number) => console.log(number));`,
  },
  skipWhile: {
    code: `import { interval, skipWhile } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(skipWhile((n: number) => n < 5));

obs$.subscribe((number: number) => console.log(number));`,
  },
  take: {
    code: `import { interval, take } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(take(5));

obs$.subscribe((number: number) => console.log(number));`,
  },
  takeLast: {
    code: `import { of, takeLast } from 'rxjs';

const numbers$ = of(1, 2, 3, 4);
const obs$ = numbers$.pipe(takeLast(2));

obs$.subscribe((number: number) => console.log(number));`,
  },
  takeUntil: {
    code: `import { interval, takeUntil } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(takeUntil(interval(3000)));

obs$.subscribe({
  next: (number: number) => console.log(number),
  complete: () => console.log('complete'),
});`,
  },
  takeWhile: {
    code: `import { interval, takeWhile } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(takeWhile((n: number) => n < 5));

obs$.subscribe({
  next: (number: number) => console.log(number),
  complete: () => console.log('complete'),
});`,
  },
  throttle: {
    code: `import { interval, throttle } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(throttle(() => interval(5000)));

obs$.subscribe((number: number) => console.log(number));`,
  },
  throttleTime: {
    code: `import { interval, throttleTime } from 'rxjs';

const interval$ = interval(1000);
const obs$ = interval$.pipe(throttleTime(5000));

obs$.subscribe((number: number) => console.log(number));`,
  },
} satisfies ExampleMap;
