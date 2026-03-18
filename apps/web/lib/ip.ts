import { NextRequest } from 'next/server';

/** Extract the client IP address from request headers */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    return first ? first.trim() : '0.0.0.0';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '0.0.0.0';
}

/** Extract country from Vercel/Cloudflare geo headers */
export function getCountry(request: NextRequest): string | null {
  return (
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    null
  );
}
