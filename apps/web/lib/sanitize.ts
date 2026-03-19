/**
 * Strip all HTML tags from a string and trim whitespace.
 * Used to sanitize user-submitted text before storage.
 * Handles unclosed tags, null bytes, and HTML entities.
 */
export function stripHtml(str: string): string {
  return str
    .replace(/\0/g, '')                 // null bytes
    .replace(/<[^>]*>?/g, '')           // tags (including unclosed)
    .replace(/&#?[a-zA-Z0-9]+;/g, '')   // HTML entities
    .trim();
}
