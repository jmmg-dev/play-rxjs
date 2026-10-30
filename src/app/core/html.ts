/** Removes tags and collapses whitespace (used for meta descriptions and search). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?)])/g, '$1')
    .trim();
}

/** First paragraph of an HTML description, keeping its inline markup. */
export function firstParagraph(html: string): string {
  const match = html.match(/<p>(.*?)<\/p>/);
  return match ? match[1] : html;
}

/** Shortens text to a max length on a word boundary. */
export function truncate(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}
