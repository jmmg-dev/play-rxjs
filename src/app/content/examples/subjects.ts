import { ExampleMap } from '../model';

export default {
  asyncSubject: {
    code: `import { AsyncSubject } from 'rxjs';

const result$ = new AsyncSubject<number>();

result$.subscribe((n: number) => console.log('Subscriber A -> ' + n));

result$.next(1);
result$.next(2);
result$.next(3);
console.log('Nothing emitted yet: waiting for complete()');

setTimeout(() => {
  result$.complete(); // Only now the last value (3) is emitted
  result$.subscribe((n: number) => console.log('Late subscriber B -> ' + n));
}, 1500);`,
  },
  behaviorSubject: {
    code: `import { BehaviorSubject, fromEvent } from 'rxjs';

const user$ = new BehaviorSubject<{ name: string; age: number }>({
  name: 'John',
  age: 40,
});

console.log('getValue() ->', user$.getValue());

const click$ = fromEvent(document.getElementById('btn-click-behavior')!, 'click');

click$.subscribe(() => user$.next({ ...user$.getValue(), age: user$.getValue().age + 1 }));

user$.subscribe((user: { name: string; age: number }) => console.log('subscribe ->', user));`,
    ui: [{ kind: 'button', id: 'btn-click-behavior', label: 'increaseAge' }],
  },
  replaySubject: {
    code: `import { interval, ReplaySubject, take } from 'rxjs';

const replay$ = new ReplaySubject<number>(2);
const interval$ = interval(1000).pipe(take(5));

interval$.subscribe((n: number) => replay$.next(n));

setTimeout(() => {
  replay$.subscribe((n: number) => console.log(n));
}, 5000);`,
  },
  subject: {
    code: `import { fromEvent, Subject } from 'rxjs';

let user: { name: string; age: number } | null = null;
const user$ = new Subject<{ name: string; age: number }>();

const click$ = fromEvent(document.getElementById('btn-click-subject')!, 'click');

click$.subscribe(() => {
  user = !user ? { name: 'John', age: 40 } : { ...user, age: user.age + 1 };
  user$.next(user);
});

user$.subscribe((user: { name: string; age: number }) => console.log('subscribe ->', user));`,
    ui: [{ kind: 'button', id: 'btn-click-subject', label: 'createOrIncreaseAge' }],
  },
} satisfies ExampleMap;
