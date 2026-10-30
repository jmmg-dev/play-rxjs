import { ExampleMap } from '../model';

export default {
  defaultIfEmpty: {
    code: `import { defaultIfEmpty, of } from 'rxjs';

const obs$ = of();

obs$
  .pipe(defaultIfEmpty('No Data'))
  .subscribe((data) => console.log(data));`,
  },
  every: {
    code: `import { every, of } from 'rxjs';

const obs$ = of(5, 10, 20, 4);

obs$
  .pipe(every((n: number) => n >= 5))
  .subscribe((data: boolean) => console.log(data));`,
  },
  find: {
    code: `import { find, of } from 'rxjs';

const obs$ = of(5, 10, 20, 4);

obs$
  .pipe(find((n: number) => n >= 5))
  .subscribe((data: number | undefined) => console.log(data));`,
  },
  findIndex: {
    code: `import { findIndex, of } from 'rxjs';

const obs$ = of(5, 10, 20, 4);

obs$
  .pipe(findIndex((n: number) => n >= 5))
  .subscribe((data: number) => console.log(data));`,
  },
  isEmpty: {
    code: `import { isEmpty, of } from 'rxjs';

const obs$ = of();

obs$
  .pipe(isEmpty())
  .subscribe((data: boolean) => console.log(data));`,
  },
  sequenceEqual: {
    code: `import { of, sequenceEqual } from 'rxjs';

const obs1$ = of(5, 10, 20, 4);
const obs2$ = of(5, 10, 20, 3);

obs1$
  .pipe(sequenceEqual(obs2$))
  .subscribe((data: boolean) => console.log(data));`,
  },
  throwIfEmpty: {
    code: `import { EMPTY, of, throwIfEmpty } from 'rxjs';

const observer = {
  next: (data: unknown) => console.log('next -> ', data),
  error: (err: Error) => console.log('error -> ' + err.message),
};

of('Some data').pipe(throwIfEmpty(() => new Error('No data received!'))).subscribe(observer);
EMPTY.pipe(throwIfEmpty(() => new Error('No data received!'))).subscribe(observer);`,
  },
} satisfies ExampleMap;
