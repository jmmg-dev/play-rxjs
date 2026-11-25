import { DOCUMENT, RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18n } from '../core/i18n/i18n.service';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  const render = async (providers: unknown[] = []) => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), ...(providers as [])] });
    await TestBed.inject(I18n).use('es');
    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('explains the error and links back to the home page', async () => {
    const el = await render();
    expect(el.querySelector('h1')?.textContent).toBe(TestBed.inject(I18n).t('ui.notFound.title'));
    expect(el.querySelector('a.btn')?.getAttribute('href')).toBe('/es');
  });

  it('is not indexed', async () => {
    await render();
    const doc = TestBed.inject(DOCUMENT);
    expect(doc.title).toMatch(/^404 · /);
    expect(doc.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
  });

  it('answers with a real 404 status when rendered on the server', async () => {
    const response: ResponseInit = { status: 200 };
    await render([{ provide: RESPONSE_INIT, useValue: response }]);
    expect(response.status).toBe(404);
  });
});
