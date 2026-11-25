import { ViewportScroller } from '@angular/common';
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';

describe('appConfig', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--header-h');
    document.getElementById('target')?.remove();
    vi.restoreAllMocks();
  });

  const scrollToTarget = async () => {
    // Hydration warns that there is no server state to reuse, which is expected in a unit test
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: appConfig.providers });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    const target = document.createElement('section');
    target.id = 'target';
    document.body.appendChild(target);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    TestBed.inject(ViewportScroller).scrollToAnchor('target');
    return scrollTo.mock.calls[0][0] as ScrollToOptions;
  };

  it('leaves room for the fixed header when scrolling to an anchor', async () => {
    document.documentElement.style.setProperty('--header-h', '70px');
    expect((await scrollToTarget()).top).toBe(-(70 + 24));
  });

  it('falls back to a 64px header when the CSS variable is missing', async () => {
    expect((await scrollToTarget()).top).toBe(-(64 + 24));
  });
});
