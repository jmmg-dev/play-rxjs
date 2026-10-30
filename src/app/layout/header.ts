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

      <a class="brand" [routerLink]="nav.link()" aria-label="Play RxJS — {{ 'ui.home' | t }}">
        <img class="brand__logo" src="/images/logo-prx.svg" width="38" height="38" alt="" />
        <span class="brand__text">
          <span class="brand__name">Play <span class="gradient-text">RxJS</span></span>
          <span class="brand__tagline">{{ 'ui.tagline' | t }}</span>
        </span>
      </a>

      <button type="button" class="search-trigger" (click)="nav.searchOpen.set(true)" [attr.aria-label]="'ui.openSearch' | t">
        <app-icon name="search" [size]="16" />
        <span class="search-trigger__text">{{ 'ui.search' | t }}</span>
        <kbd>Ctrl K</kbd>
      </button>

      <app-lang-switch class="header__lang" />
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
      gap: 0.7rem;
      color: var(--text);
      min-width: 0;
      &:hover {
        color: var(--text);
      }
    }
    .brand__logo {
      display: block;
      border-radius: 7px;
      box-shadow: 0 0 0 1px var(--border-strong), 0 0 18px rgba(242, 153, 251, 0.35);
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
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
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
  `,
})
export class Header {
  protected readonly nav = inject(Nav);
}
