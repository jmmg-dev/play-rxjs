import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { buildSitemap } from './app/core/sitemap';
import { DEFAULT_LANG, isLang } from './app/content/model';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.disable('x-powered-by');
const angularApp = new AngularNodeAppEngine();

/** Security and SEO friendly headers for every response. */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

/** `/` -> preferred language (cookie, then Accept-Language). */
app.get('/', (req, res) => {
  const cookie = /(?:^|;\s*)lang=(\w+)/.exec(req.headers.cookie ?? '')?.[1];
  const lang = isLang(cookie) ? cookie : req.acceptsLanguages('en', 'es') || DEFAULT_LANG;
  res.setHeader('Vary', 'Accept-Language, Cookie');
  res.setHeader('Cache-Control', 'private, max-age=0');
  res.redirect(302, `/${lang}`);
});

app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml').setHeader('Cache-Control', 'public, max-age=3600');
  res.send(buildSitemap());
});

/** Serve static files from /browser (hashed assets are immutable). */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      if (!/-[A-Z0-9]{8}\.(js|css|woff2?)$/.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    },
  }),
);

/** Handle all other requests by rendering the Angular application. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/** Request handler used by the Angular CLI (dev-server and build) and by the Vercel function. */
export const reqHandler = createNodeRequestHandler(app);
