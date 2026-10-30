import { ExampleMap } from '../model';

export default {
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
