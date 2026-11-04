import { ExampleMap } from '../model';

export default {
  combineLatest: {
    code: `import { combineLatest, interval, map, take } from 'rxjs';

const letters$ = interval(1000).pipe(take(3), map((n: number) => ['a', 'b', 'c'][n]));
const numbers$ = interval(1700).pipe(take(3));

// Waits until both have emitted, then emits every time either of them emits
combineLatest([letters$, numbers$]).subscribe(([letter, n]) => console.log(letter + n));`,
  },
  combineLatestAll: {
    code: `import { combineLatestAll, interval, map, of, take } from 'rxjs';

// A higher-order observable: it emits two inner observables
const source$ = of(1000, 1500).pipe(
  map((ms: number) => interval(ms).pipe(take(3), map((n: number) => ms + 'ms -> ' + n))),
);

// Waits for every inner observable to emit and then combines their latest values
source$.pipe(combineLatestAll()).subscribe((data: string[]) => console.log(data));`,
  },
  combineLatestWith: {
    code: `import { combineLatestWith, interval, map, take } from 'rxjs';

const temperature$ = interval(1000).pipe(take(4), map((n: number) => 20 + n));
const humidity$ = interval(1500).pipe(take(3), map((n: number) => 50 + n * 5));

temperature$
  .pipe(combineLatestWith(humidity$))
  .subscribe(([temp, humidity]: [number, number]) =>
    console.log('Temp: ' + temp + 'ºC | Humidity: ' + humidity + '%'),
  );`,
  },
  concat: {
    code: `import { concat, delay, of } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);

concat(obs1$, obs2$, obs3$).subscribe((data) => console.log(data));`,
  },
  concatAll: {
    code: `import { concatAll, delay, of } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);
const obsAll$ = of(obs1$, obs2$, obs3$);

obsAll$
  .pipe(
    concatAll(), // Concatenates the values of the emitted observables
  )
  .subscribe((data) => console.log(data));`,
  },
  concatWith: {
    code: `import { concatWith, delay, of } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(1000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);

// Pipeable version of concat: obs2$ and obs3$ wait for obs1$ to complete
obs1$.pipe(concatWith(obs2$, obs3$)).subscribe((data) => console.log(data));`,
  },
  endWith: {
    code: `import { concatMap, delay, endWith, of } from 'rxjs';

const steps$ = of('Loading', 'Processing', 'Saving').pipe(
  concatMap((step: string) => of(step).pipe(delay(700))),
);

steps$.pipe(endWith('Done!')).subscribe((data: string) => console.log(data));`,
  },
  exhaust: {
    code: `import { delay, exhaust, of } from 'rxjs';

const obs1$ = of(1, 2);
const obs2$ = of('a', 'b').pipe(delay(3000));
const obs3$ = of(3, 4, 5);
const obsAll$ = of(obs1$, obs2$, obs3$);

obsAll$.pipe(exhaust()).subscribe((data) => console.log(data));`,
  },
  exhaustAll: {
    code: `import { delay, exhaustAll, of } from 'rxjs';

const obs1$ = of(1, 2);
const obs2$ = of('a', 'b').pipe(delay(3000));
const obs3$ = of(3, 4, 5); // Ignored: obs2$ is still running when it arrives
const obsAll$ = of(obs1$, obs2$, obs3$);

obsAll$.pipe(exhaustAll()).subscribe((data) => console.log(data));`,
  },
  forkJoin: {
    code: `import { delay, forkJoin, of } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);

forkJoin([obs1$, obs2$, obs3$]).subscribe((data) => console.log(data));`,
  },
  merge: {
    code: `import { delay, merge, of } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);

merge(obs1$, obs2$, obs3$).subscribe((data) => console.log(data));`,
  },
  mergeAll: {
    code: `import { delay, mergeAll, of } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);
const obsAll$ = of(obs1$, obs2$, obs3$);

obsAll$
  .pipe(
    mergeAll(), // Subscribes to every inner observable at the same time
  )
  .subscribe((data) => console.log(data));`,
  },
  mergeWith: {
    code: `import { delay, mergeWith, of } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);

// Pipeable version of merge
obs1$.pipe(mergeWith(obs2$, obs3$)).subscribe((data) => console.log(data));`,
  },
  race: {
    code: `import { delay, of, race } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));
const obs2$ = of('a', 'b');
const obs3$ = of(3, 4, 5);

race(obs1$, obs2$, obs3$).subscribe((data) => console.log(data));`,
  },
  raceWith: {
    code: `import { delay, of, raceWith } from 'rxjs';

const slow$ = of('slow server').pipe(delay(2000));
const fast$ = of('fast server').pipe(delay(500));
const medium$ = of('medium server').pipe(delay(1000));

// The first observable to emit wins, the rest are unsubscribed
slow$.pipe(raceWith(fast$, medium$)).subscribe((winner: string) => console.log(winner));`,
  },
  startWith: {
    code: `import { delay, of, startWith } from 'rxjs';

const obs1$ = of(1, 2).pipe(delay(2000));

obs1$.pipe(startWith(0)).subscribe((data: number) => console.log(data));`,
  },
  switchAll: {
    code: `import { interval, map, switchAll, take } from 'rxjs';

// Every 2 seconds a new round starts, counting every 0.7 seconds
const rounds$ = interval(2000).pipe(
  take(3),
  map((round: number) => interval(700).pipe(take(4), map((n: number) => 'round ' + round + ' -> ' + n))),
);

rounds$
  .pipe(
    switchAll(), // Unsubscribes from the previous round when a new one arrives
  )
  .subscribe((data: string) => console.log(data));`,
  },
  withLatestFrom: {
    code: `import { interval, map, take, withLatestFrom } from 'rxjs';

const seconds$ = interval(1000).pipe(take(5)); // The source: it sets the pace
const color$ = interval(1300).pipe(map((n: number) => ['red', 'green', 'blue'][n % 3]));

seconds$
  .pipe(
    withLatestFrom(color$),
    map(([second, color]) => 'second ' + second + ' -> ' + color),
  )
  .subscribe((data: string) => console.log(data));`,
  },
  zip: {
    code: `import { of, zip } from 'rxjs';

const names$ = of('John', 'Patricia', 'Benito');
const ages$ = of(40, 36, 28);
const jobs$ = of('Front end developer', 'Quality Manager', 'Content creator');

// Pairs the values by index: 1st with 1st, 2nd with 2nd...
zip(names$, ages$, jobs$).subscribe(([name, age, job]) =>
  console.log(name + ' (' + age + ') -> ' + job),
);`,
  },
  zipAll: {
    code: `import { interval, map, of, take, zipAll } from 'rxjs';

const numbers$ = interval(1000).pipe(take(3));
const letters$ = of('a', 'b', 'c');
const emojis$ = interval(500).pipe(take(3), map((n: number) => ['🔥', '⚡', '🚀'][n]));

of(numbers$, letters$, emojis$)
  .pipe(zipAll())
  .subscribe((data) => console.log(data));`,
  },
  zipWith: {
    code: `import { of, zipWith } from 'rxjs';

const ids$ = of(1, 2, 3);
const fruits$ = of('orange', 'lemon', 'melon', 'strawberry'); // 'strawberry' has no pair

ids$.pipe(zipWith(fruits$)).subscribe(([id, fruit]: [number, string]) =>
  console.log(id + ' -> ' + fruit),
);`,
  },
} satisfies ExampleMap;
