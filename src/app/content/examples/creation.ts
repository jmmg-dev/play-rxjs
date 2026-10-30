import { ExampleMap } from '../model';

export default {
  ajax: {
    code: `import { ajax } from 'rxjs/ajax';

const obs$ = ajax.getJSON('https://jsonplaceholder.typicode.com/posts/1');

obs$.subscribe({
  next: (response) => console.log('response ->', response),
  error: (err) => console.log('error ->', err.message),
  complete: () => console.log('complete ****'),
});`,
  },
  animationFrames: {
    code: `import { animationFrames, endWith, map, takeWhile } from 'rxjs';

const box = document.getElementById('box')!;
const duration = 2000;

console.log('Animation started');
animationFrames()
  .pipe(
    map(({ elapsed }) => elapsed / duration), // progress from 0 to 1
    takeWhile((progress: number) => progress < 1),
    endWith(1),
  )
  .subscribe({
    next: (progress: number) => (box.style.transform = 'translateX(' + progress * 240 + 'px)'),
    complete: () => console.log('Animation completed in ' + duration + 'ms'),
  });`,
    ui: [{ kind: 'box', id: 'box' }],
  },
  bindCallback: {
    code: `import { bindCallback } from 'rxjs';

// A classic callback-based API
function getUser(id: number, callback: (user: { id: number; name: string }) => void) {
  setTimeout(() => callback({ id, name: 'Jhon' }), 1000);
}

const getUser$ = bindCallback(getUser);

console.log('Requesting user...');
getUser$(1).subscribe((user) => console.log(user));`,
  },
  bindNodeCallback: {
    code: `import { bindNodeCallback } from 'rxjs';

// Node.js style API: callback(error, result)
function readFile(path: string, callback: (err: Error | null, data?: string) => void) {
  setTimeout(() => {
    if (path.endsWith('.txt')) callback(null, 'Content of ' + path);
    else callback(new Error('Invalid file: ' + path));
  }, 1000);
}

const readFile$ = bindNodeCallback(readFile);

readFile$('notes.txt').subscribe((data) => console.log('next ->', data));
readFile$('image.png').subscribe({
  error: (err: Error) => console.log('error -> ' + err.message),
});`,
  },
  defer: {
    code: `import { defer, of } from 'rxjs';

const obs$ = defer(() => {
  const currentTime = new Date().toLocaleTimeString();
  return of('Current time: ' + currentTime);
});

obs$.subscribe((data: string) => console.log(data));

setTimeout(() => {
  obs$.subscribe((data: string) => console.log(data));
}, 2000);`,
  },
  EMPTY: {
    code: `import { EMPTY, mergeMap, of } from 'rxjs';

EMPTY.subscribe({
  next: () => console.log('It never runs'),
  complete: () => console.log('EMPTY completes immediately'),
});

// Useful to "skip" values inside flattening operators
of(1, 2, 3, 4, 5, 6)
  .pipe(mergeMap((n: number) => (n % 2 === 0 ? of(n) : EMPTY)))
  .subscribe((n: number) => console.log('even -> ' + n));`,
  },
  from: {
    code: `import { from } from 'rxjs';

const obs1$ = from('hello');
const obs2$ = from([1, 2, 3]);
const obs3$ = from(Promise.resolve('Promise resolved!'));

obs1$.subscribe((data) => console.log(data));
obs2$.subscribe((data) => console.log(data));
obs3$.subscribe((data) => console.log(data));`,
  },
  fromEvent: {
    code: `import { fromEvent } from 'rxjs';

const obs$ = fromEvent<KeyboardEvent>(document, 'keydown');

obs$.subscribe((event) => console.log('The key pressed is ' + event.key));`,
    ui: [{ kind: 'input', id: 'input-keys', placeholder: 'typeHere' }],
  },
  fromEventPattern: {
    code: `import { fromEventPattern, take } from 'rxjs';

const button = document.getElementById('btn-pattern')!;

const clicks$ = fromEventPattern<MouseEvent>(
  (handler) => {
    console.log('Handler added');
    button.addEventListener('click', handler);
  },
  (handler) => {
    console.log('Handler removed');
    button.removeEventListener('click', handler);
  },
);

clicks$.pipe(take(3)).subscribe({
  next: (event: MouseEvent) => console.log('Click at x = ' + event.offsetX),
  complete: () => console.log('complete after 3 clicks'),
});`,
    ui: [{ kind: 'button', id: 'btn-pattern', label: 'make3Clicks' }],
  },
  fromFetch: {
    code: `import { catchError, of, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

fromFetch('https://jsonplaceholder.typicode.com/users/1')
  .pipe(
    switchMap((response) =>
      response.ok ? response.json() : of({ error: true, status: response.status }),
    ),
    catchError((err: Error) => of({ error: true, message: err.message })),
  )
  .subscribe((user) => console.log(user));`,
  },
  generate: {
    code: `import { generate } from 'rxjs';

const obs$ = generate({
  initialState: 1, // Initial state
  condition: (x: number) => x <= 64, // Condition to continue
  iterate: (x: number) => x * 2, // How to update the state (double the value)
});

obs$.subscribe((data: number) => console.log(data));`,
  },
  iif: {
    code: `import { iif, of } from 'rxjs';

const condition = 5 > 10;

const obs$ = iif(
  () => condition, // Condition (if true, it will emit the first observable)
  of('Condition is true'), // First observable
  of('Condition is false'), // Second observable
);

obs$.subscribe((data: string) => console.log(data));`,
  },
  interval: {
    code: `import { interval } from 'rxjs';

const obs$ = interval(2000); // Emits an incremental number every 2 seconds.

obs$.subscribe((data: number) => console.log(data));`,
  },
  NEVER: {
    code: `import { catchError, NEVER, of, startWith, timeout } from 'rxjs';

NEVER.pipe(startWith('I emit once and then... silence')).subscribe({
  next: (data: string) => console.log(data),
  complete: () => console.log('This will never be printed'),
});

// NEVER is handy to test timeouts
NEVER.pipe(
  timeout(2000),
  catchError(() => of('NEVER timed out after 2 seconds')),
).subscribe((data) => console.log(data));`,
  },
  of: {
    code: `import { of } from 'rxjs';

const obs1$ = of('hello');
const obs2$ = of(1, 2, 3);
const obs3$ = of({ name: 'Jhon', age: 40 }, [1, 2]);

obs1$.subscribe((data) => console.log(data));
obs2$.subscribe((data) => console.log(data));
obs3$.subscribe((data) => console.log(data));`,
  },
  range: {
    code: `import { range } from 'rxjs';

const obs$ = range(1, 5);

obs$.subscribe((data: number) => console.log(data));`,
  },
  scheduled: {
    code: `import { asapScheduler, asyncScheduler, scheduled } from 'rxjs';

console.log('start');

scheduled([1, 2, 3], asyncScheduler).subscribe((n: number) => console.log('async -> ' + n));
scheduled(['a', 'b'], asapScheduler).subscribe((l: string) => console.log('asap -> ' + l));

console.log('end (the synchronous code finishes first)');`,
  },
  throwError: {
    code: `import { throwError } from 'rxjs';

const error$ = throwError(() => ({ status: 500, message: 'Server error' }));

error$.subscribe({
  next: () => console.log('It never runs'),
  error: (e: { status: number; message: string }) => console.log(e),
});`,
  },
  timer: {
    code: `import { timer } from 'rxjs';

const obs$ = timer(2000); // Emits after 2 seconds.

obs$.subscribe(() => console.log('Hello world!!!'));`,
  },
  webSocket: {
    code: `import { take } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

const socket$ = webSocket<string>({
  url: 'wss://echo.websocket.org', // Public echo server
  serializer: (msg: string) => msg,
  deserializer: (event: MessageEvent) => event.data,
});

socket$.pipe(take(3)).subscribe({
  next: (msg: string) => console.log('Received -> ' + msg),
  error: () => console.log('Connection error'),
  complete: () => console.log('Socket closed'),
});

socket$.next('Hello RxJS!');
socket$.next('Play RxJS rocks');`,
  },
} satisfies ExampleMap;
