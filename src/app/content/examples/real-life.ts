import { ExampleMap } from '../model';

const dataComment = `// users = [{ name: 'John', lastName: 'Smith', age: 40, job: 'Front end developer', salary: 30000 }, ...]
// hobbies = [{ name: 'John', hobbies: ['fishing', 'music', 'sport'] }, ...]
// userService simulates an HttpClient service`;

export default {
  filterUsersMap: {
    code: `import { map } from 'rxjs';

// userService.getUsers() simulates an HTTP GET request
userService
  .getUsers()
  .pipe(map((users: IUser[]) => users.filter((u: IUser) => u.salary >= 30000 && u.age > 39)))
  .subscribe((users: IUser[]) => console.log(users));`,
  },
  filterUsersMergeMapFilter: {
    code: `import { filter, mergeMap, toArray } from 'rxjs';

// userService.getUsers() simulates an HTTP GET request
userService
  .getUsers()
  .pipe(
    mergeMap((users: IUser[]) => users), // Emit individual users
    filter((u: IUser) => u.salary >= 30000 && u.age > 39),
    toArray(),
  )
  .subscribe((users: IUser[]) => console.log(users));`,
  },
  mergeUsersHobbiesforkJoinConcatMap: {
    code: `import { delay, forkJoin, map } from 'rxjs';

${dataComment}
const users$ = userService.getUsers().pipe(delay(2000));
const hobbies$ = userService.getHobbies();

// forkJoin waits for both requests and emits their results together
forkJoin([users$, hobbies$])
  .pipe(
    map(([users, hobbies]: [IUser[], IHobby[]]) =>
      users.map((user: IUser) => ({
        ...user,
        hobbies: hobbies.find((hobby: IHobby) => hobby.name === user.name)?.hobbies,
      })),
    ),
  )
  .subscribe((usersWithHobbies) => console.log(usersWithHobbies));`,
  },
  filterAndmergeUsersHobbies: {
    code: `import { delay, forkJoin, map } from 'rxjs';

${dataComment}
const user$ = userService.getUsers().pipe(
  map((users: IUser[]) => users.find((u: IUser) => u.name === 'John')),
  delay(2000),
);
const hobbies$ = userService.getHobbies();

forkJoin([user$, hobbies$])
  .pipe(
    map(([u, h]: [IUser | undefined, IHobby[]]) => ({
      ...u,
      hobbies: h.find((hobby: IHobby) => hobby.name === u?.name)?.hobbies,
    })),
  )
  .subscribe((data) => console.log(data));`,
  },
  searchApi: {
    code: `import { catchError, debounceTime, filter, fromEvent, map, of, switchMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';

const inputText = document.getElementById('search-input') as HTMLInputElement;

const search = (namePokemon: string) => {
  const url = 'https://pokeapi.co/api/v2/pokemon/' + namePokemon.toLowerCase().trim();
  return ajax.getJSON<{ name: string; forms: unknown[] }>(url).pipe(
    map((data) => data.forms),
    catchError(() => of('Pokémon not found')),
  );
};

fromEvent(inputText, 'input')
  .pipe(
    debounceTime(1000),
    map(() => inputText.value),
    filter((value: string) => value.length >= 2),
    switchMap((value: string) => search(value)), // cancels previous requests
  )
  .subscribe((result) => console.log(result));`,
    ui: [{ kind: 'input', id: 'search-input', placeholder: 'pokemon' }],
  },
  flatteningOperators: {
    code: `import { concatMap, delay, exhaustMap, fromEvent, map, mergeMap, of, share, switchMap, tap } from 'rxjs';

let clicks = 0;

// share(): the four pipelines below receive the same clicks
const click$ = fromEvent(document.getElementById('btn-save')!, 'click').pipe(
  map(() => ++clicks),
  tap((click: number) => console.log('click ' + click)),
  share(),
);

// Simulates saving a form: every request takes 1.5 seconds
const save = (click: number) => of('saved #' + click).pipe(delay(1500));

click$.pipe(mergeMap(save)).subscribe((result: string) => console.log('mergeMap   -> ' + result));
click$.pipe(concatMap(save)).subscribe((result: string) => console.log('concatMap  -> ' + result));
click$.pipe(switchMap(save)).subscribe((result: string) => console.log('switchMap  -> ' + result));
click$.pipe(exhaustMap(save)).subscribe((result: string) => console.log('exhaustMap -> ' + result));`,
    ui: [{ kind: 'button', id: 'btn-save', label: 'save' }],
  },
} satisfies ExampleMap;
