import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/client';
import { generateAuditPdf } from '@/lib/audit-pdf';
import { checkRateLimit, rateLimitHeaders, auditLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/ip';
import { APP_URL } from '@/lib/constants';

export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 10000;
const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB cap

const QUALIFICATION_KEYWORDS = [
  'budget',
  'timeline',
  'project type',
  'service type',
  'industry',
  'revenue',
  'company size',
  'employees',
  'how did you hear',
  'when do you need',
  'how soon',
  'annual revenue',
  'monthly budget',
  'project scope',
  'number of employees',
] as const;

const CONTACT_PATHS = ['', '/contact', '/contact-us', '/get-in-touch', '/get-started'] as const;

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const AuditRequestSchema = z.object({
  email: z.string().email().max(320).toLowerCase(),
  url: z
    .string()
    .min(1)
    .max(2000)
    .url()
    .refine((val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must use HTTPS')
    .refine((val) => {
      try {
        const parsed = new URL(val);
        const hostname = parsed.hostname.toLowerCase();
        // Block localhost and private IPs
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
          return false;
        }
        // Block private IP ranges
        const parts = hostname.split('.');
        if (parts.length === 4) {
          const first = parseInt(parts[0] ?? '0', 10);
          const second = parseInt(parts[1] ?? '0', 10);
          if (first === 10) return false;
          if (first === 172 && second >= 16 && second <= 31) return false;
          if (first === 192 && second === 168) return false;
        }
        return true;
      } catch {
        return false;
      }
    }, 'Private/localhost URLs are not allowed'),
});

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface AuditScores {
  qualification: number;
  speed: number;
  routing: number;
  overall: number;
}

interface AuditDetails {
  formCount: number;
  inputCount: number;
  hasSelect: boolean;
  hasRadio: boolean;
  hasPhoneLink: boolean;
  hasMailtoAction: boolean;
  hasFormHandler: boolean;
  hasHawkLeads: boolean;
  qualificationKeywordsFound: string[];
  pagesChecked: string[];
  findings: string[];
}

// ---------------------------------------------------------------------------
// HTML analysis helpers
// ---------------------------------------------------------------------------

function countMatches(html: string, pattern: RegExp): number {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

function detectHawkLeads(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  // Check for HawkLeads widget script, config, or branding
  if (lowerHtml.includes('hawkleads')) return true;
  if (lowerHtml.includes('hawkleadsconfig')) return true;
  if (lowerHtml.includes('hawkleads.io')) return true;
  if (lowerHtml.includes('sb.js') && lowerHtml.includes('hawkleads')) return true;
  // Check for widget CDN
  if (lowerHtml.includes('cdn.hawkleads.io')) return true;
  return false;
}

function analyzeHtml(html: string): {
  formCount: number;
  inputCount: number;
  hasSelect: boolean;
  hasRadio: boolean;
  hasPhoneLink: boolean;
  hasMailtoAction: boolean;
  hasFormHandler: boolean;
  hasHawkLeads: boolean;
  qualificationKeywordsFound: string[];
} {
  const lowerHtml = html.toLowerCase();
  const formCount = countMatches(lowerHtml, /<form[\s>]/g);
  const inputCount = countMatches(lowerHtml, /<input[\s>]/g);
  const hasSelect = lowerHtml.includes('<select');
  const hasRadio = lowerHtml.includes('type="radio"') || lowerHtml.includes("type='radio'");
  const hasPhoneLink = lowerHtml.includes('tel:');
  const hasMailtoAction = /<form[^>]*action\s*=\s*["']mailto:/i.test(html);
  const hasFormHandler =
    /<form[^>]*action\s*=\s*["'][^"']*["']/i.test(html) && !hasMailtoAction;
  const hasHawkLeads = detectHawkLeads(html);

  const qualificationKeywordsFound: string[] = [];
  for (const keyword of QUALIFICATION_KEYWORDS) {
    if (lowerHtml.includes(keyword)) {
      qualificationKeywordsFound.push(keyword);
    }
  }

  return {
    formCount,
    inputCount,
    hasSelect,
    hasRadio,
    hasPhoneLink,
    hasMailtoAction,
    hasFormHandler,
    hasHawkLeads,
    qualificationKeywordsFound,
  };
}

function scoreQualification(details: AuditDetails): number {
  let score = 0;

  // Has at least one form
  if (details.formCount > 0) score += 15;

  // Number of input fields (more fields = more qualification, up to a point)
  if (details.inputCount >= 6) score += 20;
  else if (details.inputCount >= 4) score += 15;
  else if (details.inputCount >= 2) score += 10;
  else if (details.inputCount >= 1) score += 5;

  // Structured inputs (select, radio)
  if (details.hasSelect) score += 15;
  if (details.hasRadio) score += 10;

  // Qualification keywords
  const keywordScore = Math.min(details.qualificationKeywordsFound.length * 10, 40);
  score += keywordScore;

  return Math.min(score, 100);
}

function scoreSpeed(details: AuditDetails): number {
  let score = 0;

  // Has a proper form handler (not mailto)
  if (details.hasFormHandler) score += 40;
  else if (details.hasMailtoAction) score += 10;
  else if (details.formCount > 0) score += 20; // form exists but no clear action

  // No phone-only reliance
  if (!details.hasPhoneLink) score += 20;
  else if (details.formCount > 0) score += 10; // has form AND phone

  // Having a form at all means some speed capability
  if (details.formCount > 0) score += 20;

  // Multiple input fields suggest structured data capture
  if (details.inputCount >= 3) score += 20;
  else if (details.inputCount >= 1) score += 10;

  return Math.min(score, 100);
}

function scoreRouting(details: AuditDetails): number {
  let score = 0;

  // Structured qualification inputs suggest routing potential
  if (details.hasSelect) score += 20;
  if (details.hasRadio) score += 15;

  // Qualification keywords suggest segmentation potential
  if (details.qualificationKeywordsFound.length >= 3) score += 25;
  else if (details.qualificationKeywordsFound.length >= 1) score += 10;

  // Multiple forms may indicate some routing
  if (details.formCount >= 2) score += 15;

  // Budget/timeline keywords specifically suggest routing
  const routingKeywords = details.qualificationKeywordsFound.filter(
    (k) => k === 'budget' || k === 'timeline' || k === 'service type' || k === 'industry'
  );
  if (routingKeywords.length >= 2) score += 25;

  return Math.min(score, 100);
}

function generateFindings(details: AuditDetails): string[] {
  const findings: string[] = [];

  if (details.formCount === 0) {
    findings.push('No contact forms found on your site. Visitors have no way to submit their information.');
  }

  if (details.formCount > 0 && details.inputCount <= 2) {
    findings.push('Your form only collects basic information. You are missing qualification data like budget, timeline, or project type.');
  }

  if (details.hasMailtoAction) {
    findings.push('Your form uses a mailto: action. Submissions open the visitor\'s email client instead of being captured directly.');
  }

  if (!details.hasFormHandler && details.formCount > 0) {
    findings.push('Your form may not have a proper submission handler. Leads could be lost.');
  }

  if (details.hasPhoneLink && details.formCount === 0) {
    findings.push('You rely on phone calls for lead capture. Visitors who prefer to write will leave without converting.');
  }

  if (!details.hasSelect && !details.hasRadio) {
    findings.push('No structured qualification inputs (dropdowns, radio buttons). You cannot automatically score or route leads.');
  }

  if (details.qualificationKeywordsFound.length === 0) {
    findings.push('No qualification questions detected. Every lead looks the same, making prioritization impossible.');
  }

  if (details.qualificationKeywordsFound.length > 0 && details.qualificationKeywordsFound.length < 3) {
    findings.push(`Only ${String(details.qualificationKeywordsFound.length)} qualification signal(s) found. Adding budget and timeline questions would improve lead scoring.`);
  }

  if (details.formCount > 0 && details.qualificationKeywordsFound.length >= 3 && details.hasSelect) {
    findings.push('Your form has good qualification coverage. Automated scoring and routing would help you act on this data faster.');
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Fetch page HTML safely
// ---------------------------------------------------------------------------

async function fetchPageHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HawkLeads-Audit/1.0 (+https://hawkleads.io/audit)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) return null;

    const text = await response.text();
    return text.slice(0, MAX_HTML_BYTES);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit
  const ip = getClientIp(request);
  const limiter = auditLimit();
  const rlResult = await checkRateLimit(limiter, ip);
  if (!rlResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in a few minutes.' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 2. Parse + validate
  const body: unknown = await request.json().catch(() => null);
  const parsed = AuditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid URL', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const targetUrl = parsed.data.url;
  const email = parsed.data.email;
  let baseUrl: URL;
  try {
    baseUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  const domain = baseUrl.hostname;

  // 3. Fetch pages
  const pagesChecked: string[] = [];
  let combinedHtml = '';

  for (const path of CONTACT_PATHS) {
    const pageUrl = `${baseUrl.origin}${path}`;
    const html = await fetchPageHtml(pageUrl);
    if (html) {
      combinedHtml += html;
      pagesChecked.push(pageUrl);
    }
  }

  if (combinedHtml.length === 0) {
    return NextResponse.json(
      { error: 'Could not fetch the website. Make sure the URL is correct and the site is publicly accessible.' },
      { status: 422 }
    );
  }

  // 4. Analyze
  const analysis = analyzeHtml(combinedHtml);
  const details: AuditDetails = {
    ...analysis,
    pagesChecked,
    findings: [],
  };

  // 5. Score — if HawkLeads widget detected, perfect score
  let scores: AuditScores;

  if (details.hasHawkLeads) {
    scores = { qualification: 100, speed: 100, routing: 100, overall: 100 };
    details.findings = [
      'This site uses HawkLeads. Lead qualification, scoring, and routing are fully automated.',
    ];
  } else {
    scores = {
      qualification: scoreQualification(details),
      speed: scoreSpeed(details),
      routing: scoreRouting(details),
      overall: 0,
    };
    scores.overall = Math.round(
      (scores.qualification * 0.4) + (scores.speed * 0.3) + (scores.routing * 0.3)
    );
    details.findings = generateFindings(details);
  }

  // 7. Store in database
  const db = createAdminClient();
  const { data: audit, error: dbError } = await db
    .from('audits')
    .insert({
      email,
      url: targetUrl,
      domain,
      scores: scores as unknown as Record<string, unknown>,
      details: details as unknown as Record<string, unknown>,
    })
    .select('id')
    .single();

  // Generate a fallback ID if DB insert fails (table may not exist yet)
  const auditId = (dbError || !audit)
    ? crypto.randomUUID()
    : (audit.id as string);

  // 8. Send report email (fire-and-forget)
  void sendAuditReportEmail(email, domain, scores, details, auditId).catch(() => {
    // Email failure is non-blocking
  });

  // 9. Return result
  return NextResponse.json({
    id: auditId,
    url: targetUrl,
    domain,
    scores,
    details,
  });
}

// ---------------------------------------------------------------------------
// Audit report email
// ---------------------------------------------------------------------------

function scoreColorHex(score: number): string {
  if (score >= 70) return '#16A34A';
  if (score >= 40) return '#CA8A04';
  return '#DC2626';
}

function scoreTierLabel(score: number): string {
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

function buildAuditEmailHtml(
  domain: string,
  scores: AuditScores,
  details: AuditDetails,
  auditId: string
): string {
  const overallColor = scoreColorHex(scores.overall);
  const shareUrl = `${APP_URL}/audit/${auditId}`;

  const findingsHtml = details.findings
    .map((f) => `<tr><td style="padding:6px 0;font-size:14px;color:#64748B;line-height:1.5;">&#9888; ${f}</td></tr>`)
    .join('');

  const categoryRow = (label: string, score: number): string => {
    const color = scoreColorHex(score);
    const tier = scoreTierLabel(score);
    return `
      <td style="padding:12px 16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#64748B;font-family:sans-serif;">${label}</p>
        <p style="margin:0;font-size:32px;font-weight:700;color:${color};font-family:Georgia,serif;">${String(score)}</p>
        <p style="margin:4px 0 0;font-size:11px;color:${color};font-family:sans-serif;">${tier}</p>
      </td>
    `;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Instrument Sans',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0F172A;padding:40px 32px;text-align:center;border-radius:8px 8px 0 0;">
          <p style="margin:0 0 8px;font-size:13px;color:#94A3B8;font-family:sans-serif;">Lead Capture Audit Report</p>
          <h1 style="margin:0;font-size:28px;font-weight:600;color:#FFFFFF;font-family:Georgia,serif;">${domain}</h1>
          <div style="margin:24px auto 16px;width:100px;height:100px;border-radius:50%;border:4px solid ${overallColor};display:flex;align-items:center;justify-content:center;">
            <table cellpadding="0" cellspacing="0"><tr><td style="text-align:center;">
              <p style="margin:0;font-size:40px;font-weight:700;color:${overallColor};font-family:Georgia,serif;">${String(scores.overall)}</p>
              <p style="margin:0;font-size:12px;color:#94A3B8;font-family:sans-serif;">/100</p>
            </td></tr></table>
          </div>
        </td></tr>

        <!-- Category scores -->
        <tr><td style="background:#FFFFFF;padding:24px 16px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${categoryRow('Qualification', scores.qualification)}
              ${categoryRow('Speed', scores.speed)}
              ${categoryRow('Routing', scores.routing)}
            </tr>
          </table>
        </td></tr>

        <!-- Findings -->
        ${details.findings.length > 0 ? `
        <tr><td style="background:#FFFFFF;padding:24px 32px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;border-top:1px solid #E2E8F0;">
          <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#0F172A;font-family:Georgia,serif;">What we found</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${findingsHtml}
          </table>
        </td></tr>
        ` : ''}

        <!-- Stats -->
        <tr><td style="background:#FFFFFF;padding:24px 16px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;border-top:1px solid #E2E8F0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center;padding:8px;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">${String(details.formCount)}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#64748B;font-family:sans-serif;">Forms</p>
              </td>
              <td style="text-align:center;padding:8px;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">${String(details.inputCount)}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#64748B;font-family:sans-serif;">Fields</p>
              </td>
              <td style="text-align:center;padding:8px;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">${String(details.qualificationKeywordsFound.length)}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#64748B;font-family:sans-serif;">Signals</p>
              </td>
              <td style="text-align:center;padding:8px;">
                <p style="margin:0;font-size:28px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">${String(details.pagesChecked.length)}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#64748B;font-family:sans-serif;">Pages</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background:#FFFFFF;padding:32px;text-align:center;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;border-top:1px solid #E2E8F0;border-radius:0 0 8px 8px;border-bottom:1px solid #E2E8F0;">
          <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#0F172A;font-family:Georgia,serif;">Fix this in 2 minutes.</h2>
          <p style="margin:0 0 20px;font-size:14px;color:#64748B;font-family:sans-serif;line-height:1.5;">
            Add a HawkLeads widget to your site. Qualify, score, and route every lead automatically.
          </p>
          <a href="https://hawkleads.io/signup" style="display:inline-block;background:#0F172A;color:#FFFFFF;font-size:14px;font-weight:500;padding:12px 28px;border-radius:6px;text-decoration:none;font-family:sans-serif;">
            Start Free Trial
          </a>
          <p style="margin:16px 0 0;font-size:12px;">
            <a href="${shareUrl}" style="color:#2563EB;text-decoration:underline;font-family:sans-serif;">View full report online</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#94A3B8;font-family:sans-serif;">
            HawkLeads (Workbird LLC) &middot; hawkleads.io
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAuditEmailText(
  domain: string,
  scores: AuditScores,
  details: AuditDetails,
  auditId: string
): string {
  const shareUrl = `${APP_URL}/audit/${auditId}`;
  const findings = details.findings.map((f) => `- ${f}`).join('\n');

  return `Lead Capture Audit Report: ${domain}

Overall Score: ${String(scores.overall)}/100
Qualification: ${String(scores.qualification)}/100
Speed: ${String(scores.speed)}/100
Routing: ${String(scores.routing)}/100

Forms found: ${String(details.formCount)}
Input fields: ${String(details.inputCount)}
Qualification signals: ${String(details.qualificationKeywordsFound.length)}
Pages analyzed: ${String(details.pagesChecked.length)}

${findings ? `Findings:\n${findings}\n` : ''}
View full report: ${shareUrl}

Fix this in 2 minutes: https://hawkleads.io/signup

HawkLeads (Workbird LLC) - hawkleads.io`;
}

async function sendAuditReportEmail(
  recipientEmail: string,
  domain: string,
  scores: AuditScores,
  details: AuditDetails,
  auditId: string
): Promise<void> {
  const subject = `Your lead capture score: ${String(scores.overall)}/100 for ${domain}`;
  const html = buildAuditEmailHtml(domain, scores, details, auditId);
  const text = buildAuditEmailText(domain, scores, details, auditId);

  // Generate PDF report
  const pdfBuffer = generateAuditPdf(domain, scores, details, auditId);

  await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
    attachments: [
      {
        filename: `hawkleads-audit-${domain}.pdf`,
        content: pdfBuffer,
      },
    ],
    tags: [
      { name: 'type', value: 'audit-report' },
      { name: 'domain', value: domain },
    ],
  });
}
