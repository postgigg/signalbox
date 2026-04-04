import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - HawkLeads',
};

const EFFECTIVE_DATE = 'March 20, 2026';

export default function PrivacyPage(): React.ReactElement {
  return (
    <div className="bg-white max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-stone">Effective date: {EFFECTIVE_DATE}</p>

      <div className="mt-8 space-y-8 text-sm text-stone leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            This Privacy Policy describes how HawkLeads, a product of Workbird LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), collects, uses, stores, shares,
            and protects information when you use our platform at hawkleads.io, our embeddable widget, our
            APIs, and related services (collectively, the &ldquo;Service&rdquo;). This policy applies to two categories of
            individuals: <span className="font-medium text-ink">Customers</span> (account holders who use
            HawkLeads to collect and manage leads) and <span className="font-medium text-ink">End Users</span>
            (visitors who interact with HawkLeads widgets embedded on Customer websites).
          </p>
        </section>

        {/* 1 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">1. Information We Collect</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">1.1 Customer Information</h3>
          <p>When you create an account and use HawkLeads, we collect:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Account information:</span> email address, password (stored as a bcrypt hash, never plaintext), company name, and timezone</li>
            <li><span className="font-medium text-ink">Billing information:</span> payment details are processed and stored by Stripe. We store only your Stripe customer ID and subscription status. We never have access to full credit card numbers.</li>
            <li><span className="font-medium text-ink">Usage information:</span> login timestamps, feature usage patterns, pages visited within the dashboard, and API request logs</li>
            <li><span className="font-medium text-ink">Support communications:</span> emails and messages exchanged with our support team</li>
          </ul>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">1.2 End User Information</h3>
          <p>When end users interact with HawkLeads widgets embedded on Customer websites, we collect:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Submitted information:</span> name, email address, phone number (optional), free-text message (optional), and qualifying flow answers</li>
            <li><span className="font-medium text-ink">Technical information:</span> IP address (hashed after 30 days), browser user agent, referring page URL, device type, and country (derived from IP)</li>
            <li><span className="font-medium text-ink">Interaction data:</span> widget open/close events, step completion events, and submission timestamps</li>
          </ul>
          <p className="mt-2">
            We do <span className="font-medium text-ink">not</span> use cookies, local storage, or any persistent
            tracking mechanisms in the widget. The widget does not load third-party analytics, advertising pixels,
            or social media trackers.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">1.3 Automatically Collected Information</h3>
          <p>
            For both Customers and End Users, we automatically collect server access logs that include IP addresses,
            request timestamps, request paths, HTTP status codes, and response sizes. These logs are retained for
            30 days and used exclusively for security monitoring and debugging.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">2. How We Use Information</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">2.1 To Provide the Service</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Process and store widget submissions on behalf of Customers</li>
            <li>Calculate lead scores based on qualifying flow answers</li>
            <li>Send email notifications about new leads, follow-up reminders, and account activity</li>
            <li>Deliver webhook payloads to Customer-configured endpoints</li>
            <li>Display analytics and reports within the Customer dashboard</li>
            <li>Process subscription payments through Stripe</li>
          </ul>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">2.2 To Maintain and Improve the Service</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Monitor service performance, uptime, and error rates</li>
            <li>Identify and fix bugs, security vulnerabilities, and performance issues</li>
            <li>Analyze usage patterns (using anonymized, aggregated data only) to inform product decisions</li>
          </ul>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">2.3 To Communicate</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Send transactional emails (account verification, password resets, billing receipts)</li>
            <li>Send product emails you have opted into (weekly digests, trial reminders)</li>
            <li>Respond to support requests</li>
          </ul>
          <p className="mt-2">
            We do not send marketing emails to End Users. We do not sell, rent, or trade email addresses
            for advertising purposes.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">2.4 To Enforce Security</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Rate limit API requests and widget submissions to prevent abuse</li>
            <li>Detect and block bot submissions using timing checks and honeypot fields</li>
            <li>Verify Stripe webhook signatures to prevent fraud</li>
            <li>Hash IP addresses after 30 days to minimize stored personal data</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">3. Information Sharing and Disclosure</h2>
          <p>We do not sell personal data. We share information only in the following circumstances:</p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">3.1 Service Providers</h3>
          <p>We use the following third-party services to operate HawkLeads:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Supabase:</span> database hosting, authentication, and real-time subscriptions (data stored in US-based infrastructure)</li>
            <li><span className="font-medium text-ink">Stripe:</span> payment processing (subject to{' '}
              <Link href="https://stripe.com/privacy" className="text-signal hover:text-signal-hover transition-colors duration-fast" target="_blank" rel="noopener noreferrer">
                Stripe's Privacy Policy
              </Link>)
            </li>
            <li><span className="font-medium text-ink">Resend:</span> transactional email delivery</li>
            <li><span className="font-medium text-ink">Upstash:</span> rate limiting (Redis-based, stores only hashed identifiers and request counts)</li>
            <li><span className="font-medium text-ink">Cloudflare:</span> CDN for widget bundle delivery and DDoS protection</li>
            <li><span className="font-medium text-ink">Netlify:</span> application hosting</li>
          </ul>
          <p className="mt-2">
            Each service provider processes data only as necessary to provide their specific service and is bound
            by their own privacy policies and data processing agreements.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">3.2 Customer Access to End User Data</h3>
          <p>
            End User submissions are accessible to the Customer whose widget collected the data. Customers
            can view, export, and delete submissions through their dashboard or API. HawkLeads acts as a data
            processor on behalf of the Customer (data controller) for End User data.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">3.3 Legal Requirements</h3>
          <p>
            We may disclose information if required to do so by law, court order, or governmental regulation,
            or if we believe in good faith that disclosure is necessary to protect our rights, your safety,
            or the safety of others.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">3.4 Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, or sale of assets, your information may be transferred as
            part of that transaction. We will notify you via email and a prominent notice on our website before
            your information becomes subject to a different privacy policy.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">4. Data Storage, Security, and Retention</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.1 Storage</h3>
          <p>
            All data is stored in Supabase-managed PostgreSQL databases hosted in US-based data centers.
            All data is encrypted at rest (AES-256) and in transit (TLS 1.2+).
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.2 Security Measures</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Row-level security (RLS) on all database tables containing user data</li>
            <li>API keys stored as cryptographic hashes (never plaintext)</li>
            <li>Passwords hashed using bcrypt with salt</li>
            <li>HTTPS enforced on all connections</li>
            <li>CORS restrictions on API endpoints</li>
            <li>Rate limiting on all public endpoints</li>
            <li>Webhook payloads signed with HMAC-SHA256</li>
            <li>No third-party JavaScript in the widget (no tracking, no ads)</li>
            <li>Shadow DOM isolation for the widget to prevent CSS/JS conflicts</li>
          </ul>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.3 Retention</h3>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Account data:</span> retained while the account is active. Deleted permanently upon account deletion.</li>
            <li><span className="font-medium text-ink">Lead submissions:</span> retained while the account is active. Cascade-deleted when the account is deleted.</li>
            <li><span className="font-medium text-ink">IP addresses:</span> raw IP addresses are hashed after 30 days and cannot be reversed.</li>
            <li><span className="font-medium text-ink">Server logs:</span> retained for 30 days, then automatically purged.</li>
            <li><span className="font-medium text-ink">Inactive trial accounts:</span> data retained for 90 days after trial expiration, then permanently deleted.</li>
            <li><span className="font-medium text-ink">Canceled subscriptions:</span> data retained for 90 days after subscription end, then permanently deleted.</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">5. Cookies and Tracking</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">5.1 Dashboard (hawkleads.io)</h3>
          <p>
            The HawkLeads dashboard uses only essential, first-party cookies for authentication and session
            management. These cookies are:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Strictly necessary for the service to function</li>
            <li>Not used for tracking, analytics, or advertising</li>
            <li>Set with HttpOnly, Secure, and SameSite=Lax attributes</li>
          </ul>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">5.2 Widget</h3>
          <p>
            The HawkLeads widget sets a single, first-party cookie (<code className="text-xs bg-surface-alt px-1 py-0.5 rounded">sb_v</code>)
            to track anonymous session behavior such as pages viewed, scroll depth, and return visits. This cookie:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Contains a randomly generated visitor ID (no personally identifiable information)</li>
            <li>Expires after 90 days</li>
            <li>Is set with SameSite=Lax and is scoped to the Customer's domain</li>
            <li>Is not shared with any third parties</li>
            <li>Is used solely to improve lead scoring accuracy for the website operator</li>
          </ul>
          <p className="mt-2">
            The widget does not load any third-party scripts, advertising trackers, or analytics services.
            End User interactions are recorded only as server-side events (widget opens, step completions, submissions).
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">6. Your Rights</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.1 All Users</h3>
          <p>Regardless of your location, you have the right to:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Access:</span> view all personal data we hold about you</li>
            <li><span className="font-medium text-ink">Correction:</span> update or correct inaccurate information</li>
            <li><span className="font-medium text-ink">Deletion:</span> permanently delete your account and all associated data</li>
            <li><span className="font-medium text-ink">Export:</span> request a copy of your data in a machine-readable format</li>
            <li><span className="font-medium text-ink">Opt-out:</span> unsubscribe from non-essential email communications at any time</li>
          </ul>
          <p className="mt-2">
            Customers can exercise most of these rights directly through their account settings. For data
            export requests or other inquiries, contact support@hawkleads.io.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.2 European Economic Area (GDPR)</h3>
          <p>If you are located in the EEA, you have additional rights under the General Data Protection Regulation:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Right to restrict processing:</span> request that we limit how we use your data</li>
            <li><span className="font-medium text-ink">Right to data portability:</span> receive your data in a structured, machine-readable format</li>
            <li><span className="font-medium text-ink">Right to object:</span> object to processing based on legitimate interest</li>
            <li><span className="font-medium text-ink">Right to lodge a complaint:</span> file a complaint with your local data protection authority</li>
          </ul>
          <p className="mt-2">
            Our legal basis for processing Customer data is contractual necessity (performance of the subscription
            agreement). For End User data, the legal basis is the legitimate interest of the Customer in managing
            their leads, with consent obtained by the Customer at the point of collection.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.3 California (CCPA/CPRA)</h3>
          <p>If you are a California resident, you have the right to:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Know what personal information we collect, use, and disclose</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of the sale of personal information (we do not sell personal information)</li>
            <li>Non-discrimination for exercising your privacy rights</li>
          </ul>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.4 End User Rights</h3>
          <p>
            End Users who wish to access, correct, or delete their submitted data should contact the Customer
            (website operator) who collected their data. Customers can manage End User data through the HawkLeads
            dashboard. If an End User cannot reach the Customer, they may contact us at support@hawkleads.io
            and we will assist in locating and processing the request.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">7. International Data Transfers</h2>
          <p>
            HawkLeads is based in the United States. If you access the service from outside the US, your data
            will be transferred to and processed in the United States. We rely on Standard Contractual Clauses
            (SCCs) and our service providers' data transfer mechanisms to ensure appropriate safeguards for
            international data transfers. By using the service, you consent to the transfer of your data to
            the United States.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">8. Children's Privacy (COPPA)</h2>
          <p>
            HawkLeads complies with the Children's Online Privacy Protection Act (COPPA). Our service is not
            directed to individuals under the age of 13 (or the applicable age of digital consent in your
            jurisdiction, such as 16 in certain EU member states under GDPR).
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>We do not knowingly collect, use, or disclose personal information from children under 13</li>
            <li>Customers are strictly prohibited from using HawkLeads to collect data from minors</li>
            <li>Customers must not deploy the widget on websites directed at children</li>
            <li>If we learn that we have inadvertently collected personal information from a child, we will delete it within 48 hours of discovery</li>
          </ul>
          <p className="mt-2">
            If you believe a child has provided personal information through a HawkLeads widget, contact us
            immediately at support@hawkleads.io and we will take prompt action.
          </p>
        </section>

        {/* 8.1 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">9. Healthcare and Regulated Industries</h2>
          <p>
            HawkLeads is not designed for, and must not be used to collect, store, or process protected health
            information (PHI) as defined by the Health Insurance Portability and Accountability Act (HIPAA).
            HawkLeads is not HIPAA compliant and does not sign Business Associate Agreements (BAAs).
          </p>
          <p className="mt-2">
            Customers operating in the healthcare industry or other regulated sectors must ensure that their use
            of HawkLeads does not involve the collection or processing of regulated data categories. It is the
            Customer's responsibility to ensure compliance with applicable industry-specific regulations.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be communicated via
            email to registered Customers at least 30 days before they take effect. The "Effective date" at
            the top of this page will be updated to reflect the date of the most recent revision. Your
            continued use of the service after the effective date constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">11. Contact Us</h2>
          <p>
            For any questions or concerns about this Privacy Policy, your data, or to exercise your rights, contact us at:
          </p>
          <div className="mt-2 p-4 bg-surface rounded-md border border-border text-ink">
            <p className="font-body font-medium">HawkLeads (Workbird LLC)</p>
            <p className="mt-1">Email: support@hawkleads.io</p>
            <p>Website: hawkleads.io</p>
          </div>
          <p className="mt-3">
            For GDPR-related inquiries, you may also contact your local data protection authority. A list of
            EEA data protection authorities is available at{' '}
            <Link
              href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
              className="text-signal hover:text-signal-hover transition-colors duration-fast"
              target="_blank"
              rel="noopener noreferrer"
            >
              edpb.europa.eu
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
