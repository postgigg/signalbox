import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - HawkLeads',
};

const EFFECTIVE_DATE = 'March 20, 2026';

export default function TermsPage(): React.ReactElement {
  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Terms of Service</h1>
      <p className="mt-2 text-sm text-stone">Effective date: {EFFECTIVE_DATE}</p>

      <div className="mt-8 space-y-8 text-sm text-stone leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">1. Agreement to Terms</h2>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("Customer," "you," or "your")
            and Workbird LLC, doing business as HawkLeads ("we," "us," or "our"). By creating an account, accessing, or using the HawkLeads platform
            at hawkleads.io or any associated services, you agree to be bound by these Terms. If you are accepting
            these Terms on behalf of an organization, you represent and warrant that you have the authority to bind
            that organization. If you do not agree, you must not use the service.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">2. Description of Service</h2>
          <p>
            HawkLeads is a software-as-a-service ("SaaS") platform that provides an embeddable contact widget with
            multi-step qualifying flows and automated lead scoring. The service includes:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>A configurable, embeddable widget for customer websites</li>
            <li>A dashboard for managing leads, widgets, flows, and analytics</li>
            <li>Automated lead scoring based on qualifying answers</li>
            <li>Email notifications for new leads and follow-up reminders</li>
            <li>API access for programmatic lead management (Pro and Agency plans)</li>
            <li>Webhook integrations for third-party systems (Pro and Agency plans)</li>
          </ul>
          <p className="mt-2">
            We reserve the right to modify, suspend, or discontinue any part of the service at any time with
            30 days prior notice for material changes. Routine updates, bug fixes, and minor feature changes
            may be made without notice.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">3. Account Registration and Security</h2>
          <p>
            To use HawkLeads, you must create an account with a valid email address and a password of at least
            8 characters. You agree to:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Provide accurate, current, and complete registration information</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Immediately notify us of any unauthorized access or breach at support@hawkleads.io</li>
            <li>Accept responsibility for all activity that occurs under your account</li>
          </ul>
          <p className="mt-2">
            We reserve the right to suspend or terminate accounts if we have reason to believe the registration
            information is inaccurate, or if the account is being used in violation of these Terms. You may not
            share, transfer, or sell access to your account.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">4. Plans, Pricing, and Billing</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.1 Plans</h3>
          <p>
            HawkLeads offers the following subscription plans:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li><span className="font-medium text-ink">Trial:</span> 14-day free trial with access to Starter-level features and a 50-submission limit. No credit card required.</li>
            <li><span className="font-medium text-ink">Starter ($99/month):</span> 1 widget, 500 submissions/month, 3 team members, webhook integrations.</li>
            <li><span className="font-medium text-ink">Pro ($149/month):</span> 5 widgets, 2,000 submissions/month, 10 team members, API access, webhooks, custom branding, lead routing rules, A/B testing.</li>
            <li><span className="font-medium text-ink">Agency ($249/month):</span> 25 widgets, unlimited submissions, 25 team members, full API and webhook access, shared analytics links, priority support, white-label options.</li>
          </ul>
          <p className="mt-2">
            Annual billing is available at a 17% discount. All prices are in US Dollars. We reserve the right
            to change pricing with 30 days written notice. Existing subscriptions will honor current pricing
            through the end of the current billing period.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.2 Billing</h3>
          <p>
            All payments are processed through Stripe. By subscribing to a paid plan, you authorize us to charge
            the payment method on file on a recurring basis (monthly or annually, depending on your selection).
            Billing occurs at the start of each billing period. All fees are non-prorated unless you are upgrading
            mid-cycle, in which case you will be charged a prorated amount for the remainder of the current period.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.3 Free Trial</h3>
          <p>
            New accounts receive a 14-day free trial with no credit card required. At the end of the trial period,
            if you have not selected a paid plan, your widgets will stop accepting new submissions and display a
            fallback contact message. Your data will be retained for 90 days after trial expiration, during which
            you can activate a paid plan to regain full access. After 90 days, data from inactive trial accounts
            may be permanently deleted.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.4 Upgrades and Downgrades</h3>
          <p>
            You may upgrade your plan at any time. Upgrades take effect immediately and you will be charged a
            prorated amount for the remainder of the current billing period. Downgrades take effect at the start
            of the next billing period. If your downgrade results in exceeding plan limits (e.g., more active
            widgets than the new plan allows), you must deactivate excess resources before the downgrade takes effect.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.5 Refund Policy</h3>
          <p>
            All subscriptions are billed in advance and are non-refundable. When you cancel, your access continues
            through the end of the current billing period. We do not provide partial refunds for unused time within
            a billing period. In exceptional circumstances (e.g., billing errors, extended service outages exceeding
            24 hours), we may issue credits or refunds at our sole discretion. To request a review, contact
            support@hawkleads.io within 14 days of the charge in question.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.6 Failed Payments</h3>
          <p>
            If a payment fails, we will attempt to collect the payment up to 3 additional times over a 14-day period.
            During this time, your account will be marked as "past due" but service will continue. If payment is not
            received after all retry attempts, your account will be downgraded to an inactive state and widgets will
            stop accepting submissions. Service is restored immediately upon successful payment.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">4.7 Taxes</h3>
          <p>
            All prices are exclusive of applicable taxes. You are responsible for all taxes, levies, or duties
            imposed by taxing authorities, and you shall be responsible for payment of all such taxes. Where required
            by law, we will collect and remit sales tax on your behalf.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">5. Acceptable Use</h2>
          <p>You agree not to use HawkLeads to:</p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Collect personal information from individuals under the age of 13 (or the applicable age of consent in your jurisdiction)</li>
            <li>Send unsolicited commercial communications (spam) using data collected through the widget</li>
            <li>Collect sensitive personal data (financial, biometric, racial/ethnic data) without explicit consent and appropriate safeguards</li>
            <li>Use the service for processing protected health information (PHI) or any purpose requiring HIPAA compliance</li>
            <li>Engage in phishing, social engineering, or deceptive practices</li>
            <li>Violate any applicable local, state, national, or international law or regulation</li>
            <li>Interfere with or disrupt the service, servers, or networks connected to the service</li>
            <li>Attempt to gain unauthorized access to any part of the service or any systems or networks connected to the service</li>
            <li>Reverse engineer, decompile, or disassemble the service or widget code</li>
            <li>Resell, sublicense, or redistribute the service without prior written consent</li>
            <li>Use the service in any manner that could damage, disable, overburden, or impair HawkLeads infrastructure</li>
          </ul>
          <p className="mt-2">
            Violation of these acceptable use terms may result in immediate suspension or termination of your
            account without notice. We reserve the right to investigate and take appropriate legal action against
            anyone who, in our sole discretion, violates these provisions.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">6. Data Ownership and Licensing</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.1 Your Data</h3>
          <p>
            You retain all rights to the data you submit to or collect through HawkLeads ("Customer Data"),
            including all lead submissions, widget configurations, and account information. We claim no ownership
            over Customer Data. Upon account deletion, all Customer Data is permanently and irrecoverably removed.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.2 License to Us</h3>
          <p>
            You grant us a limited, non-exclusive, worldwide license to use, process, and store Customer Data
            solely for the purpose of providing and improving the service. This license terminates when you delete
            your account or remove the relevant data.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.3 Our Intellectual Property</h3>
          <p>
            The HawkLeads platform, including the dashboard, widget code, scoring algorithms, APIs, documentation,
            and all related intellectual property, remains the exclusive property of HawkLeads. These Terms do not
            grant you any right, title, or interest in our intellectual property except for the limited right to
            use the service as described herein.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">6.4 Aggregated Data</h3>
          <p>
            We may use anonymized, aggregated data (that cannot be used to identify you or your end users) for
            analytics, benchmarking, and service improvement. This data will never be sold to third parties or
            used for advertising purposes.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">7. Data Processing and Compliance</h2>
          <p>
            You acknowledge that by using HawkLeads, you act as a data controller for the personal data
            collected through your widgets, and HawkLeads acts as a data processor. You are responsible for:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Obtaining all necessary consents from end users before collecting their data</li>
            <li>Providing appropriate privacy notices on your website where the widget is embedded</li>
            <li>Complying with all applicable data protection laws (including GDPR, CCPA, PIPEDA, and others as relevant to your jurisdiction)</li>
            <li>Responding to data subject access requests related to data collected through your widgets</li>
          </ul>
          <p className="mt-2">
            We will process Customer Data in accordance with our{' '}
            <Link href="/privacy" className="text-signal hover:text-signal-hover transition-colors duration-fast">
              Privacy Policy
            </Link>{' '}
            and applicable data protection laws. For GDPR-covered data, a Data Processing Agreement (DPA) is
            available upon request at support@hawkleads.io.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">8. API and Widget Usage</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">8.1 API Access</h3>
          <p>
            API access is available on Pro and Agency plans. API keys are issued per account and must be kept
            confidential. You are responsible for all API activity conducted with your keys. API requests are
            rate-limited to prevent abuse. We reserve the right to revoke API keys that are used in violation
            of these Terms or that generate excessive load.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">8.2 Widget Embedding</h3>
          <p>
            The HawkLeads widget may be embedded on websites you own or have authorization to modify. You may not
            embed the widget on websites you do not control or have permission to modify. The widget must not be
            modified, obfuscated, or used in a manner that misrepresents its origin or purpose.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">8.3 Rate Limits</h3>
          <p>
            The service enforces rate limits on API requests, widget submissions, and authentication attempts.
            Current rate limits are documented in our API documentation. Exceeding rate limits will result in
            temporary request rejection (HTTP 429). Persistent abuse may lead to account suspension.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">9. Service Availability and Support</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">9.1 Uptime</h3>
          <p>
            We target 99.9% uptime for the HawkLeads platform, measured on a monthly basis, excluding scheduled
            maintenance windows. Scheduled maintenance will be communicated at least 24 hours in advance.
            We do not offer formal SLAs at this time. For custom SLA arrangements, contact us about enterprise plans.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">9.2 Support</h3>
          <p>
            Support is provided via email at support@hawkleads.io. All plans receive standard support with a target
            response time of one business day. Agency plans receive priority support with a target response time
            of 4 business hours during US Eastern business hours (9:00 AM to 6:00 PM ET, Monday through Friday).
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">10. Cancellation and Termination</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">10.1 Cancellation by You</h3>
          <p>
            You may cancel your subscription at any time from the billing settings in your dashboard or through
            the Stripe billing portal. Upon cancellation:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Your access continues through the end of the current billing period</li>
            <li>No further charges will be made</li>
            <li>Your widgets will stop accepting submissions at the end of the billing period</li>
            <li>Your data will be retained for 90 days after the subscription ends</li>
            <li>After 90 days, all account data will be permanently deleted</li>
          </ul>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">10.2 Account Deletion</h3>
          <p>
            You may permanently delete your account at any time from your account settings. Account deletion is
            immediate and irreversible. All associated data, including leads, widgets, analytics, and team member
            records, will be permanently removed. Active subscriptions will be canceled and no refund will be
            issued for the remaining period.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">10.3 Termination by Us</h3>
          <p>
            We may suspend or terminate your account immediately and without notice if:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>You violate these Terms of Service</li>
            <li>Your account is used for illegal activity</li>
            <li>You fail to pay outstanding fees after all retry attempts</li>
            <li>We are required to do so by law</li>
          </ul>
          <p className="mt-2">
            If we terminate your account due to our decision to discontinue the service, we will provide 30 days
            notice and a prorated refund for any prepaid, unused portion of your subscription.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">11. Warranties and Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
            OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
            ERROR-FREE, OR COMPLETELY SECURE. WE DO NOT WARRANT THAT ANY DEFECTS WILL BE CORRECTED, OR THAT
            THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
          <p className="mt-2">
            YOU ACKNOWLEDGE THAT LEAD SCORING IS AN AUTOMATED ESTIMATE AND SHOULD NOT BE THE SOLE BASIS FOR
            BUSINESS DECISIONS. HAWKLEADS DOES NOT GUARANTEE THE ACCURACY OF LEAD SCORES OR THE QUALITY OF
            LEADS SUBMITTED THROUGH WIDGETS.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL HAWKLEADS, ITS DIRECTORS,
            EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA,
            USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Your access to, use of, or inability to access or use the service</li>
            <li>Any conduct or content of any third party on the service</li>
            <li>Any content obtained from the service</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>
          <p className="mt-2">
            OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE
            SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT
            GIVING RISE TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">13. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless HawkLeads and its officers, directors, employees,
            and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable
            attorneys' fees) arising out of or in any way connected with:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 ml-2">
            <li>Your use of the service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party, including end users whose data you collect</li>
            <li>Your violation of any applicable law or regulation</li>
            <li>Content you collect, store, or process through the service</li>
          </ul>
        </section>

        {/* 14 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">14. Dispute Resolution</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">14.1 Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of
            Virginia, United States, without regard to its conflict of law provisions.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">14.2 Informal Resolution</h3>
          <p>
            Before filing a formal dispute, you agree to attempt to resolve any issue informally by contacting
            us at support@hawkleads.io. We will attempt to resolve the dispute within 30 days.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">14.3 Arbitration</h3>
          <p>
            Any dispute not resolved informally shall be resolved by binding arbitration in accordance with the
            rules of the American Arbitration Association. The arbitration shall take place in Fairfax County,
            Virginia. Each party shall bear its own costs. The arbitrator's award shall be final and binding.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">14.4 Class Action Waiver</h3>
          <p>
            You agree that any dispute resolution proceedings will be conducted only on an individual basis
            and not in a class, consolidated, or representative action.
          </p>
        </section>

        {/* 15 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">15. Modifications to Terms</h2>
          <p>
            We may revise these Terms at any time by posting the updated version on our website. Material changes
            will be communicated via email to the address associated with your account at least 30 days before
            they take effect. Your continued use of the service after the effective date constitutes acceptance
            of the updated Terms. If you do not agree with the changes, you must cancel your subscription and
            stop using the service before the new Terms take effect.
          </p>
        </section>

        {/* 16 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">16. General Provisions</h2>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">16.1 Entire Agreement</h3>
          <p>
            These Terms, together with the Privacy Policy and any applicable DPA, constitute the entire agreement
            between you and HawkLeads regarding the service and supersede all prior agreements.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">16.2 Severability</h3>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will remain
            in full force and effect.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">16.3 Waiver</h3>
          <p>
            Our failure to enforce any right or provision of these Terms will not constitute a waiver of that
            right or provision.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">16.4 Assignment</h3>
          <p>
            You may not assign or transfer these Terms or your rights under them without our prior written consent.
            We may assign our rights and obligations under these Terms without restriction.
          </p>

          <h3 className="font-body text-sm font-semibold text-ink mt-4 mb-1">16.5 Force Majeure</h3>
          <p>
            Neither party shall be liable for any failure or delay in performance due to circumstances beyond its
            reasonable control, including natural disasters, war, terrorism, riots, government action, internet
            outages, or third-party service failures.
          </p>
        </section>

        {/* 17 */}
        <section>
          <h2 className="font-display text-lg font-semibold text-ink mb-2">17. Contact Information</h2>
          <p>
            For questions, concerns, or notices regarding these Terms, contact us at:
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
