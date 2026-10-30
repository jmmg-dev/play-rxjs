import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Nav } from '../core/nav.service';
import { Crumb } from '../core/seo.service';
import { Icon } from './icon';

@Component({
  selector: 'app-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <nav class="crumbs" aria-label="Breadcrumb">
      <ol>
        @for (crumb of crumbs(); track crumb.path; let last = $last) {
          <li>
            @if (last) {
              <span aria-current="page">{{ crumb.name }}</span>
            } @else {
              <a [routerLink]="nav.link(crumb.path)">{{ crumb.name }}</a>
              <app-icon name="chevron" [size]="12" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem;
      margin: 0 0 1.5rem;
      padding: 0;
      list-style: none;
      font: 500 0.8rem var(--mono);
      color: var(--subtle);
    }
    li {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    a {
      color: var(--muted);
      &:hover {
        color: var(--pink);
      }
    }
    [aria-current] {
      color: var(--cyan);
    }
  `,
})
export class Breadcrumbs {
  protected readonly nav = inject(Nav);
  readonly crumbs = input.required<Crumb[]>();
}
