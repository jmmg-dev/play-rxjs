import { ChangeDetectionStrategy, Component, effect, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Seo } from '../core/seo.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, TranslatePipe],
  template: `
    <section class="nf">
      <p class="nf__code mono" aria-hidden="true">
        <span class="nf__line"></span><span class="nf__err">404</span><span class="nf__line"></span>
      </p>
      <h1>{{ 'ui.notFound.title' | t }}</h1>
      <p class="nf__text">{{ 'ui.notFound.text' | t }}</p>
      <a class="btn btn--primary" [routerLink]="nav.link()">
        <app-icon name="arrowLeft" [size]="16" /> {{ 'ui.notFound.back' | t }}
      </a>
    </section>
  `,
  styles: `
    .nf {
      max-width: 640px;
      margin: 0 auto;
      padding: 6rem 1.5rem 2rem;
      text-align: center;
    }
    .nf__code {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .nf__line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--pink));
      &:last-child {
        background: linear-gradient(90deg, var(--pink), transparent);
      }
    }
    .nf__err {
      display: grid;
      place-items: center;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      border: 2px solid var(--danger);
      color: var(--danger);
      font-size: 1.8rem;
      font-weight: 700;
      box-shadow: 0 0 40px rgba(255, 122, 144, 0.35);
    }
    .nf__text {
      margin: 1rem 0 2rem;
      color: var(--muted);
    }
  `,
})
export class NotFoundPage {
  protected readonly nav = inject(Nav);
  private readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);

  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
    effect(() => {
      this.i18n.lang();
      this.seo.update({
        title: `404 · ${this.i18n.t('ui.notFound.title')} | Play RxJS`,
        description: this.i18n.t('ui.notFound.text'),
        path: this.nav.restPath(),
        noindex: true,
      });
    });
  }
}
