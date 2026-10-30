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
  protected readonly orbitBalls = [
    { label: '1', tone: 'pink', ring: 1, angle: 10 },
    { label: 'a', tone: 'cyan', ring: 1, angle: 100 },
    { label: '2', tone: 'pink', ring: 1, angle: 190 },
    { label: 'b', tone: 'cyan', ring: 1, angle: 280 },
    { label: '1a', tone: 'grad', ring: 2, angle: 40 },
    { label: '3', tone: 'pink', ring: 2, angle: 160 },
    { label: '2b', tone: 'grad', ring: 2, angle: 280 },
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
