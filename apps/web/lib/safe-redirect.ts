/**
 * Validate a redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with "/" that do not contain "//".
 * Returns the fallback URL if the input is not safe.
 */
export function safeRedirectUrl(url: string, fallback: string): string {
  if (typeof url !== 'string' || url.length === 0) {
    return fallback;
  }

  // Must start with a single "/" (not "//" which is protocol-relative)
  if (!url.startsWith('/') || url.startsWith('//')) {
    return fallback;
  }

  // Reject backslash (some browsers normalize \ to /)
  if (url.includes('\\')) {
    return fallback;
  }

  return url;
}
