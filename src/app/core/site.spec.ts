import { AUTHOR, PAYMENT_METHODS, SITE_URL } from './site';

describe('site constants', () => {
  it('uses the production domain without a trailing slash', () => {
    expect(SITE_URL).toBe('https://playrxjs.com');
  });

  it('points the author links to the project repository and website', () => {
    expect(AUTHOR.repo).toBe('https://github.com/jmmg-dev/play-rxjs');
    expect(AUTHOR.web).toBe('https://jmmg.dev');
  });

  it('lists Ko-fi as the first payment method', () => {
    expect(PAYMENT_METHODS[0]).toMatchObject({ id: 'kofi', url: 'https://ko-fi.com/jmmgdev' });
  });
});
