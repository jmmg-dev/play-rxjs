import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LANGS, Lang } from '../content/model';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-lang-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, TranslatePipe],
  template: `
    <nav class="lang" [attr.aria-label]="'ui.language' | t">
      <app-icon name="globe" [size]="16" />
      @for (l of langs; track l) {
        <a
          class="lang__link"
          [class.lang__link--active]="l === i18n.lang()"
          [routerLink]="links()[l]"
          [attr.hreflang]="l"
          [attr.lang]="l"
          [attr.aria-current]="l === i18n.lang() ? 'true' : null"
          [attr.title]="l === i18n.lang() ? null : ('ui.switchLanguage' | t)"
          (click)="remember(l)"
          >{{ l.toUpperCase() }}</a
        >
      }
    </nav>
  `,
  styles: `
    .lang {
      display: inline-flex;
      align-items: center;
      gap: 0.15rem;
      padding: 0.2rem 0.25rem 0.2rem 0.6rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--subtle);
      background: rgba(245, 242, 240, 0.03);
    }
    .lang__link {
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font: 600 0.78rem/1.4 var(--mono);
      color: var(--muted);
      &:hover {
        color: var(--text);
      }
      &--active {
        background: var(--pink);
        color: var(--dark);
        &:hover {
          color: var(--dark);
        }
      }
    }
  `,
})
export class LangSwitch {
  protected readonly i18n = inject(I18n);
  private readonly nav = inject(Nav);
  private readonly doc = inject(DOCUMENT);
  protected readonly langs = LANGS;

  protected readonly links = computed(
    () => Object.fromEntries(LANGS.map((l) => [l, this.nav.link(this.nav.restPath(), l)])) as Record<Lang, string>,
  );

  protected remember(lang: Lang): void {
    this.doc.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }
}
