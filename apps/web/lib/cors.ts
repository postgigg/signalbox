import { NextResponse } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
} as const;

/** Apply CORS headers to a NextResponse */
export function withCors(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

/** Build a JSON response with CORS headers */
export function corsJson<T>(body: T, init?: { status?: number }): NextResponse {
  const response = NextResponse.json(body, init);
  return withCors(response);
}

/** Preflight OPTIONS response */
export function corsOptions(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return withCors(response);
}
