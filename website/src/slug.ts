/**
 * Slugify a heading's text into an id/anchor, matching the anchors used by the
 * docs "On this page" table of contents. e.g. "Static methods" -> "static-methods".
 */
export function slugify(text: string): string {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
