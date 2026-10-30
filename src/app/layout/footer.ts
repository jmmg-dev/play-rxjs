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
          <p class="footer__name">Play <span class="gradient-text">RxJS</span></p>
          <p class="footer__text">{{ 'ui.footer' | t }}</p>
          <p class="footer__author">
            {{ 'ui.author' | t }}:
            <a [href]="author.linkedin" target="_blank" rel="noopener author">{{ author.name }}</a>
          </p>
        </div>
        <nav class="footer__links" [attr.aria-label]="'operators.title' | t">
          @for (c of categories; track c.key) {
            <a [routerLink]="nav.link(c.path)">{{ c.key + '.title' | t }}</a>
          }
        </nav>
        <div class="footer__social">
          <a [href]="author.linkedin" target="_blank" rel="noopener" aria-label="LinkedIn"><app-icon name="linkedin" /></a>
          <a [href]="author.portfolio" target="_blank" rel="noopener" aria-label="Portfolio"><app-icon name="user" /></a>
          <a href="https://rxjs.dev" target="_blank" rel="noopener" aria-label="rxjs.dev"><app-icon name="external" /></a>
        </div>
      </div>
      <p class="footer__copy">© {{ year }} {{ author.name }} · RxJS 7.8 · Angular 22</p>
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
      margin: 0 0 0.4rem;
      font: 700 1.3rem var(--mono);
    }
    .footer__text,
    .footer__author {
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
    .footer__copy {
      max-width: var(--content-w);
      margin: 2.5rem auto 0;
      color: var(--subtle);
      font: 0.78rem var(--mono);
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
  protected readonly year = new Date().getFullYear();
}
