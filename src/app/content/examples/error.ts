import { ExampleMap } from '../model';

export default {
  catchError: {
    code: `import { catchError, of, throwError } from 'rxjs';

const obs$ = throwError(() => new Error('server error')).pipe(
  catchError((err: Error) => {
    console.log('Captured -> ' + err.message);
    return of([]);
  }),
);

obs$.subscribe((resp) => console.log(resp));`,
  },
  onErrorResumeNext: {
    code: `import { map, of, onErrorResumeNext, throwError } from 'rxjs';

const failing$ = of(1, 2, 3).pipe(
  map((n: number) => {
    if (n === 3) throw new Error('boom');
    return n;
  }),
);

// Moves on to the next observable when one fails (or completes)
onErrorResumeNext(failing$, throwError(() => new Error('ignored')), of('a', 'b')).subscribe({
  next: (data) => console.log(data),
  error: () => console.log('It never runs'),
  complete: () => console.log('complete'),
});`,
  },
  onErrorResumeNextWith: {
    code: `import { map, of, onErrorResumeNextWith } from 'rxjs';

const failing$ = of(1, 2, 3).pipe(
  map((n: number) => {
    if (n === 3) throw new Error('boom');
    return n;
  }),
);
const backup$ = of('a', 'b');

// Pipeable version: when failing$ errors or completes, backup$ takes over
failing$.pipe(onErrorResumeNextWith(backup$)).subscribe({
  next: (data) => console.log(data),
  error: () => console.log('It never runs'),
  complete: () => console.log('complete'),
});`,
  },
  retry: {
    code: `import { retry, tap } from 'rxjs';
import { ajax } from 'rxjs/ajax';

const obs$ = ajax('https://fake.url.test.retry').pipe(
  tap({ subscribe: () => console.log('Requesting...') }),
  retry(1),
);

obs$.subscribe({
  error: (err: Error) => console.log(err.message),
});`,
  },
  retryWhen: {
    code: `import { defer, delay, of, retryWhen, take, tap, throwError } from 'rxjs';

let attempt = 0;

const request$ = defer(() => {
  attempt++;
  console.log('Attempt #' + attempt);
  return attempt < 3 ? throwError(() => new Error('Server error')) : of('Success!');
});

request$
  .pipe(
    retryWhen((errors) =>
      errors.pipe(
        tap((err: Error) => console.log(err.message + ' -> retrying in 1s')),
        delay(1000),
        take(5),
      ),
    ),
  )
  .subscribe((data: string) => console.log(data));

// Modern alternative: retry({ count: 5, delay: 1000 })`,
  },
} satisfies ExampleMap;
