import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18n } from './i18n.service';

/** Impure on purpose: the dictionary is a signal that changes when switching language. */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
