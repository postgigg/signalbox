'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: string;
  position: string;
  triggerText: string;
  triggerIcon: string;
  panelWidth: number;
  showBranding: boolean;
  showSocialProof: boolean;
  mode: 'light' | 'dark';
  triggerType: 'button' | 'tab';
  triggerOffsetX: number;
  triggerOffsetY: number;
  contactShowPhone: boolean;
  contactRequirePhone: boolean;
  contactShowMessage: boolean;
  contactRequireMessage: boolean;
  contactMessagePlaceholder: string;
  contactSubmitText: string;
  socialProofText: string;
  socialProofMinThreshold: number;
}

const FONT_OPTIONS = [
  { value: 'system', label: 'System Default' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans-serif' },
] as const;

const POSITION_OPTIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
] as const;

const ICON_OPTIONS = [
  { value: 'arrow', label: 'Arrow' },
  { value: 'chat', label: 'Chat' },
  { value: 'none', label: 'None' },
] as const;

const MODE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const TRIGGER_TYPE_OPTIONS = [
  { value: 'button', label: 'Button' },
  { value: 'tab', label: 'Tab' },
] as const;

export default function WidgetDesignPage(): React.ReactElement {
  const params = useParams();
  const widgetId = typeof params.id === 'string' ? params.id : '';

  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#0F172A',
    accentColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#1E293B',
    borderRadius: 12,
    fontFamily: 'system',
    position: 'bottom-right',
    triggerText: 'Get Started',
    triggerIcon: 'arrow',
    panelWidth: 400,
    showBranding: true,
    showSocialProof: false,
    mode: 'light',
    triggerType: 'button',
    triggerOffsetX: 20,
    triggerOffsetY: 20,
    contactShowPhone: true,
    contactRequirePhone: false,
    contactShowMessage: true,
    contactRequireMessage: false,
    contactMessagePlaceholder: 'Tell us more about what you need...',
    contactSubmitText: 'Submit',
    socialProofText: 'Join {count}+ others who chose us',
    socialProofMinThreshold: 10,
  });

  const [confirmation, setConfirmation] = useState({
    hot: { headline: 'You are a priority!', body: 'Expect to hear from us within 1 business hour.' },
    warm: { headline: 'Thanks for reaching out!', body: 'A team member will review your request and get back to you within 24 hours.' },
    cold: { headline: 'Thanks for your interest!', body: 'We will send you some helpful resources to get started.' },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateTheme(key: keyof ThemeConfig, value: string | number | boolean): void {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { error } = await supabase
        .from('widgets')
        .update({
          theme: theme as unknown as Record<string, unknown>,
          confirmation: confirmation as unknown as Record<string, unknown>,
        })
        .eq('id', widgetId);

      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Save failed
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/widgets" className="text-sm text-stone hover:text-ink transition-colors duration-fast">Widgets</Link>
        <span className="text-stone-light">/</span>
        <Link href={`/dashboard/widgets/${widgetId}`} className="text-sm text-stone hover:text-ink transition-colors duration-fast">Widget</Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">Design</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="page-heading">Widget Design</h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-success font-body">Saved</span>}
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Design'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Colors */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="primaryColor" className="input-label">Primary</label>
                <div className="flex items-center gap-2">
                  <input type="color" id="primaryColor" value={theme.primaryColor} onChange={(e) => updateTheme('primaryColor', e.target.value)} className="w-10 h-10 rounded-sm border border-border cursor-pointer" />
                  <input type="text" value={theme.primaryColor} onChange={(e) => updateTheme('primaryColor', e.target.value)} className="input-field h-10 font-mono text-xs flex-1" />
                </div>
              </div>
              <div>
                <label htmlFor="accentColor" className="input-label">Accent</label>
                <div className="flex items-center gap-2">
                  <input type="color" id="accentColor" value={theme.accentColor} onChange={(e) => updateTheme('accentColor', e.target.value)} className="w-10 h-10 rounded-sm border border-border cursor-pointer" />
                  <input type="text" value={theme.accentColor} onChange={(e) => updateTheme('accentColor', e.target.value)} className="input-field h-10 font-mono text-xs flex-1" />
                </div>
              </div>
              <div>
                <label htmlFor="bgColor" className="input-label">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" id="bgColor" value={theme.backgroundColor} onChange={(e) => updateTheme('backgroundColor', e.target.value)} className="w-10 h-10 rounded-sm border border-border cursor-pointer" />
                  <input type="text" value={theme.backgroundColor} onChange={(e) => updateTheme('backgroundColor', e.target.value)} className="input-field h-10 font-mono text-xs flex-1" />
                </div>
              </div>
              <div>
                <label htmlFor="textColor" className="input-label">Text</label>
                <div className="flex items-center gap-2">
                  <input type="color" id="textColor" value={theme.textColor} onChange={(e) => updateTheme('textColor', e.target.value)} className="w-10 h-10 rounded-sm border border-border cursor-pointer" />
                  <input type="text" value={theme.textColor} onChange={(e) => updateTheme('textColor', e.target.value)} className="input-field h-10 font-mono text-xs flex-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Layout</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="borderRadius" className="input-label">Border Radius: {theme.borderRadius}px</label>
                <input type="range" id="borderRadius" min={0} max={24} value={theme.borderRadius} onChange={(e) => updateTheme('borderRadius', parseInt(e.target.value, 10))} className="w-full" />
              </div>
              <div>
                <label htmlFor="fontFamily" className="input-label">Font</label>
                <select id="fontFamily" value={theme.fontFamily} onChange={(e) => updateTheme('fontFamily', e.target.value)} className="input-field h-10">
                  {FONT_OPTIONS.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="position" className="input-label">Position</label>
                <select id="position" value={theme.position} onChange={(e) => updateTheme('position', e.target.value)} className="input-field h-10">
                  {POSITION_OPTIONS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="panelWidth" className="input-label">Panel Width: {theme.panelWidth}px</label>
                <input type="range" id="panelWidth" min={320} max={480} step={20} value={theme.panelWidth} onChange={(e) => updateTheme('panelWidth', parseInt(e.target.value, 10))} className="w-full" />
              </div>
            </div>
          </div>

          {/* Mode */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Mode</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="mode" className="input-label">Color Mode</label>
                <select id="mode" value={theme.mode} onChange={(e) => updateTheme('mode', e.target.value)} className="input-field h-10">
                  {MODE_OPTIONS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
                </select>
              </div>
            </div>
          </div>

          {/* Trigger */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Trigger Button</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="triggerType" className="input-label">Trigger Type</label>
                <select id="triggerType" value={theme.triggerType} onChange={(e) => updateTheme('triggerType', e.target.value)} className="input-field h-10">
                  {TRIGGER_TYPE_OPTIONS.map((tt) => (<option key={tt.value} value={tt.value}>{tt.label}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="triggerText" className="input-label">Button Text</label>
                <input id="triggerText" type="text" value={theme.triggerText} onChange={(e) => updateTheme('triggerText', e.target.value)} className="input-field h-10" maxLength={30} />
              </div>
              <div>
                <label htmlFor="triggerIcon" className="input-label">Icon</label>
                <select id="triggerIcon" value={theme.triggerIcon} onChange={(e) => updateTheme('triggerIcon', e.target.value)} className="input-field h-10">
                  {ICON_OPTIONS.map((ic) => (<option key={ic.value} value={ic.value}>{ic.label}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="triggerOffsetX" className="input-label">Trigger Offset X: {theme.triggerOffsetX}px</label>
                <input type="range" id="triggerOffsetX" min={0} max={100} value={theme.triggerOffsetX} onChange={(e) => updateTheme('triggerOffsetX', parseInt(e.target.value, 10))} className="w-full" />
              </div>
              <div>
                <label htmlFor="triggerOffsetY" className="input-label">Trigger Offset Y: {theme.triggerOffsetY}px</label>
                <input type="range" id="triggerOffsetY" min={0} max={100} value={theme.triggerOffsetY} onChange={(e) => updateTheme('triggerOffsetY', parseInt(e.target.value, 10))} className="w-full" />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Contact Form</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink font-body">Show phone field</span>
                <input type="checkbox" checked={theme.contactShowPhone} onChange={(e) => updateTheme('contactShowPhone', e.target.checked)} className="rounded-sm border-border text-signal focus:ring-signal" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink font-body">Require phone</span>
                <input type="checkbox" checked={theme.contactRequirePhone} onChange={(e) => updateTheme('contactRequirePhone', e.target.checked)} className="rounded-sm border-border text-signal focus:ring-signal" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink font-body">Show message field</span>
                <input type="checkbox" checked={theme.contactShowMessage} onChange={(e) => updateTheme('contactShowMessage', e.target.checked)} className="rounded-sm border-border text-signal focus:ring-signal" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink font-body">Require message</span>
                <input type="checkbox" checked={theme.contactRequireMessage} onChange={(e) => updateTheme('contactRequireMessage', e.target.checked)} className="rounded-sm border-border text-signal focus:ring-signal" />
              </label>
              <div>
                <label htmlFor="contactMessagePlaceholder" className="input-label">Message Placeholder</label>
                <input id="contactMessagePlaceholder" type="text" value={theme.contactMessagePlaceholder} onChange={(e) => updateTheme('contactMessagePlaceholder', e.target.value)} className="input-field h-10" />
              </div>
              <div>
                <label htmlFor="contactSubmitText" className="input-label">Submit Button Text</label>
                <input id="contactSubmitText" type="text" value={theme.contactSubmitText} onChange={(e) => updateTheme('contactSubmitText', e.target.value)} className="input-field h-10" maxLength={30} />
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Social Proof</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="socialProofText" className="input-label">Social Proof Text</label>
                <input id="socialProofText" type="text" value={theme.socialProofText} onChange={(e) => updateTheme('socialProofText', e.target.value)} className="input-field h-10" />
                <p className="text-xs text-stone mt-1">Use {'{count}'} as a placeholder for the number.</p>
              </div>
              <div>
                <label htmlFor="socialProofMinThreshold" className="input-label">Minimum Threshold: {theme.socialProofMinThreshold}</label>
                <input type="range" id="socialProofMinThreshold" min={0} max={100} value={theme.socialProofMinThreshold} onChange={(e) => updateTheme('socialProofMinThreshold', parseInt(e.target.value, 10))} className="w-full" />
                <p className="text-xs text-stone mt-1">Social proof is hidden until this many submissions are reached.</p>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Options</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink font-body">Show branding</span>
                <input type="checkbox" checked={theme.showBranding} onChange={(e) => updateTheme('showBranding', e.target.checked)} className="rounded-sm border-border text-signal focus:ring-signal" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink font-body">Show social proof</span>
                <input type="checkbox" checked={theme.showSocialProof} onChange={(e) => updateTheme('showSocialProof', e.target.checked)} className="rounded-sm border-border text-signal focus:ring-signal" />
              </label>
            </div>
          </div>

          {/* Confirmation Messages */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Confirmation Messages</h3>
            {(['hot', 'warm', 'cold'] as const).map((tierKey) => (
              <div key={tierKey} className="mb-4 last:mb-0">
                <p className="text-xs font-medium text-stone uppercase tracking-wide mb-2">
                  {tierKey.charAt(0).toUpperCase() + tierKey.slice(1)} Lead
                </p>
                <input
                  type="text"
                  value={confirmation[tierKey].headline}
                  onChange={(e) =>
                    setConfirmation((prev) => ({
                      ...prev,
                      [tierKey]: { ...prev[tierKey], headline: e.target.value },
                    }))
                  }
                  placeholder="Headline"
                  className="input-field h-10 mb-2"
                />
                <textarea
                  value={confirmation[tierKey].body}
                  onChange={(e) =>
                    setConfirmation((prev) => ({
                      ...prev,
                      [tierKey]: { ...prev[tierKey], body: e.target.value },
                    }))
                  }
                  placeholder="Body text"
                  rows={2}
                  className="input-field h-auto py-2 resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <div className="sticky top-6">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Live Preview</h3>
            <div className="border border-border rounded-lg bg-stone-light/10 min-h-[500px] relative p-6 flex items-end justify-end">
              {/* Widget Preview */}
              <div className="w-full" style={{ maxWidth: `${String(theme.panelWidth)}px` }}>
                <div
                  className="border shadow-lg"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    borderRadius: `${String(theme.borderRadius)}px`,
                    color: theme.textColor,
                  }}
                >
                  {/* Header */}
                  <div className="p-4 pb-0">
                    <div className="h-1 rounded-sm" style={{ backgroundColor: `${theme.accentColor}20` }}>
                      <div className="h-full rounded-sm" style={{ width: '33%', backgroundColor: theme.accentColor }} />
                    </div>
                    <p className="text-xs mt-3 opacity-50">Step 1 of 3</p>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-lg font-semibold">What can we help you with?</p>
                    <div className="mt-4 space-y-2">
                      {['Consultation', 'Quick question', 'Get a quote'].map((label) => (
                        <div
                          key={label}
                          className="p-3 border text-sm"
                          style={{ borderRadius: `${String(Math.min(theme.borderRadius, 12))}px` }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  {theme.showBranding && (
                    <div className="p-3 text-center opacity-30 text-xs">
                      Powered by SignalBox
                    </div>
                  )}
                </div>

                {/* Trigger */}
                <div className="mt-4 flex justify-end">
                  <div
                    className="px-5 h-12 flex items-center gap-2 text-white text-sm font-medium shadow-lg"
                    style={{
                      backgroundColor: theme.primaryColor,
                      borderRadius: `${String(Math.min(theme.borderRadius, 8))}px`,
                    }}
                  >
                    {theme.triggerText}
                    {theme.triggerIcon === 'arrow' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
