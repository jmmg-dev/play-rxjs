import { ExampleMap } from '../model';

export default {
  count: {
    code: `import { count, of } from 'rxjs';

const obs$ = of(1, 2, 3, 4, 5);

obs$
  .pipe(count((n: number) => n > 3))
  .subscribe((data: number) => console.log(data));`,
  },
  max: {
    code: `import { max, of } from 'rxjs';

const obs$ = of(1, 2, 3, 4, 5);

obs$
  .pipe(max())
  .subscribe((data: number) => console.log(data));`,
  },
  min: {
    code: `import { min, of } from 'rxjs';

const obs$ = of(1, 2, 3, 4, 5);

obs$
  .pipe(min())
  .subscribe((data: number) => console.log(data));`,
  },
  reduce: {
    code: `import { of, reduce } from 'rxjs';

const obs$ = of(1, 2, 3, 4, 5);

obs$
  .pipe(reduce((acc: number, value: number) => acc + value, 0))
  .subscribe((data: number) => console.log(data));`,
  },
} satisfies ExampleMap;
