/**
 * Decode common HTML entities to their character equivalents.
 * Used for displaying data that was stored with HTML entities.
 */
export function decodeHtmlEntities(text: string | undefined | null): string {
  if (!text) return '';

  return text
    .replace(/&reg;/gi, '\u00AE')    // ®
    .replace(/&trade;/gi, '\u2122')  // ™
    .replace(/&copy;/gi, '\u00A9')   // ©
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, '\u00A0')    // non-breaking space
    .replace(/&mdash;/g, '\u2014')   // —
    .replace(/&ndash;/g, '\u2013')   // –
    .replace(/&hellip;/g, '\u2026')  // …
    .replace(/&lsquo;/g, '\u2018')   // '
    .replace(/&rsquo;/g, '\u2019')   // '
    .replace(/&ldquo;/g, '\u201C')   // "
    .replace(/&rdquo;/g, '\u201D')   // "
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}
