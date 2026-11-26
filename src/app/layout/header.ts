import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Icon } from '../shared/icon';
import { LangSwitch } from './lang-switch';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, LangSwitch, TranslatePipe],
  template: `
    <header class="header">
      <button
        type="button"
        class="header__menu"
        [attr.aria-label]="'ui.openMenu' | t"
        [attr.aria-expanded]="nav.drawerOpen()"
        aria-controls="sidebar"
        (click)="nav.drawerOpen.set(true)"
      >
        <app-icon name="menu" [size]="22" />
      </button>

      <!-- Named by its visible text (Play RxJS + tagline), so voice control users can say what they see -->
      <a class="brand" [routerLink]="nav.link()">
        <span class="brand__text">
          <span class="brand__name">Play <span class="gradient-text">RxJS</span></span>
          <span class="brand__tagline"
            >{{ 'ui.tagline' | t }} <app-icon name="bolt" [size]="11"
          /></span>
        </span>
      </a>

      <button
        type="button"
        class="search-trigger"
        (click)="nav.searchOpen.set(true)"
        [attr.aria-label]="('ui.search' | t) + ' Ctrl K'"
        aria-keyshortcuts="Control+K"
      >
        <app-icon name="search" [size]="16" />
        <span class="search-trigger__text">{{ 'ui.search' | t }}</span>
        <kbd>Ctrl K</kbd>
      </button>

      <app-lang-switch class="header__lang" />

      <a
        class="header__support"
        [routerLink]="nav.link()"
        fragment="support"
        [attr.aria-label]="'support.title' | t"
        [attr.title]="'support.title' | t"
      >
        <app-icon name="heart" [size]="20" />
      </a>

      <a
        class="header__logo"
        [routerLink]="nav.link()"
        aria-label="Play RxJS — {{ 'ui.home' | t }}"
      >
        <img class="brand__logo" src="/images/icon-96.webp" width="38" height="38" alt="" />
      </a>
    </header>
  `,
  styles: `
    .header {
      position: fixed;
      inset: 0 0 auto 0;
      z-index: 50;
      height: var(--header-h);
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0 1.25rem;
      background: rgba(22, 17, 23, 0.72);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(16px) saturate(140%);
      -webkit-backdrop-filter: blur(16px) saturate(140%);
    }
    .header__menu {
      display: inline-flex;
      padding: 0.45rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: transparent;
      color: var(--text);
      cursor: pointer;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 1.1rem;
      color: var(--text);
      min-width: 0;
      &:hover {
        color: var(--text);
      }
    }
    .header__lang {
      flex-shrink: 0;
    }
    .header__support {
      display: inline-flex;
      flex-shrink: 0;
      padding: 0.45rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--pink);
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
      &:hover {
        color: var(--pink);
        border-color: var(--border-strong);
        box-shadow: var(--glow-pink);
      }
    }
    .header__logo {
      display: inline-flex;
      flex-shrink: 0;
    }
    .brand__logo {
      display: block;
      border-radius: 7px;
      box-shadow:
        0 0 0 1px var(--border-strong),
        0 0 18px rgba(242, 153, 251, 0.35);
    }
    .brand__text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .brand__name {
      font: 700 1.2rem/1.1 var(--mono);
      letter-spacing: -0.02em;
    }
    .brand__tagline {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.72rem;
      color: var(--cyan);
      white-space: nowrap;
    }
    .search-trigger {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      width: min(360px, 38vw);
      padding: 0.55rem 0.7rem 0.55rem 0.9rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(245, 242, 240, 0.04);
      color: var(--subtle);
      font: 500 0.9rem var(--font);
      cursor: pointer;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
      &:hover {
        border-color: var(--border-strong);
        box-shadow: var(--glow-pink);
      }
    }
    .search-trigger__text {
      flex: 1;
      text-align: left;
    }
    kbd {
      padding: 0.1rem 0.45rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.7rem;
      color: var(--muted);
    }
    @media (min-width: 1100px) {
      .header__menu {
        display: none;
      }
    }
    @media (max-width: 760px) {
      .header {
        gap: 0.6rem;
        padding: 0 0.75rem;
      }
      .brand__tagline,
      .search-trigger__text,
      kbd {
        display: none;
      }
      .search-trigger {
        width: auto;
        padding: 0.55rem;
      }
    }
    /* Not enough room for everything: the PRX logo moves left, next to the menu, as the home link */
    @media (max-width: 480px) {
      .header {
        gap: 0.45rem;
      }
      .brand {
        display: none;
      }
      .header__menu {
        order: -2;
      }
      .header__logo {
        order: -1;
      }
    }
  `,
})
export class Header {
  protected readonly nav = inject(Nav);
}
