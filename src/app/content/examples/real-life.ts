import { ExampleMap } from '../model';

const dataComment = `// users = [{ name: 'Jhon', firstName: 'Trump', age: 40, job: 'Front end developer', salary: 30000 }, ...]
// hobbies = [{ name: 'Jhon', hobbies: ['fishing, music, sport'] }, ...]
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
    code: `import { concatMap, delay, forkJoin, map, of } from 'rxjs';

${dataComment}
const users$ = userService.getUsers().pipe(delay(2000));
const hobbies$ = userService.getHobbies();

forkJoin([users$, hobbies$])
  .pipe(
    concatMap(([u, h]: [IUser[], IHobby[]]) => {
      return of({ users: u, hobbies: h }).pipe(
        map((data: { users: IUser[]; hobbies: IHobby[] }) =>
          data.users.map((user: IUser) => ({
            ...user,
            hobbies: data.hobbies.find((hobby: IHobby) => hobby.name === user.name)?.hobbies,
          })),
        ),
      );
    }),
  )
  .subscribe((usersWithHobbies) => console.log(usersWithHobbies));`,
  },
  filterAndmergeUsersHobbies: {
    code: `import { delay, forkJoin, map } from 'rxjs';

${dataComment}
const user$ = userService.getUsers().pipe(
  map((users: IUser[]) => users.find((u: IUser) => u.name === 'Jhon')),
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
} satisfies ExampleMap;
