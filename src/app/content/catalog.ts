import { Category, CategoryKey, ExampleMap, GroupKey, MarbleData } from './model';

const items = (ids: string): { id: string }[] => ids.split(/\s+/).filter(Boolean).map((id) => ({ id }));

export const CATEGORIES: Category[] = [
  {
    key: 'basicConcepts',
    path: 'basic-concepts',
    group: 'fundamentals',
    icon: 'atom',
    items: items(
      'observableObserverSubscription lifecycle observableVsPromise operatorsAndPipe marbleDiagrams coldVsHot unsubscribe unsubscribeSeveral',
    ),
  },
  {
    key: 'combination',
    path: 'operators/combination',
    group: 'operators',
    icon: 'merge',
    items: [
      { id: 'combineLatest' },
      { id: 'combineLatestAll', isNew: true },
      { id: 'combineLatestWith', isNew: true },
      { id: 'concat' },
      { id: 'concatAll' },
      { id: 'concatWith', isNew: true },
      { id: 'endWith' },
      { id: 'exhaust', deprecated: 'exhaustAll' },
      { id: 'exhaustAll', isNew: true },
      { id: 'forkJoin' },
      { id: 'merge' },
      { id: 'mergeAll' },
      { id: 'mergeWith', isNew: true },
      { id: 'race' },
      { id: 'raceWith', isNew: true },
      { id: 'startWith' },
      { id: 'switchAll' },
      { id: 'withLatestFrom' },
      { id: 'zip' },
      { id: 'zipAll' },
      { id: 'zipWith', isNew: true },
    ],
  },
  {
    key: 'conditional',
    path: 'operators/conditional',
    group: 'operators',
    icon: 'branch',
    items: [
      ...items('defaultIfEmpty every find findIndex isEmpty sequenceEqual'),
      { id: 'throwIfEmpty' },
    ],
  },
  {
    key: 'creation',
    path: 'operators/creation',
    group: 'operators',
    icon: 'sparkles',
    items: [
      { id: 'ajax' },
      { id: 'animationFrames', isNew: true },
      { id: 'bindCallback' },
      { id: 'bindNodeCallback' },
      { id: 'defer' },
      { id: 'EMPTY' },
      { id: 'from' },
      { id: 'fromEvent' },
      { id: 'fromEventPattern' },
      { id: 'fromFetch' },
      { id: 'generate' },
      { id: 'iif' },
      { id: 'interval' },
      { id: 'NEVER' },
      { id: 'of' },
      { id: 'range' },
      { id: 'scheduled' },
      { id: 'throwError' },
      { id: 'timer' },
      { id: 'webSocket' },
    ],
  },
  {
    key: 'error',
    path: 'operators/error',
    group: 'operators',
    icon: 'shield',
    items: [
      { id: 'catchError' },
      { id: 'onErrorResumeNext' },
      { id: 'onErrorResumeNextWith', isNew: true },
      { id: 'retry' },
      { id: 'retryWhen', deprecated: 'retry' },
    ],
  },
  {
    key: 'filtering',
    path: 'operators/filtering',
    group: 'operators',
    icon: 'filter',
    items: items(`audit auditTime debounce debounceTime distinct distinctUntilChanged
      distinctUntilKeyChanged elementAt filter first ignoreElements last sample sampleTime single
      skip skipLast skipUntil skipWhile take takeLast takeUntil takeWhile throttle throttleTime`),
  },
  {
    key: 'mathematical',
    path: 'operators/mathematical',
    group: 'operators',
    icon: 'sigma',
    items: items('count max min reduce'),
  },
  {
    key: 'multicasting',
    path: 'operators/multicasting',
    group: 'operators',
    icon: 'broadcast',
    items: [
      { id: 'connect', isNew: true },
      { id: 'connectable', isNew: true },
      { id: 'multicast', deprecated: 'connectable' },
      { id: 'publish', deprecated: 'connectable' },
      { id: 'publishBehavior', deprecated: 'connectable' },
      { id: 'publishLast', deprecated: 'connectable' },
      { id: 'publishReplay', deprecated: 'shareReplay' },
      { id: 'refCount', deprecated: 'share' },
      { id: 'share' },
      { id: 'shareReplay' },
    ],
  },
  {
    key: 'transformation',
    path: 'operators/transformation',
    group: 'operators',
    icon: 'shuffle',
    items: [
      ...items('buffer bufferCount bufferTime bufferToggle bufferWhen concatMap'),
      { id: 'concatMapTo', deprecated: 'concatMap' },
      ...items('exhaustMap expand groupBy map'),
      { id: 'mapTo', deprecated: 'map' },
      { id: 'mergeMap' },
      { id: 'mergeMapTo', deprecated: 'mergeMap' },
      ...items('mergeScan pairwise partition'),
      { id: 'pluck', deprecated: 'map' },
      ...items('scan switchMap'),
      { id: 'switchMapTo', deprecated: 'switchMap' },
      { id: 'switchScan', isNew: true },
      ...items('window windowCount windowTime windowToggle windowWhen'),
    ],
  },
  {
    key: 'utility',
    path: 'operators/utility',
    group: 'operators',
    icon: 'wrench',
    items: [
      ...items('delay delayWhen dematerialize finalize'),
      { id: 'firstValueFrom', isNew: true },
      { id: 'lastValueFrom', isNew: true },
      { id: 'materialize' },
      { id: 'observeOn' },
      { id: 'repeat' },
      { id: 'subscribeOn' },
      ...items('tap timeInterval timeout timestamp toArray'),
    ],
  },
  {
    key: 'subjects',
    path: 'subjects',
    group: 'subjects',
    icon: 'subject',
    items: [{ id: 'asyncSubject' }, ...items('behaviorSubject replaySubject subject')],
  },
  {
    key: 'realLife',
    path: 'real-life',
    group: 'practice',
    icon: 'rocket',
    items: items(
      'filterUsersMap filterUsersMergeMapFilter mergeUsersHobbiesforkJoinConcatMap filterAndmergeUsersHobbies searchApi flatteningOperators',
    ),
  },
];

export const GROUPS: GroupKey[] = ['fundamentals', 'operators', 'subjects', 'practice'];

export const OPERATOR_CATEGORIES = CATEGORIES.filter((c) => c.group === 'operators');

export const TOTAL_ITEMS = CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);
export const TOTAL_OPERATORS = OPERATOR_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);

export function getCategory(key: string | undefined | null): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function getItem(categoryKey: string, id: string) {
  return getCategory(categoryKey)?.items.find((i) => i.id === id);
}

/** Flat ordered list of every page item, used for previous / next navigation. */
export const FLAT_ITEMS = CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({ category, item })),
);

const loaders: Record<CategoryKey, () => Promise<{ default: ExampleMap }>> = {
  basicConcepts: () => import('./examples/basic'),
  combination: () => import('./examples/combination'),
  conditional: () => import('./examples/conditional'),
  creation: () => import('./examples/creation'),
  error: () => import('./examples/error'),
  filtering: () => import('./examples/filtering'),
  mathematical: () => import('./examples/mathematical'),
  multicasting: () => import('./examples/multicasting'),
  transformation: () => import('./examples/transformation'),
  utility: () => import('./examples/utility'),
  subjects: () => import('./examples/subjects'),
  realLife: () => import('./examples/real-life'),
};

export async function loadMarble(key: CategoryKey, id: string): Promise<MarbleData | undefined> {
  const { default: marbles } = await import('./marbles.json');
  return (marbles as unknown as Record<string, MarbleData>)[key + '/' + id];
}

export async function loadExamples(key: CategoryKey): Promise<ExampleMap> {
  return (await loaders[key]()).default;
}
