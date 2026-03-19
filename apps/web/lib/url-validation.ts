import { isIP } from 'net';

const PRIVATE_IPV4_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255' },       // RFC 1918
  { start: '172.16.0.0', end: '172.31.255.255' },      // RFC 1918
  { start: '192.168.0.0', end: '192.168.255.255' },    // RFC 1918
  { start: '127.0.0.0', end: '127.255.255.255' },      // Loopback
  { start: '169.254.0.0', end: '169.254.255.255' },    // Link-local
  { start: '0.0.0.0', end: '0.255.255.255' },          // Current network
  { start: '100.64.0.0', end: '100.127.255.255' },     // Shared address space (CGN)
  { start: '198.18.0.0', end: '198.19.255.255' },      // Benchmark testing
] as const;

function ipToNumber(ip: string): number {
  const parts = ip.split('.');
  if (parts.length !== 4) return 0;
  return parts.reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function isPrivateIpv4(ip: string): boolean {
  const num = ipToNumber(ip);
  return PRIVATE_IPV4_RANGES.some(
    (range) => num >= ipToNumber(range.start) && num <= ipToNumber(range.end),
  );
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1') return true;           // Loopback
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // fc00::/7 (ULA)
  if (lower.startsWith('fe80')) return true;   // fe80::/10 (Link-local)
  if (lower === '::') return true;             // Unspecified
  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  const v4Mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (v4Mapped) return isPrivateIpv4(v4Mapped[1] as string);
  return false;
}

export function isPrivateIp(hostname: string): boolean {
  if (isIP(hostname) === 4) return isPrivateIpv4(hostname);
  if (isIP(hostname) === 6) return isPrivateIpv6(hostname);
  return false;
}

interface WebhookUrlResult {
  valid: boolean;
  error?: string;
}

export function validateWebhookUrl(url: string): WebhookUrlResult {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Webhook URLs must use HTTPS' };
  }

  const hostname = parsed.hostname;

  // Reject localhost variants
  if (
    hostname === 'localhost' ||
    hostname === 'localhost.localdomain' ||
    hostname.endsWith('.localhost')
  ) {
    return { valid: false, error: 'Webhook URLs cannot target localhost' };
  }

  // Reject IP addresses that are private/reserved
  if (isIP(hostname) > 0) {
    if (isPrivateIp(hostname)) {
      return { valid: false, error: 'Webhook URLs cannot target private or reserved IP addresses' };
    }
  }

  // Reject non-standard ports (only 443 allowed for HTTPS)
  if (parsed.port !== '' && parsed.port !== '443') {
    return { valid: false, error: 'Webhook URLs must use the default HTTPS port (443)' };
  }

  // Reject URLs with credentials
  if (parsed.username !== '' || parsed.password !== '') {
    return { valid: false, error: 'Webhook URLs cannot contain credentials' };
  }

  return { valid: true };
}
