import type { BehavioralSessionData } from './types';

// ── Constants ──────────────────────────────────────────────────────────────
const COOKIE_NAME = 'sb_v';
const COOKIE_EXPIRY_DAYS = 90;
const SESSION_KEY = 'sb_session';

// ── Cookie Helpers ─────────────────────────────────────────────────────────
function generateFingerprint(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCookie(name: string): string | null {
  try {
    const prefix = `${name}=`;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.substring(prefix.length));
      }
    }
    return null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string, days: number): void {
  try {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
  } catch {
    /* cookie write failure is non-blocking */
  }
}

// ── Session Storage Shape ──────────────────────────────────────────────────
interface StoredSession {
  pagesViewed: number;
  pageUrls: string[];
  pricingPageViews: number;
  highIntentPageViews: number;
  startedAt: number;
}

// ── Behavior Tracker ───────────────────────────────────────────────────────
export class BehaviorTracker {
  private fingerprint: string;
  private sessionNumber: number;
  private startedAt: number;
  private pagesViewed: number = 0;
  private pageUrls: string[] = [];
  private maxScrollDepth: number = 0;
  private widgetOpens: number = 0;
  private pricingPageViews: number = 0;
  private highIntentPageViews: number = 0;
  private highIntentPatterns: string[];
  private scrollHandler: (() => void) | null = null;
  private trackingBlocked: boolean = false;

  constructor(
    highIntentPatterns: string[] = ['/pricing', '/demo', '/contact', '/compare']
  ) {
    this.highIntentPatterns = highIntentPatterns;
    this.startedAt = Date.now();

    const existing = getCookie(COOKIE_NAME);
    if (existing) {
      const parts = existing.split(':');
      this.fingerprint = parts[0] ?? generateFingerprint();
      this.sessionNumber = parseInt(parts[1] ?? '0', 10) + 1;
    } else {
      this.fingerprint = generateFingerprint();
      this.sessionNumber = 1;
    }

    setCookie(
      COOKIE_NAME,
      `${this.fingerprint}:${this.sessionNumber}`,
      COOKIE_EXPIRY_DAYS
    );

    // Detect if cookies/storage are blocked
    const cookieCheck = getCookie(COOKIE_NAME);
    this.trackingBlocked = cookieCheck === null;

    this.trackCurrentPage();
    this.startScrollTracking();
  }

  // ── Page Tracking ────────────────────────────────────────────────────
  private trackCurrentPage(): void {
    this.restoreSession();
    this.pagesViewed++;

    const path = window.location.pathname;
    if (!this.pageUrls.includes(path)) {
      this.pageUrls.push(path);
    }
    if (path.includes('/pricing')) {
      this.pricingPageViews++;
    }
    if (this.highIntentPatterns.some((p) => path.includes(p))) {
      this.highIntentPageViews++;
    }

    this.saveSession();
  }

  private restoreSession(): void {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return;
      const data = JSON.parse(stored) as StoredSession;
      this.pagesViewed = data.pagesViewed ?? 0;
      this.pageUrls = data.pageUrls ?? [];
      this.pricingPageViews = data.pricingPageViews ?? 0;
      this.highIntentPageViews = data.highIntentPageViews ?? 0;
      this.startedAt = data.startedAt ?? this.startedAt;
    } catch {
      /* ignore parse errors */
    }
  }

  private saveSession(): void {
    try {
      const session: StoredSession = {
        pagesViewed: this.pagesViewed,
        pageUrls: this.pageUrls,
        pricingPageViews: this.pricingPageViews,
        highIntentPageViews: this.highIntentPageViews,
        startedAt: this.startedAt,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* storage full — non-blocking */
    }
  }

  // ── Scroll Tracking ──────────────────────────────────────────────────
  private startScrollTracking(): void {
    this.scrollHandler = (): void => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = Math.round(
        (window.scrollY / Math.max(1, docHeight)) * 100
      );
      if (scrollPct > this.maxScrollDepth) {
        this.maxScrollDepth = scrollPct;
      }
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  // ── Public API ───────────────────────────────────────────────────────
  recordWidgetOpen(): void {
    this.widgetOpens++;
  }

  getFingerprint(): string {
    return this.fingerprint;
  }

  isTrackingBlocked(): boolean {
    return this.trackingBlocked;
  }

  getSessionData(): BehavioralSessionData {
    const timeOnSite = Math.min(86400, Math.round((Date.now() - this.startedAt) / 1000));
    return {
      pagesViewed: this.pagesViewed,
      pageUrls: [...this.pageUrls],
      timeOnSiteSeconds: timeOnSite,
      maxScrollDepth: this.maxScrollDepth,
      widgetOpens: this.widgetOpens,
      sessionNumber: this.sessionNumber,
      pricingPageViews: this.pricingPageViews,
      highIntentPageViews: this.highIntentPageViews,
    };
  }

  destroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  }
}
