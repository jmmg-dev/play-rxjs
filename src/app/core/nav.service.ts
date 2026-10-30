import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { LANGS, Lang } from '../content/model';
import { I18n } from './i18n/i18n.service';

@Injectable({ providedIn: 'root' })
export class Nav {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);

  readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Current path without language prefix, query or fragment ('' on home). */
  readonly restPath = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    const [, first, ...rest] = path.split('/');
    const tail = (LANGS as readonly string[]).includes(first) ? rest : [first, ...rest];
    const joined = tail.filter(Boolean).join('/');
    return joined ? `/${joined}` : '';
  });

  readonly drawerOpen = signal(false);
  readonly searchOpen = signal(false);

  link(path = '', lang: Lang = this.i18n.lang()): string {
    return `/${lang}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`;
  }
}
