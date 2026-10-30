import { ExampleMap } from '../model';

export default {
  connect: {
    code: `import { connect, filter, map, merge, of, tap } from 'rxjs';

const source$ = of(1, 2, 3, 4).pipe(
  tap((n: number) => console.log('source emits ' + n)), // Runs only once per value
);

source$
  .pipe(
    connect((shared$) =>
      merge(
        shared$.pipe(
          filter((n: number) => n % 2 === 0),
          map((n: number) => 'even -> ' + n),
        ),
        shared$.pipe(map((n: number) => 'x10 -> ' + n * 10)),
      ),
    ),
  )
  .subscribe((data: string) => console.log(data));`,
  },
  publish: {
    code: `import { ConnectableObservable, fromEvent, interval, publish, take } from 'rxjs';

const click$ = fromEvent(document.getElementById('btn-click-connect')!, 'click').pipe(take(1));

const source$ = interval(1000).pipe(
  take(5),
  publish(),
) as ConnectableObservable<number>;

click$.subscribe(() => {
  console.log('connect()');
  source$.connect();
});

source$.subscribe((data: number) => console.log(data));`,
    ui: [{ kind: 'button', id: 'btn-click-connect', label: 'connect' }],
  },
  connectable: {
    code: `import { connectable, interval, Subject, take } from 'rxjs';

const source$ = connectable(interval(1000).pipe(take(4)), {
  connector: () => new Subject<number>(),
});

source$.subscribe((n: number) => console.log('Subscriber A -> ' + n));
source$.subscribe((n: number) => console.log('Subscriber B -> ' + n));

console.log('Nothing is emitted yet... connecting in 2s');
setTimeout(() => {
  console.log('connect()');
  source$.connect();
}, 2000);`,
  },
  multicast: {
    code: `import { ConnectableObservable, interval, multicast, Subject, take, tap } from 'rxjs';

const source$ = interval(1000).pipe(
  take(3),
  tap((n: number) => console.log('source emits ' + n)), // runs only once per value
  multicast(() => new Subject<number>()),
) as ConnectableObservable<number>;

source$.subscribe((n: number) => console.log('Subscriber A -> ' + n));
source$.subscribe((n: number) => console.log('Subscriber B -> ' + n));

source$.connect();`,
  },
  publishBehavior: {
    code: `import { ConnectableObservable, interval, publishBehavior, take } from 'rxjs';

const source$ = interval(1000).pipe(
  take(3),
  publishBehavior(-1), // initial value
) as ConnectableObservable<number>;

source$.subscribe((n: number) => console.log('Subscriber A -> ' + n));
source$.connect();

setTimeout(() => {
  source$.subscribe((n: number) => console.log('Late subscriber B -> ' + n));
}, 1500);`,
  },
  publishLast: {
    code: `import { ConnectableObservable, interval, publishLast, take, tap } from 'rxjs';

const source$ = interval(500).pipe(
  take(4),
  tap((n: number) => console.log('source emits ' + n)),
  publishLast(),
) as ConnectableObservable<number>;

source$.subscribe((n: number) => console.log('Subscriber A -> ' + n));
source$.subscribe((n: number) => console.log('Subscriber B -> ' + n));

source$.connect();`,
  },
  publishReplay: {
    code: `import { ConnectableObservable, interval, publishReplay, take } from 'rxjs';

const source$ = interval(1000).pipe(
  take(5),
  publishReplay(2), // replays the last 2 values to late subscribers
) as ConnectableObservable<number>;

source$.subscribe((n: number) => console.log('Subscriber A -> ' + n));
source$.connect();

setTimeout(() => {
  source$.subscribe((n: number) => console.log('Late subscriber B -> ' + n));
}, 3500);`,
  },
  refCount: {
    code: `import { interval, publish, refCount, tap } from 'rxjs';

const source$ = interval(1000).pipe(
  tap((n: number) => console.log('source ' + n)),
  publish(),
  refCount(), // connects with the first subscriber, disconnects with the last one
);

const subA = source$.subscribe((n: number) => console.log('A -> ' + n));

setTimeout(() => {
  const subB = source$.subscribe((n: number) => console.log('B -> ' + n));

  setTimeout(() => {
    subA.unsubscribe();
    subB.unsubscribe();
    console.log('All unsubscribed -> the source stops');
  }, 2500);
}, 1500);`,
  },
  share: {
    code: `import { interval, share, take } from 'rxjs';

const interval$ = interval(1000).pipe(take(10), share());

interval$.subscribe((n: number) => console.log('First subscriber ' + n));

setTimeout(() => {
  interval$.subscribe((n: number) => console.log('Second subscriber ' + n));
}, 5000);`,
  },
  shareReplay: {
    code: `import { interval, shareReplay, take } from 'rxjs';

const interval$ = interval(1000).pipe(take(10), shareReplay(3)); // we store the last 3 emissions

interval$.subscribe((n: number) => console.log('First subscriber ' + n));

setTimeout(() => {
  interval$.subscribe((n: number) => console.log('Second subscriber ' + n));
}, 5000);`,
  },
} satisfies ExampleMap;
