import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Footer } from './footer';
import { Header } from './header';
import { SearchPalette } from './search-palette';
import { Sidebar } from './sidebar';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Sidebar, Footer, SearchPalette, TranslatePipe],
  template: `
    <a class="skip-link" [href]="nav.url().split('#')[0] + '#main'" (click)="skip($event)">
      {{ 'ui.skipToContent' | t }}
    </a>
    <app-header />
    <div class="layout">
      <app-sidebar />
      <div class="layout__main">
        <main id="main" tabindex="-1" [attr.lang]="i18n.lang()">
          <router-outlet />
        </main>
        <app-footer />
      </div>
    </div>
    <app-search-palette />
  `,
  styles: `
    .layout {
      padding-top: var(--header-h);
    }
    .layout__main {
      min-width: 0;
    }
    main {
      outline: none;
      min-height: calc(100vh - var(--header-h));
    }
    @media (min-width: 1100px) {
      .layout__main {
        margin-left: var(--sidebar-w);
      }
    }
  `,
})
export class Shell {
  protected readonly nav = inject(Nav);
  protected readonly i18n = inject(I18n);
  private readonly doc = inject(DOCUMENT);

  protected skip(event: Event): void {
    event.preventDefault();
    this.doc.getElementById('main')?.focus();
  }
}
