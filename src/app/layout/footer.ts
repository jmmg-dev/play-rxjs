import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OPERATOR_CATEGORIES } from '../content/catalog';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { AUTHOR } from '../core/site';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, TranslatePipe],
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <p class="footer__name">
            <img class="footer__logo" src="/images/icon-96.webp" width="32" height="32" alt="" />
            <span>Play <span class="gradient-text">RxJS</span></span>
          </p>
          <p class="footer__text">{{ 'ui.footer' | t }}</p>
          <p class="poweredby">
            <a href="https://jmmg.dev" target="_blank" rel="noopener" aria-label="Powered by JMMG.dev">
              <span aria-hidden="true">Powered by</span>
              <img src="/brand/jmmg-dev-dark-bg.svg" alt="" width="80" height="15" />
            </a>
            <span aria-hidden="true">·</span>
            <span>© 2026 JMMG.dev</span>
          </p>
        </div>
        <nav class="footer__links" [attr.aria-label]="'operators.title' | t">
          @for (c of categories; track c.key) {
            <a [routerLink]="nav.link(c.path)">{{ c.key + '.title' | t }}</a>
          }
        </nav>
        <div class="footer__social">
          <a [href]="author.linkedin" target="_blank" rel="noopener" aria-label="LinkedIn"><app-icon name="linkedin" /></a>
          <a [href]="author.repo" target="_blank" rel="noopener" aria-label="GitHub"><app-icon name="github" /></a>
          <a [href]="author.web" target="_blank" rel="noopener" aria-label="jmmg.dev"><app-icon name="globe" /></a>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      margin-top: 5rem;
      padding: 3rem 1.5rem 2rem;
      border-top: 1px solid var(--border);
      background: linear-gradient(180deg, transparent, rgba(47, 38, 48, 0.4));
    }
    .footer__inner {
      max-width: var(--content-w);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.2fr 2fr auto;
      gap: 2rem;
    }
    .footer__name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0 0 0.4rem;
      font: 700 1.3rem var(--mono);
    }
    .footer__logo {
      display: block;
      border-radius: 7px;
      box-shadow: 0 0 0 1px var(--border-strong), 0 0 14px rgba(242, 153, 251, 0.3);
    }
    .footer__text {
      margin: 0 0 0.3rem;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .footer__links {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 0.4rem 1rem;
      a {
        color: var(--muted);
        font-size: 0.9rem;
        &:hover {
          color: var(--pink);
        }
      }
    }
    .footer__social {
      display: flex;
      gap: 0.6rem;
      a {
        display: inline-flex;
        padding: 0.55rem;
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--muted);
        &:hover {
          color: var(--cyan);
          border-color: var(--border-strong);
        }
      }
    }
    .poweredby {
      margin: 0.8rem 0 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.45rem;
      color: var(--subtle);
      font: 0.78rem var(--mono);
      a {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        color: inherit;
      }
      img {
        display: block;
      }
    }
    @media (max-width: 820px) {
      .footer__inner {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Footer {
  protected readonly nav = inject(Nav);
  protected readonly categories = OPERATOR_CATEGORIES;
  protected readonly author = AUTHOR;
}
