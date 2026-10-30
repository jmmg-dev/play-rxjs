import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CATEGORIES } from '../content/catalog';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Icon } from '../shared/icon';

interface SearchEntry {
  title: string;
  section: string;
  url: string;
  icon: string;
  haystack: string;
  isCategory: boolean;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

@Component({
  selector: 'app-search-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  host: { '(document:keydown)': 'onGlobalKey($event)' },
  template: `
    <dialog #dialog class="palette" (close)="nav.searchOpen.set(false)" (click)="onBackdrop($event)" aria-labelledby="search-title">
      @if (nav.searchOpen()) {
        <div class="palette__box">
          <h2 id="search-title" class="visually-hidden">{{ 'ui.searchLabel' | t }}</h2>
          <div class="palette__field">
            <app-icon name="search" [size]="18" />
            <input
              #input
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="search-results"
              [attr.aria-expanded]="results().length > 0"
              [attr.aria-activedescendant]="results().length ? 'search-opt-' + active() : null"
              [placeholder]="'ui.search' | t"
              [attr.aria-label]="'ui.searchLabel' | t"
              autocomplete="off"
              spellcheck="false"
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKey($event)"
            />
            <kbd>Esc</kbd>
          </div>
          <ul id="search-results" class="palette__results" role="listbox">
            @for (r of results(); track r.url; let i = $index) {
              <li
                [id]="'search-opt-' + i"
                role="option"
                class="result"
                [class.result--active]="i === active()"
                [attr.aria-selected]="i === active()"
                (mouseenter)="active.set(i)"
                (click)="go(r.url)"
              >
                <span class="result__icon"><app-icon [name]="r.icon" [size]="16" /></span>
                <span class="result__title" [class.mono]="!r.isCategory">{{ r.title }}</span>
                <span class="result__section">{{ r.section }}</span>
                <app-icon class="result__arrow" name="arrowRight" [size]="14" />
              </li>
            } @empty {
              <li class="palette__empty">
                @if (query().trim().length < 2) {
                  {{ 'ui.searchHint' | t }}
                } @else {
                  {{ 'ui.noResults' | t }} “{{ query() }}”
                }
              </li>
            }
          </ul>
        </div>
      }
    </dialog>
  `,
  styles: `
    .palette {
      width: min(640px, calc(100vw - 2rem));
      max-height: min(560px, calc(100vh - 6rem));
      margin: 12vh auto auto;
      padding: 0;
      border: 1px solid var(--border-strong);
      border-radius: 18px;
      background: var(--surface-solid);
      color: var(--text);
      box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6), var(--glow-pink);
      overflow: hidden;
      &::backdrop {
        background: rgba(10, 6, 11, 0.65);
        backdrop-filter: blur(4px);
      }
    }
    .palette__field {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid var(--border);
      color: var(--pink);
      input {
        flex: 1;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--text);
        font: 500 1.05rem var(--font);
        &::-webkit-search-cancel-button {
          display: none;
        }
      }
    }
    kbd {
      padding: 0.1rem 0.45rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.7rem;
      color: var(--muted);
    }
    .palette__results {
      max-height: 420px;
      margin: 0;
      padding: 0.5rem;
      overflow-y: auto;
      list-style: none;
    }
    .result {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.75rem;
      border-radius: 10px;
      cursor: pointer;
      &--active {
        background: rgba(242, 153, 251, 0.12);
        .result__arrow {
          opacity: 1;
        }
      }
    }
    .result__icon {
      display: inline-flex;
      padding: 0.35rem;
      border-radius: 8px;
      background: rgba(163, 254, 255, 0.08);
      color: var(--cyan);
    }
    .result__title {
      font-weight: 600;
    }
    .result__section {
      margin-left: auto;
      font-size: 0.8rem;
      color: var(--subtle);
      text-align: right;
    }
    .result__arrow {
      color: var(--pink);
      opacity: 0;
    }
    .palette__empty {
      padding: 1.5rem;
      text-align: center;
      color: var(--subtle);
    }
  `,
})
export class SearchPalette {
  protected readonly nav = inject(Nav);
  private readonly i18n = inject(I18n);
  private readonly router = inject(Router);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly query = signal('');
  protected readonly active = signal(0);

  private readonly index = computed<SearchEntry[]>(() => {
    this.i18n.lang();
    const t = (k: string) => this.i18n.t(k);
    return CATEGORIES.flatMap((c) => {
      const section = t(`${c.key}.title`);
      const category: SearchEntry = {
        title: section,
        section: t(`ui.groups.${c.group}`),
        url: this.nav.link(c.path),
        icon: c.icon,
        haystack: normalize(`${section} ${c.key}`),
        isCategory: true,
      };
      return [
        category,
        ...c.items.map((item) => {
          const title = t(`${c.key}.${item.id}.title`);
          return {
            title,
            section,
            url: this.nav.link(`${c.path}/${item.id}`),
            icon: 'code',
            haystack: normalize(`${title} ${item.id}`),
            isCategory: false,
          };
        }),
      ];
    });
  });

  protected readonly results = computed(() => {
    const q = normalize(this.query().trim());
    if (q.length < 2) return [];
    return this.index()
      .filter((e) => e.haystack.includes(q))
      .sort((a, b) => Number(b.haystack.startsWith(q)) - Number(a.haystack.startsWith(q)) || a.title.length - b.title.length)
      .slice(0, 8);
  });

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.nav.searchOpen() && !dialog.open) {
        dialog.showModal();
        this.input()?.nativeElement.focus();
      } else if (!this.nav.searchOpen() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onGlobalKey(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.nav.searchOpen.update((open) => !open);
    }
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
  }

  protected onKey(event: KeyboardEvent): void {
    const total = this.results().length;
    if (!total) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.update((i) => (i + 1) % total);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update((i) => (i - 1 + total) % total);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.go(this.results()[this.active()].url);
    }
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.nav.searchOpen.set(false);
  }

  protected go(url: string): void {
    this.nav.searchOpen.set(false);
    this.query.set('');
    this.router.navigateByUrl(url);
  }
}
