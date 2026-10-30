import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
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
    <div class="backdrop" [class.backdrop--visible]="nav.drawerOpen()" (click)="nav.drawerOpen.set(false)"></div>
    <aside id="sidebar" class="sidebar" [class.sidebar--open]="nav.drawerOpen()">
      <div class="sidebar__top">
        <span class="eyebrow">{{ 'ui.mainNav' | t }}</span>
        <button type="button" class="sidebar__close" [attr.aria-label]="'ui.closeMenu' | t" (click)="nav.drawerOpen.set(false)">
          <app-icon name="close" />
        </button>
      </div>
      <nav [attr.aria-label]="'ui.mainNav' | t">
        @for (group of groups; track group) {
          <div class="group">
            <p class="group__title">{{ 'ui.groups.' + group | t }}</p>
            @for (category of byGroup(group); track category.key) {
              <details class="cat" [open]="isActive(category)">
                <summary class="cat__summary">
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
                  <span class="cat__count">{{ category.items.length }}</span>
                  <app-icon class="cat__chevron" name="chevron" [size]="14" />
                </summary>
                <ul class="cat__items">
                  @for (item of category.items; track item.id) {
                    <li>
                      <a
                        class="item"
                        [class.item--deprecated]="item.deprecated"
                        [routerLink]="nav.link(category.path + '/' + item.id)"
                        routerLinkActive="is-active"
                        ariaCurrentWhenActive="page"
                        >{{ category.key + '.' + item.id + '.title' | t }}
                        @if (item.isNew) {
                          <span class="dot" [attr.title]="'ui.isNew' | t"></span>
                        }
                      </a>
                    </li>
                  }
                </ul>
              </details>
            }
          </div>
        }
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
    .cat__summary {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.15rem 0.35rem 0.15rem 0;
      border-radius: var(--radius-sm);
      list-style: none;
      cursor: pointer;
      &::-webkit-details-marker {
        display: none;
      }
      &:hover {
        background: rgba(245, 242, 240, 0.04);
      }
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
    details[open] > .cat__summary .cat__chevron {
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
      &--deprecated:not(.is-active) {
        text-decoration: line-through;
        text-decoration-color: rgba(255, 212, 121, 0.5);
      }
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--cyan);
      box-shadow: 0 0 8px var(--cyan);
    }
    .backdrop {
      display: none;
    }
    @media (max-width: 1099px) {
      .sidebar {
        top: 0;
        z-index: 70;
        width: min(340px, 88vw);
        background: var(--surface-solid);
        transform: translateX(-102%);
        transition: transform 0.25s ease;
        box-shadow: 20px 0 60px rgba(0, 0, 0, 0.5);
      }
      .sidebar--open {
        transform: none;
      }
      .sidebar__top {
        display: flex;
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

  constructor() {
    // Close the drawer after every navigation
    effect(() => {
      this.nav.url();
      this.nav.drawerOpen.set(false);
    });
  }

  protected byGroup(group: string): Category[] {
    return CATEGORIES.filter((c) => c.group === group);
  }

  protected isActive(category: Category): boolean {
    const path = this.nav.restPath();
    return path === `/${category.path}` || path.startsWith(`/${category.path}/`);
  }
}
