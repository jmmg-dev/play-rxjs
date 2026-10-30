// Vercel Serverless Function: renders every non-static request with Angular SSR.
// Prerendered pages and assets are served directly from the CDN (dist/play-rxjs/browser).
export default async function handler(req, res) {
  const { reqHandler } = await import('../dist/play-rxjs/server/server.mjs');
  return reqHandler(req, res);
}
