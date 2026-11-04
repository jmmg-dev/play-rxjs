import { ExampleMap } from '../model';

export default {
  lifecycle: {
    code: `import { Observable } from 'rxjs';

const createOrder = (inStock: boolean) =>
  new Observable<string>((subscriber) => {
    subscriber.next('order received');
    if (inStock) {
      subscriber.next('order shipped');
      subscriber.complete();
    } else {
      subscriber.error(new Error('out of stock'));
    }
    subscriber.next('this value is never delivered'); // The observable has already ended
  });

const observer = (name: string) => ({
  next: (step: string) => console.log(name + ' next -> ' + step),
  error: (err: Error) => console.log(name + ' error -> ' + err.message),
  complete: () => console.log(name + ' complete'),
});

createOrder(true).subscribe(observer('Order A'));
createOrder(false).subscribe(observer('Order B'));`,
  },
  observableVsPromise: {
    code: `import { Observable } from 'rxjs';

const promise = new Promise<number>((resolve) => {
  console.log('Promise: runs as soon as it is created');
  resolve(1);
  resolve(2); // Ignored: a promise settles only once
});

const observable$ = new Observable<number>((subscriber) => {
  console.log('Observable: runs when someone subscribes');
  subscriber.next(1);
  subscriber.next(2); // An observable can emit many values
  const timer = setTimeout(() => subscriber.next(3), 2000);
  // Clean-up function: runs when the subscriber unsubscribes
  return () => {
    clearTimeout(timer);
    console.log('Observable: cancelled before emitting 3');
  };
});

console.log('--- subscribing ---');
promise.then((value: number) => console.log('Promise value -> ' + value));
const subscription = observable$.subscribe((value: number) => console.log('Observable value -> ' + value));

setTimeout(() => subscription.unsubscribe(), 1000);`,
  },
  operatorsAndPipe: {
    code: `import { filter, map, of } from 'rxjs';

// Creation operator: creates an observable from scratch
const prices$ = of(12, 45, 8, 30);

// Pipeable operators: each one receives what the previous one emits
const withTax$ = prices$.pipe(
  filter((price: number) => price >= 10),
  map((price: number) => price * 1.21),
  map((price: number) => price.toFixed(2) + ' €'),
);

// pipe returns a new observable: prices$ has not changed
prices$.subscribe((price: number) => console.log('original -> ' + price));
withTax$.subscribe((price: string) => console.log('with tax -> ' + price));`,
  },
  marbleDiagrams: {
    code: `import { interval, map, take } from 'rxjs';

// The same stream as the diagram: 1, 2, 3 and 4, one per second
const source$ = interval(1000).pipe(
  take(4),
  map((n: number) => n + 1),
);

source$.pipe(map((n: number) => n * 10)).subscribe({
  next: (n: number) => console.log('marble -> ' + n),
  complete: () => console.log('| complete'),
});`,
  },
  coldVsHot: {
    code: `import { interval, share, take } from 'rxjs';

// Cold: every subscriber starts its own execution from the beginning
const cold$ = interval(1000).pipe(take(3));

cold$.subscribe((n: number) => console.log('cold A -> ' + n));
setTimeout(() => cold$.subscribe((n: number) => console.log('cold B -> ' + n)), 1500);

// Hot: share() turns it into a single execution that every subscriber joins
const hot$ = interval(1000).pipe(take(3), share());

hot$.subscribe((n: number) => console.log('hot A -> ' + n));
setTimeout(() => hot$.subscribe((n: number) => console.log('hot B -> ' + n)), 1500);`,
  },
  observableObserverSubscription: {
    code: `import { Observable } from 'rxjs';

// 1. We define an Observable
const observable = new Observable<number>((subscriber) => {
  console.log('Observable starts emitting values');

  // Emit some values
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);

  // Complete the emission of values
  subscriber.complete();
});

// 2. We define an Observer
const observer = {
  next: (value: number) => console.log('Value ->', value), // Handles the emitted values
  error: (err: unknown) => console.log('Error:', err), // Handles the error
  complete: () => console.log('Complete!'), // Handles the completion (No Error)
};

// 3. We create the subscription
const subscription = observable.subscribe(observer);

// 4. Here you can cancel the subscription if you wish.
subscription.unsubscribe();`,
  },
  unsubscribe: {
    code: `import { fromEvent, interval, Subscription } from 'rxjs';

let subscription = new Subscription();

const createSubscription = () => {
  console.log('New subscription');
  subscription = interval(1000).subscribe((n: number) => console.log(n));
};

fromEvent(document.getElementById('btn-click-subscribe')!, 'click').subscribe(() => {
  if (!subscription.closed) subscription.unsubscribe();
  createSubscription();
});

fromEvent(document.getElementById('btn-click-unsubscribe')!, 'click').subscribe(() => {
  subscription.unsubscribe();
  console.log('closed ->', subscription.closed);
});`,
    ui: [
      { kind: 'button', id: 'btn-click-subscribe', label: 'subscribe' },
      { kind: 'button', id: 'btn-click-unsubscribe', label: 'unsubscribe', variant: 'secondary' },
    ],
  },
  unsubscribeSeveral: {
    code: `import { fromEvent, interval, Subscription } from 'rxjs';

const subscription = new Subscription();

subscription.add(
  interval(1000).subscribe((n: number) => console.log('interval 1 -> ' + n)),
);

subscription.add(
  interval(500).subscribe((n: number) => console.log('interval 2 -> ' + n)),
);

fromEvent(document.getElementById('btn-click-unsubscribe-all')!, 'click').subscribe(() => {
  subscription.unsubscribe();
  console.log('All subscriptions closed');
});`,
    ui: [{ kind: 'button', id: 'btn-click-unsubscribe-all', label: 'unsubscribeAll' }],
  },
} satisfies ExampleMap;
