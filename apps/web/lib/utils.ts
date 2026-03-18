// ---------------------------------------------------------------------------
// Class names helper (cn / classNames)
// ---------------------------------------------------------------------------

type ClassValue = string | number | boolean | null | undefined | ClassValue[];

/**
 * Merge class names, filtering out falsy values. Supports nested arrays.
 * Usage: cn('base', condition && 'active', ['nested', false && 'skip'])
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    }
  }

  return classes.join(' ');
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Format a date string into a localized human-readable format.
 * Returns empty string for invalid dates.
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-US'
): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    });
  } catch {
    return '';
  }
}

/**
 * Format a date as a relative time string (e.g. "2 hours ago", "in 3 days").
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const now = Date.now();
    const diffMs = now - d.getTime();
    const absDiff = Math.abs(diffMs);
    const isFuture = diffMs < 0;

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const format = (value: number, unit: string): string => {
      const label = value === 1 ? unit : `${unit}s`;
      return isFuture ? `in ${value} ${label}` : `${value} ${label} ago`;
    };

    if (seconds < 60) return 'just now';
    if (minutes < 60) return format(minutes, 'minute');
    if (hours < 24) return format(hours, 'hour');
    if (days < 7) return format(days, 'day');
    if (weeks < 5) return format(weeks, 'week');
    if (months < 12) return format(months, 'month');
    return format(years, 'year');
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Number / currency formatting
// ---------------------------------------------------------------------------

/**
 * Format a number as US currency.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with locale-aware separators.
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

// ---------------------------------------------------------------------------
// String utilities
// ---------------------------------------------------------------------------

/**
 * Truncate a string to a maximum length, appending an ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1).trimEnd() + '\u2026';
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract initials from a name (up to 2 characters).
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === '')) return '?';
  if (parts.length === 1) return (parts[0]?.[0] ?? '?').toUpperCase();
  return (
    (parts[0]?.[0] ?? '').toUpperCase() +
    (parts[parts.length - 1]?.[0] ?? '').toUpperCase()
  );
}

// ---------------------------------------------------------------------------
// API key generation
// ---------------------------------------------------------------------------

const BASE62_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate a cryptographically random API key with the format:
 * sb_live_ + 32 random base62 characters.
 */
export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let key = '';
  for (let i = 0; i < bytes.length; i++) {
    // Use modulo to map each byte to a base62 character.
    // Bias is negligible for 256 % 62.
    key += BASE62_CHARS[bytes[i]! % BASE62_CHARS.length];
  }
  return `sb_live_${key}`;
}

/**
 * Hash an API key using SHA-256. Returns a hex-encoded digest.
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// Webhook URL validation
// ---------------------------------------------------------------------------

/** Private/reserved IPv4 ranges (CIDR approximations as regex). */
const PRIVATE_IP_PATTERNS = [
  /^127\./, // 127.0.0.0/8
  /^10\./, // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./, // 192.168.0.0/16
  /^169\.254\./, // Link-local
  /^0\./, // 0.0.0.0/8
];

/**
 * Validate a webhook URL. Must be HTTPS, no localhost, no private IPs.
 * Returns an error message string or null if valid.
 */
export function validateWebhookUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      return 'Webhook URL must use HTTPS';
    }

    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname === '0.0.0.0'
    ) {
      return 'Localhost URLs are not allowed';
    }

    // Check for private IP addresses
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return 'Private IP addresses are not allowed';
      }
    }

    return null;
  } catch {
    return 'Invalid URL';
  }
}

// ---------------------------------------------------------------------------
// User agent parsing
// ---------------------------------------------------------------------------

/**
 * Parse a user-agent string and return a device type.
 */
export function parseUserAgent(
  ua: string
): 'desktop' | 'mobile' | 'tablet' {
  const lower = ua.toLowerCase();

  // Tablet detection (before mobile since some tablets include "mobile")
  if (
    /ipad|tablet|playbook|silk|kindle|nexus\s?(7|9|10)/i.test(lower) ||
    (/android/i.test(lower) && !/mobile/i.test(lower))
  ) {
    return 'tablet';
  }

  // Mobile detection
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/i.test(
      lower
    )
  ) {
    return 'mobile';
  }

  return 'desktop';
}

// ---------------------------------------------------------------------------
// Color validation
// ---------------------------------------------------------------------------

/**
 * Check if a string is a valid hex color (#RGB or #RRGGBB).
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

// ---------------------------------------------------------------------------
// Math
// ---------------------------------------------------------------------------

/**
 * Clamp a number between a min and max value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
