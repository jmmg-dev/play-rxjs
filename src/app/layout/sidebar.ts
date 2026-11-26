import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CATEGORIES, GROUPS } from '../content/catalog';
import { Category } from '../content/model';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon, TranslatePipe],
  host: { '(document:keydown.escape)': 'nav.drawerOpen.set(false)' },
  template: `
    <!-- Clicking the backdrop closes the drawer; from the keyboard it closes with Esc or the close button -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <div
      class="backdrop"
      [class.backdrop--visible]="nav.drawerOpen()"
      (click)="nav.drawerOpen.set(false)"
    ></div>
    <aside id="sidebar" class="sidebar" [class.sidebar--open]="nav.drawerOpen()">
      <div class="sidebar__top">
        <a
          class="sidebar__brand"
          [routerLink]="nav.link()"
          aria-label="Play RxJS — {{ 'ui.home' | t }}"
          (click)="nav.drawerOpen.set(false)"
        >
          <img src="/images/icon-96.webp" width="32" height="32" alt="" />
          <span>Play <span class="gradient-text">RxJS</span></span>
        </a>
        <button
          type="button"
          class="sidebar__close"
          [attr.aria-label]="'ui.closeMenu' | t"
          (click)="nav.drawerOpen.set(false)"
        >
          <app-icon name="close" />
        </button>
      </div>
      <nav [attr.aria-label]="'ui.mainNav' | t">
        @for (group of groups; track group) {
          <div class="group">
            <p class="group__title">{{ 'ui.groups.' + group | t }}</p>
            @for (category of byGroup(group); track category.key) {
              <!-- A link and a separate toggle button: a link inside <summary> nests two controls -->
              <div class="cat">
                <div class="cat__head">
                  <a
                    class="cat__link"
                    [routerLink]="nav.link(category.path)"
                    routerLinkActive="is-active"
                    [routerLinkActiveOptions]="{ exact: true }"
                    ariaCurrentWhenActive="page"
                  >
                    <app-icon [name]="category.icon" [size]="16" />
                    <span>{{ category.key + '.title' | t }}</span>
                  </a>
                  <button
                    type="button"
                    class="cat__toggle"
                    [attr.aria-expanded]="isOpen(category)"
                    [attr.aria-controls]="'cat-' + category.key"
                    [attr.aria-label]="
                      category.items.length +
                      ' ' +
                      ('ui.examples' | t) +
                      ' · ' +
                      (category.key + '.title' | t)
                    "
                    (click)="toggle(category)"
                  >
                    <span class="cat__count">{{ category.items.length }}</span>
                    <app-icon class="cat__chevron" name="chevron" [size]="14" />
                  </button>
                </div>
                <ul class="cat__items" [id]="'cat-' + category.key" [hidden]="!isOpen(category)">
                  @for (item of category.items; track item.id) {
                    <li>
                      <a
                        class="item"
                        [routerLink]="nav.link(category.path + '/' + item.id)"
                        routerLinkActive="is-active"
                        ariaCurrentWhenActive="page"
                        >{{ category.key + '.' + item.id + '.title' | t }}
                        @if (item.isNew) {
                          <span class="dot" [attr.title]="'ui.isNewHint' | t"></span>
                        }
                        @if (item.deprecated) {
                          <span
                            class="dot dot--deprecated"
                            [attr.title]="'ui.deprecated' | t"
                          ></span>
                        }
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        }
        <a
          class="support-link"
          [routerLink]="nav.link()"
          fragment="support"
          (click)="nav.drawerOpen.set(false)"
        >
          <app-icon name="heart" [size]="16" />
          <span>{{ 'support.menu' | t }}</span>
        </a>
      </nav>
    </aside>
  `,
  styles: `
    .sidebar {
      position: fixed;
      top: var(--header-h);
      bottom: 0;
      left: 0;
      z-index: 40;
      width: var(--sidebar-w);
      padding: 1rem 0.75rem 2rem 1rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      border-right: 1px solid var(--border);
      background: rgba(22, 17, 23, 0.6);
      scrollbar-width: thin;
    }
    .sidebar__top {
      display: none;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text);
      font: 700 1.1rem/1.1 var(--mono);
      letter-spacing: -0.02em;
      &:hover {
        color: var(--text);
      }
      img {
        display: block;
        border-radius: 6px;
      }
    }
    .sidebar__close {
      display: inline-flex;
      padding: 0.4rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: transparent;
      color: var(--text);
      cursor: pointer;
    }
    .group {
      margin-bottom: 1.1rem;
    }
    .group__title {
      margin: 0 0 0.35rem 0.5rem;
      font: 600 0.7rem/1.4 var(--mono);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--subtle);
    }
    .cat__head {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.15rem 0 0.15rem 0;
      border-radius: var(--radius-sm);
      &:hover {
        background: rgba(245, 242, 240, 0.04);
      }
    }
    .cat__toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      align-self: stretch;
      padding: 0 0.35rem 0 0.5rem;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .cat__link {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.4rem 0.5rem;
      color: var(--text);
      font-weight: 600;
      font-size: 0.93rem;
      &.is-active {
        color: var(--pink);
      }
    }
    .cat__count {
      font: 500 0.7rem var(--mono);
      color: var(--subtle);
    }
    .cat__chevron {
      color: var(--subtle);
      transition: transform 0.2s ease;
    }
    .cat__toggle[aria-expanded='true'] .cat__chevron {
      transform: rotate(90deg);
    }
    .cat__items {
      margin: 0.1rem 0 0.5rem 1.15rem;
      padding: 0 0 0 0.75rem;
      list-style: none;
      border-left: 1px solid var(--border);
    }
    .item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.22rem 0.5rem;
      border-radius: 7px;
      font: 500 0.84rem/1.5 var(--mono);
      color: var(--muted);
      &:hover {
        color: var(--text);
        background: rgba(245, 242, 240, 0.04);
      }
      &.is-active {
        color: var(--dark);
        background: var(--pink);
        &::before {
          content: '';
          position: absolute;
          left: calc(-0.75rem - 1px);
          top: 15%;
          bottom: 15%;
          width: 2px;
          background: var(--pink);
        }
      }
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--cyan);
      box-shadow: 0 0 8px var(--cyan);
    }
    .dot--deprecated {
      background: var(--orange);
      box-shadow: 0 0 8px var(--orange);
    }
    .is-active .dot {
      box-shadow: 0 0 0 1.5px var(--dark);
    }
    .support-link {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      margin-top: 0.5rem;
      padding: 0.9rem 0.5rem 0.4rem;
      border-top: 1px solid var(--border);
      color: var(--text);
      font-weight: 600;
      font-size: 0.93rem;
      app-icon {
        color: var(--pink);
      }
      &:hover {
        color: var(--pink);
      }
    }
    .backdrop {
      display: none;
    }
    @media (max-width: 1099px) {
      .sidebar {
        top: 0;
        z-index: 70;
        padding-top: 0;
        width: min(340px, 88vw);
        background: var(--surface-solid);
        transform: translateX(-102%);
        transition: transform 0.25s ease;
        box-shadow: 20px 0 60px rgba(0, 0, 0, 0.5);
      }
      .sidebar--open {
        transform: none;
      }
      /* Stays pinned while the list scrolls: negative margins cancel the side padding */
      .sidebar__top {
        display: flex;
        position: sticky;
        top: 0;
        z-index: 1;
        margin: 0 -0.75rem 0.75rem -1rem;
        padding: 0.8rem 0.75rem 0.8rem 1rem;
        background: var(--surface-solid);
        border-bottom: 1px solid var(--border);
      }
      .backdrop {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 60;
        background: rgba(10, 6, 11, 0.6);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .backdrop--visible {
        opacity: 1;
        pointer-events: auto;
      }
    }
  `,
})
export class Sidebar {
  protected readonly nav = inject(Nav);
  protected readonly groups = GROUPS;

  /** Sections the user opened or closed by hand; the rest follow the current page. */
  private readonly toggled = signal<Partial<Record<string, boolean>>>({});

  constructor() {
    // Close the drawer after every navigation, and let the current section open again
    effect(() => {
      this.nav.url();
      this.nav.drawerOpen.set(false);
      untracked(() => this.toggled.set({}));
    });
  }

  protected isOpen(category: Category): boolean {
    return this.toggled()[category.key] ?? this.isActive(category);
  }

  protected toggle(category: Category): void {
    const open = !this.isOpen(category);
    this.toggled.update((state) => ({ ...state, [category.key]: open }));
  }

  protected byGroup(group: string): Category[] {
    return CATEGORIES.filter((c) => c.group === group);
  }

  protected isActive(category: Category): boolean {
    const path = this.nav.restPath();
    return path === `/${category.path}` || path.startsWith(`/${category.path}/`);
  }
}
