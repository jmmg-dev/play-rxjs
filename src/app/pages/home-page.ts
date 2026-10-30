import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, getCategory, OPERATOR_CATEGORIES, TOTAL_ITEMS } from '../content/catalog';
import { LANGS } from '../content/model';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Seo } from '../core/seo.service';
import { AUTHOR } from '../core/site';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, Icon, TranslatePipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly i18n = inject(I18n);
  protected readonly nav = inject(Nav);
  private readonly seo = inject(Seo);

  protected readonly operatorCategories = OPERATOR_CATEGORIES;
  protected readonly basics = getCategory('basicConcepts')!;
  protected readonly subjects = getCategory('subjects')!;
  protected readonly realLife = getCategory('realLife')!;
  protected readonly author = AUTHOR;
  protected readonly stats = [
    { value: TOTAL_ITEMS, label: 'ui.stats.operators' },
    { value: CATEGORIES.length, label: 'ui.stats.sections' },
    { value: LANGS.length, label: 'ui.stats.languages' },
  ];
  protected readonly features = [
    { key: 'live', icon: 'code' },
    { key: 'visual', icon: 'bolt' },
    { key: 'real', icon: 'rocket' },
  ];
  protected readonly marbles = [
    { values: ['1', '2', '3'], color: 'pink', delay: 0 },
    { values: ['a', 'b'], color: 'cyan', delay: 1.2 },
    { values: ['1a', '2a', '2b', '3b'], color: 'grad', delay: 0.6 },
  ];

  constructor() {
    effect(() => {
      this.i18n.lang();
      this.seo.update({
        title: this.i18n.t('seo.homeTitle'),
        description: this.i18n.t('seo.homeDescription'),
        path: '',
      });
    });
  }
}
