import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - HawkLeads',
  description: 'Learn how HawkLeads uses cookies on the dashboard and embeddable widget.',
};

const EFFECTIVE_DATE = 'March 29, 2026';

export default function CookiePolicyPage(): React.ReactElement {
  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Cookie Policy</h1>
      <p className="mt-2 text-sm text-stone">Effective date: {EFFECTIVE_DATE}</p>

      <div className="mt-8 space-y-8 text-sm text-stone leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            This Cookie Policy explains how HawkLeads, a product of Workbird LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
            or &ldquo;our&rdquo;), uses cookies and similar technologies on the HawkLeads dashboard at hawkleads.io
            and through the HawkLeads embeddable widget. This policy should be read alongside our{' '}
            <Link href="/privacy" className="text-signal hover:text-signal-hover transition-colors duration-fast">
              Privacy Policy
            </Link>.
          </p>
        </section>

        {/* 1 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">1. What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device by your web browser when you visit a website.
            They allow the site to remember information about your visit, such as your login session or preferences.
            Cookies can be &ldquo;first-party&rdquo; (set by the site you are visiting) or &ldquo;third-party&rdquo;
            (set by a different domain). They can also be &ldquo;session&rdquo; cookies (deleted when you close your
            browser) or &ldquo;persistent&rdquo; cookies (remain until they expire or you delete them).
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">2. Our Approach</h2>
          <p>
            HawkLeads uses a minimal, privacy-first approach to cookies. We use only cookies that are strictly
            necessary for the service to function or that directly improve the experience for website operators.
            We do not use advertising cookies, third-party tracking pixels, social media trackers, or analytics
            cookies from external providers.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">3. Cookies on the Dashboard (hawkleads.io)</h2>
          <p>
            When you log in to the HawkLeads dashboard, we set the following cookies:
          </p>

          {/* Cookie table */}
          <div className="mt-4 border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt">
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Cookie</th>
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Purpose</th>
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Duration</th>
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b border-border font-mono text-xs">sb-access-token</td>
                  <td className="px-4 py-2 border-b border-border">Stores your authentication session token so you stay logged in.</td>
                  <td className="px-4 py-2 border-b border-border">Session</td>
                  <td className="px-4 py-2 border-b border-border">Essential</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b border-border font-mono text-xs">sb-refresh-token</td>
                  <td className="px-4 py-2 border-b border-border">Used to refresh your session without requiring you to log in again.</td>
                  <td className="px-4 py-2 border-b border-border">7 days</td>
                  <td className="px-4 py-2 border-b border-border">Essential</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">sb-auth-token</td>
                  <td className="px-4 py-2">Manages authentication state during login and callback flows.</td>
                  <td className="px-4 py-2">Session</td>
                  <td className="px-4 py-2">Essential</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4">All dashboard cookies are:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>First-party (set by hawkleads.io only)</li>
            <li>Strictly necessary for the service to function</li>
            <li>Set with <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">HttpOnly</code>, <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">Secure</code>, and <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">SameSite=Lax</code> attributes</li>
            <li>Not used for tracking, profiling, or advertising</li>
          </ul>
          <p className="mt-2">
            Because these cookies are strictly necessary for authentication, they are exempt from consent
            requirements under the ePrivacy Directive and similar regulations. The dashboard cannot function
            without them.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">4. Cookies in the Widget</h2>
          <p>
            When a visitor interacts with a HawkLeads widget embedded on a Customer's website, the widget may
            set the following cookie:
          </p>

          <div className="mt-4 border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt">
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Cookie</th>
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Purpose</th>
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Duration</th>
                  <th className="text-left px-4 py-2 font-semibold text-ink border-b border-border">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">sb_v</td>
                  <td className="px-4 py-2">
                    Stores a randomly generated visitor ID to track anonymous session behavior
                    (pages viewed, scroll depth, return visits) for lead scoring.
                  </td>
                  <td className="px-4 py-2">90 days</td>
                  <td className="px-4 py-2">Functional</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4">The widget cookie:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Is first-party (scoped to the Customer's domain, not hawkleads.io)</li>
            <li>Contains only a random identifier, no personally identifiable information</li>
            <li>Is set with <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">SameSite=Lax</code></li>
            <li>Is not shared with any third parties</li>
            <li>Is used solely to improve lead scoring accuracy for the website operator</li>
          </ul>
          <p className="mt-2">
            The widget does not load any third-party scripts, advertising trackers, analytics services, or social
            media pixels. No third-party cookies are ever set by the widget.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">5. Cookies We Do Not Use</h2>
          <p>For clarity, HawkLeads does not use:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Advertising or targeting cookies:</span> we do not serve ads or build user profiles for ad targeting</li>
            <li><span className="font-medium text-ink">Third-party analytics cookies:</span> we do not use Google Analytics, Mixpanel, Hotjar, or similar tools</li>
            <li><span className="font-medium text-ink">Social media cookies:</span> we do not embed Facebook, Twitter, LinkedIn, or other social media trackers</li>
            <li><span className="font-medium text-ink">Cross-site tracking cookies:</span> our cookies do not track you across different websites</li>
            <li><span className="font-medium text-ink">Fingerprinting:</span> we do not use browser fingerprinting techniques</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">6. Managing Cookies</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.1 Browser Settings</h3>
          <p>
            You can control and delete cookies through your browser settings. Most browsers allow you to block
            all cookies, block only third-party cookies, or clear existing cookies. Note that blocking essential
            cookies will prevent you from logging in to the HawkLeads dashboard.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.2 Widget Cookie</h3>
          <p>
            If you are a website visitor and wish to remove the <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">sb_v</code> cookie,
            you can delete it through your browser's cookie settings for the specific website where you encountered
            the widget. The widget will continue to function without the cookie, but lead scoring for the website
            operator may be less accurate.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.3 For Website Operators (Customers)</h3>
          <p>
            If you embed a HawkLeads widget on your website, you are responsible for disclosing the use of
            the <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">sb_v</code> cookie in your own cookie
            policy or consent banner, as required by applicable law (such as the ePrivacy Directive, GDPR, or CCPA).
            You should inform your visitors that this cookie is set for lead scoring purposes and is scoped to your domain.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">7. Legal Basis</h2>
          <p>
            Our use of cookies is based on the following legal grounds:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>
              <span className="font-medium text-ink">Essential cookies (dashboard):</span> these are strictly
              necessary for the service you have requested and are exempt from consent requirements under the ePrivacy
              Directive (Article 5(3)) and similar regulations.
            </li>
            <li>
              <span className="font-medium text-ink">Functional cookie (widget):</span> the <code className="text-xs bg-surface-alt px-1 py-0.5 rounded">sb_v</code> cookie
              serves the legitimate interest of the Customer (website operator) in understanding visitor behavior
              to improve lead qualification. Website operators are responsible for obtaining any required consent
              from their visitors under applicable law.
            </li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or applicable
            law. Material changes will be communicated via email to registered Customers at least 30 days before
            they take effect. The &ldquo;Effective date&rdquo; at the top of this page will be updated accordingly.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">9. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, contact us at:
          </p>
          <div className="mt-2 p-4 bg-surface rounded-md border border-border text-ink">
            <p className="font-body font-medium">HawkLeads (Workbird LLC)</p>
            <p className="mt-1">Email: support@hawkleads.io</p>
            <p>Website: hawkleads.io</p>
          </div>
        </section>
      </div>
    </div>
  );
}
