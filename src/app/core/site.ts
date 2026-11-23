/**
 * Public origin of the site, used for canonical URLs, hreflang, Open Graph and the sitemap.
 * Change it when the production domain changes.
 */
export const SITE_URL = 'https://playrxjs.com';

export const SITE_NAME = 'Play RxJS';

export const AUTHOR = {
  name: 'Juan Manuel Muñoz González',
  jobTitle: 'Front End Architect',
  linkedin: 'https://www.linkedin.com/in/juan-manuel-muñoz-gonzález',
  web: 'https://jmmg.dev',
  repo: 'https://github.com/jmmg-dev/play-rxjs',
};

export const OG_IMAGE = { path: '/images/social_media.jpg', width: 1280, height: 640 };

/** Donation methods shown in the home "Support" section; the first one is the highlighted button. */
export const PAYMENT_METHODS = [{ id: 'kofi', name: 'Ko-fi', url: 'https://ko-fi.com/jmmgdev', icon: 'coffee' }] as const;
