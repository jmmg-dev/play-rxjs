import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, getCategory } from '../content/catalog';
import { CategoryKey } from '../content/model';
import { firstParagraph, stripHtml, truncate } from '../core/html';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Crumb, localizedUrl, Seo } from '../core/seo.service';
import { Breadcrumbs } from '../shared/breadcrumbs';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-category-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Breadcrumbs, TranslatePipe],
  templateUrl: './category-page.html',
  styleUrl: './category-page.scss',
})
export class CategoryPage {
  readonly category = input.required<CategoryKey>();

  protected readonly i18n = inject(I18n);
  protected readonly nav = inject(Nav);
  private readonly seo = inject(Seo);

  protected readonly cat = computed(() => getCategory(this.category())!);
  protected readonly others = computed(() => CATEGORIES.filter((c) => c.key !== this.category()));
  protected readonly isCode = computed(() => ['operators', 'subjects'].includes(this.cat().group));

  protected readonly crumbs = computed<Crumb[]>(() => {
    this.i18n.lang();
    const cat = this.cat();
    return [
      { name: this.i18n.t('ui.home'), path: '' },
      { name: this.i18n.t(`${cat.key}.title`), path: `/${cat.path}` },
    ];
  });

  constructor() {
    effect(() => {
      const cat = this.cat();
      const lang = this.i18n.lang();
      const title = this.i18n.t(`${cat.key}.title`);
      this.seo.update({
        title: this.i18n.t('seo.categoryTitle', { title }),
        description: truncate(stripHtml(this.i18n.t(`${cat.key}.shortDescription`))),
        path: `/${cat.path}`,
        breadcrumbs: this.crumbs(),
        schema: [
          {
            '@type': 'ItemList',
            name: title,
            numberOfItems: cat.items.length,
            itemListElement: cat.items.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: this.i18n.t(`${cat.key}.${item.id}.title`),
              url: localizedUrl(lang, `/${cat.path}/${item.id}`),
            })),
          },
        ],
      });
    });
  }

  protected summary(id: string): string {
    return firstParagraph(this.i18n.t(`${this.category()}.${id}.description`));
  }
}
