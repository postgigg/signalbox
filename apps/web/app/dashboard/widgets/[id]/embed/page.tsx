'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { HelpTip } from '@/components/shared/HelpTip';
import { HELP_TIPS } from '@/lib/help-content';

const PLATFORM_GUIDES = [
  {
    name: 'WordPress',
    instructions: 'Go to Appearance > Theme Editor > footer.php (or use a plugin like "Insert Headers and Footers"). Paste the embed code before the closing </body> tag.',
  },
  {
    name: 'Shopify',
    instructions: 'Go to Online Store > Themes > Edit code > theme.liquid. Paste the embed code before the closing </body> tag.',
  },
  {
    name: 'Squarespace',
    instructions: 'Go to Settings > Advanced > Code Injection > Footer. Paste the embed code and save.',
  },
  {
    name: 'Wix',
    instructions: 'Go to Settings > Custom Code > Add Custom Code. Paste the embed code, set it to load on all pages in the body (end).',
  },
  {
    name: 'Webflow',
    instructions: 'Go to Project Settings > Custom Code > Footer Code. Paste the embed code and publish.',
  },
  {
    name: 'HTML',
    instructions: 'Open your HTML file and paste the embed code before the closing </body> tag. Upload the file to your server.',
  },
] as const;

export default function WidgetEmbedPage(): React.ReactElement {
  const params = useParams();
  const widgetId = typeof params.id === 'string' ? params.id : '';

  const [widgetKey, setWidgetKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState(0);

  useEffect(() => {
    async function loadWidgetKey(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data } = await supabase
          .from('widgets')
          .select('widget_key')
          .eq('id', widgetId)
          .single();

        if (data) {
          setWidgetKey(data.widget_key);
        }
      } catch {
        // Failed to load widget key
      }
    }
    void loadWidgetKey();
  }, [widgetId]);

  const embedCode = `<script>
  (function(w,d,s,k){
    w.HawkLeadsConfig={key:k};
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
    j.async=true;j.src='https://widget.hawkleads.io/v1/sb.js';
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','${widgetKey || 'YOUR_WIDGET_KEY'}');
</script>`;

  async function copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/widgets" className="text-sm text-stone hover:text-ink transition-colors duration-fast">Widgets</Link>
        <span className="text-stone-light">/</span>
        <Link href={`/dashboard/widgets/${widgetId}`} className="text-sm text-stone hover:text-ink transition-colors duration-fast">Widget</Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">Embed Code</span>
      </div>

      <h1 className="page-heading">Embed Code</h1>
      <p className="mt-2 text-sm text-stone">
        Copy this code and paste it on your website. The widget will appear as a floating button.
      </p>

      {/* Code Block */}
      <div className="mt-6 card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-stone uppercase tracking-wide">Snippet</span>
          <button
            type="button"
            onClick={() => void copyToClipboard()}
            className="btn-ghost text-xs h-8 px-3"
          >
            {copied ? 'Copied' : 'Copy to clipboard'}
          </button>
        </div>
        <pre className="bg-ink text-white rounded-sm p-4 overflow-x-auto text-sm font-mono leading-relaxed">
          {embedCode}
        </pre>
      </div>

      {/* Widget Key */}
      <div className="mt-4 card">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone uppercase tracking-wide">
              Widget Key
              <HelpTip text={HELP_TIPS.embed.widgetKey} />
            </span>
            <p className="mt-1 font-mono text-sm text-ink">{widgetKey || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Platform Guides */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Installation Guides
        </h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {PLATFORM_GUIDES.map((platform, index) => (
            <button
              key={platform.name}
              type="button"
              onClick={() => setActivePlatform(index)}
              className={`px-3 py-1.5 rounded-sm text-sm font-body transition-colors duration-fast ${
                index === activePlatform
                  ? 'bg-ink text-white'
                  : 'bg-surface border border-border text-stone hover:text-ink'
              }`}
            >
              {platform.name}
            </button>
          ))}
        </div>
        <div className="card">
          <h3 className="font-body text-base font-semibold text-ink">
            {PLATFORM_GUIDES[activePlatform]?.name}
          </h3>
          <p className="mt-2 text-sm text-stone leading-relaxed">
            {PLATFORM_GUIDES[activePlatform]?.instructions}
          </p>
        </div>
      </div>

      {/* Verification Note */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Verify Installation
        </h2>
        <div className="card">
          <p className="text-sm text-stone">
            After adding the embed code, visit your website and look for the HawkLeads widget button
            in the bottom corner of the page. If the widget appears and opens when clicked,
            your installation is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
