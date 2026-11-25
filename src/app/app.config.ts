import { ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  DOCUMENT,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

/**
 * The router scrolls to anchors (#support, #operators) with window.scrollTo, which ignores CSS
 * scroll-margin/scroll-padding. Offset it by the fixed header height so the target is not hidden.
 */
function anchorOffset(): void {
  const doc = inject(DOCUMENT);
  inject(ViewportScroller).setOffset(() => {
    const header =
      parseFloat(getComputedStyle(doc.documentElement).getPropertyValue('--header-h')) || 64;
    return [0, header + 24];
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideAppInitializer(anchorOffset),
  ],
};
