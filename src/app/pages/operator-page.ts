import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FLAT_ITEMS, getCategory } from '../content/catalog';
import { CategoryKey, ExampleDef, MarbleData } from '../content/model';
import { firstParagraph, stripHtml, truncate } from '../core/html';
import { I18n } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { Nav } from '../core/nav.service';
import { Crumb, Seo } from '../core/seo.service';
import { SITE_NAME } from '../core/site';
import { Playground } from '../playground/playground';
import { Breadcrumbs } from '../shared/breadcrumbs';
import { Icon } from '../shared/icon';
import { MarbleDiagram } from '../shared/marble-diagram';

@Component({
  selector: 'app-operator-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, Breadcrumbs, MarbleDiagram, Playground, TranslatePipe],
  templateUrl: './operator-page.html',
  styleUrl: './operator-page.scss',
})
export class OperatorPage {
  readonly category = input.required<CategoryKey>();
  readonly id = input.required<string>();
  readonly example = input<ExampleDef>();
  readonly marble = input<MarbleData>();

  protected readonly i18n = inject(I18n);
  protected readonly nav = inject(Nav);
  private readonly seo = inject(Seo);

  protected readonly cat = computed(() => getCategory(this.category())!);
  protected readonly item = computed(() => this.cat().items.find((i) => i.id === this.id())!);
  protected readonly key = computed(() => `${this.category()}.${this.id()}`);
  protected readonly isCode = computed(() => ['operators', 'subjects'].includes(this.cat().group));

  private readonly position = computed(() =>
    FLAT_ITEMS.findIndex((e) => e.category.key === this.category() && e.item.id === this.id()),
  );
  protected readonly prev = computed(() => FLAT_ITEMS[this.position() - 1]);
  protected readonly next = computed(() => FLAT_ITEMS[this.position() + 1]);
  protected readonly siblings = computed(() => this.cat().items.filter((i) => i.id !== this.id()));

  protected readonly crumbs = computed<Crumb[]>(() => {
    this.i18n.lang();
    const cat = this.cat();
    return [
      { name: this.i18n.t('ui.home'), path: '' },
      { name: this.i18n.t(`${cat.key}.title`), path: `/${cat.path}` },
      { name: this.i18n.t(`${this.key()}.title`), path: `/${cat.path}/${this.id()}` },
    ];
  });

  constructor() {
    effect(() => {
      const cat = this.cat();
      const lang = this.i18n.lang();
      const name = this.i18n.t(`${this.key()}.title`);
      const categoryTitle = this.i18n.t(`${cat.key}.title`);
      const description = truncate(stripHtml(firstParagraph(this.i18n.t(`${this.key()}.description`))));
      const code = this.example()?.code;
      this.seo.update({
        title: `${name} · ${categoryTitle} | ${SITE_NAME}`,
        description,
        path: `/${cat.path}/${this.id()}`,
        type: 'article',
        breadcrumbs: this.crumbs(),
        schema: code
          ? [
              {
                '@type': 'SoftwareSourceCode',
                name: `${name} — RxJS example`,
                programmingLanguage: 'TypeScript',
                codeSampleType: 'code snippet',
                runtimePlatform: 'RxJS 7',
                inLanguage: lang,
                text: code,
              },
            ]
          : [],
      });
    });
  }
}
