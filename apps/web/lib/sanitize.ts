/**
 * Strip all HTML tags from a string and trim whitespace.
 * Used to sanitize user-submitted text before storage.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}
