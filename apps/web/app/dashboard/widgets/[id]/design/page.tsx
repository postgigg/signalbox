'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

import { HelpTip } from '@/components/shared/HelpTip';
import { HELP_TIPS } from '@/lib/help-content';
import { DEMO_ACCOUNT_ID } from '@/lib/constants';

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

const DEFAULT_THEME: ThemeConfig = {
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
};

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

const TRIGGER_TYPE_OPTIONS = [
  { value: 'button', label: 'Button' },
  { value: 'tab', label: 'Tab' },
] as const;

export default function WidgetDesignPage(): React.ReactElement {
  const params = useParams();
  const widgetId = typeof params.id === 'string' ? params.id : '';

  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  const [confirmation, setConfirmation] = useState({
    hot: { headline: 'You are a priority!', body: 'Expect to hear from us within 1 business hour.' },
    warm: { headline: 'Thanks for reaching out!', body: 'A team member will review your request and get back to you within 24 hours.' },
    cold: { headline: 'Thanks for your interest!', body: 'We will send you some helpful resources to get started.' },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canRemoveBranding, setCanRemoveBranding] = useState(false);
  const [accountPlan, setAccountPlan] = useState<string>('trial');
  const [previewContact, setPreviewContact] = useState(false);
  const [previewConfirmation, setPreviewConfirmation] = useState(false);
  const [previewLayout, setPreviewLayout] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const confirmationSectionRef = useRef<HTMLDivElement>(null);
  const layoutSectionRef = useRef<HTMLDivElement>(null);

  // Switch preview based on which section is in view
  useEffect(() => {
    const contactEl = contactSectionRef.current;
    const confirmEl = confirmationSectionRef.current;
    const observers: IntersectionObserver[] = [];

    if (contactEl) {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry) setPreviewContact(entry.isIntersecting); },
        { threshold: 0.3 }
      );
      obs.observe(contactEl);
      observers.push(obs);
    }
    if (confirmEl) {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry) setPreviewConfirmation(entry.isIntersecting); },
        { threshold: 0.3 }
      );
      obs.observe(confirmEl);
      observers.push(obs);
    }

    const layoutEl = layoutSectionRef.current;
    if (layoutEl) {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry) setPreviewLayout(entry.isIntersecting); },
        { threshold: 0.3 }
      );
      obs.observe(layoutEl);
      observers.push(obs);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [loading]);

  useEffect(() => {
    async function loadWidget(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData } = await supabase
          .from('members')
          .select('account_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!memberData) return;

        if (memberData.account_id === DEMO_ACCOUNT_ID) {
          setIsDemo(true);
        }

        // Fetch account plan
        const { data: accountData } = await supabase
          .from('accounts')
          .select('plan')
          .eq('id', memberData.account_id)
          .single();

        if (accountData) {
          setAccountPlan(accountData.plan);
          setCanRemoveBranding(accountData.plan === 'pro' || accountData.plan === 'agency');
        }

        // Fetch widget theme and confirmation
        const { data: widget } = await supabase
          .from('widgets')
          .select('theme, confirmation, social_proof_text, social_proof_min, contact_show_phone, contact_phone_required, contact_show_message, contact_message_required, contact_message_placeholder, contact_submit_text')
          .eq('id', widgetId)
          .eq('account_id', memberData.account_id)
          .single();

        if (widget) {
          const savedTheme = widget.theme as Record<string, unknown> | null;
          if (savedTheme) {
            setTheme((prev) => ({
              ...prev,
              primaryColor: (savedTheme['primaryColor'] as string | undefined) ?? prev.primaryColor,
              accentColor: (savedTheme['accentColor'] as string | undefined) ?? prev.accentColor,
              backgroundColor: (savedTheme['backgroundColor'] as string | undefined) ?? prev.backgroundColor,
              textColor: (savedTheme['textColor'] as string | undefined) ?? prev.textColor,
              borderRadius: (savedTheme['borderRadius'] as number | undefined) ?? prev.borderRadius,
              fontFamily: (savedTheme['fontFamily'] as string | undefined) ?? prev.fontFamily,
              position: (savedTheme['position'] as string | undefined) ?? prev.position,
              triggerText: (savedTheme['triggerText'] as string | undefined) ?? prev.triggerText,
              triggerIcon: (savedTheme['triggerIcon'] as string | undefined) ?? prev.triggerIcon,
              panelWidth: (savedTheme['panelWidth'] as number | undefined) ?? prev.panelWidth,
              showBranding: (savedTheme['showBranding'] as boolean | undefined) ?? prev.showBranding,
              showSocialProof: (savedTheme['showSocialProof'] as boolean | undefined) ?? prev.showSocialProof,
              mode: (savedTheme['mode'] as 'light' | 'dark' | undefined) ?? prev.mode,
              triggerType: (savedTheme['triggerType'] as 'button' | 'tab' | undefined) ?? prev.triggerType,
              triggerOffsetX: (savedTheme['triggerOffsetX'] as number | undefined) ?? prev.triggerOffsetX,
              triggerOffsetY: (savedTheme['triggerOffsetY'] as number | undefined) ?? prev.triggerOffsetY,
            }));
          }

          // Populate contact form settings from widget columns
          setTheme((prev) => ({
            ...prev,
            contactShowPhone: widget.contact_show_phone ?? prev.contactShowPhone,
            contactRequirePhone: widget.contact_phone_required ?? prev.contactRequirePhone,
            contactShowMessage: widget.contact_show_message ?? prev.contactShowMessage,
            contactRequireMessage: widget.contact_message_required ?? prev.contactRequireMessage,
            contactMessagePlaceholder: widget.contact_message_placeholder ?? prev.contactMessagePlaceholder,
            contactSubmitText: widget.contact_submit_text ?? prev.contactSubmitText,
            socialProofText: widget.social_proof_text ?? prev.socialProofText,
            socialProofMinThreshold: widget.social_proof_min ?? prev.socialProofMinThreshold,
          }));

          const savedConfirmation = widget.confirmation as Record<string, { headline?: string; body?: string }> | null;
          if (savedConfirmation) {
            setConfirmation((prev) => ({
              hot: {
                headline: savedConfirmation['hot']?.headline ?? prev.hot.headline,
                body: savedConfirmation['hot']?.body ?? prev.hot.body,
              },
              warm: {
                headline: savedConfirmation['warm']?.headline ?? prev.warm.headline,
                body: savedConfirmation['warm']?.body ?? prev.warm.body,
              },
              cold: {
                headline: savedConfirmation['cold']?.headline ?? prev.cold.headline,
                body: savedConfirmation['cold']?.body ?? prev.cold.body,
              },
            }));
          }
        }
      } catch {
        // Failed to load widget
      } finally {
        setLoading(false);
      }
    }
    void loadWidget();
  }, [widgetId]);

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
          social_proof_text: theme.socialProofText,
          social_proof_min: theme.socialProofMinThreshold,
          contact_show_phone: theme.contactShowPhone,
          contact_phone_required: theme.contactRequirePhone,
          contact_show_message: theme.contactShowMessage,
          contact_message_required: theme.contactRequireMessage,
          contact_message_placeholder: theme.contactMessagePlaceholder,
          contact_submit_text: theme.contactSubmitText,
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

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="skeleton h-4 w-16" />
          <span className="text-stone-light">/</span>
          <div className="skeleton h-4 w-14" />
          <span className="text-stone-light">/</span>
          <div className="skeleton h-4 w-14" />
        </div>
        <div className="skeleton h-8 w-40 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton h-4 w-20 mb-4" />
                <div className="space-y-3">
                  <div className="skeleton h-10 w-full" />
                  <div className="skeleton h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="card min-h-[400px]">
            <div className="skeleton h-full w-full" />
          </div>
        </div>
      </div>
    );
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
          {isDemo && <span className="text-xs text-warning font-body">Demo account: editing disabled</span>}
          <button type="button" onClick={() => void handleSave()} disabled={saving || isDemo} className="btn-primary">
            {saving ? 'Saving...' : isDemo ? 'Read Only' : 'Save Design'}
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
          <div className="card" ref={layoutSectionRef}>
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

          {/* Trigger */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Trigger Button</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="triggerType" className="input-label">
                  Trigger Type
                  <HelpTip text={HELP_TIPS.design.triggerType} />
                </label>
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
                <label htmlFor="triggerOffsetX" className="input-label">
                  Trigger Offset X: {theme.triggerOffsetX}px
                  <HelpTip text={HELP_TIPS.design.triggerOffsetX} />
                </label>
                <input type="range" id="triggerOffsetX" min={0} max={100} value={theme.triggerOffsetX} onChange={(e) => updateTheme('triggerOffsetX', parseInt(e.target.value, 10))} className="w-full" />
              </div>
              <div>
                <label htmlFor="triggerOffsetY" className="input-label">
                  Trigger Offset Y: {theme.triggerOffsetY}px
                  <HelpTip text={HELP_TIPS.design.triggerOffsetY} />
                </label>
                <input type="range" id="triggerOffsetY" min={0} max={100} value={theme.triggerOffsetY} onChange={(e) => updateTheme('triggerOffsetY', parseInt(e.target.value, 10))} className="w-full" />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" ref={contactSectionRef}>
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
                <label htmlFor="socialProofText" className="input-label">
                  Social Proof Text
                  <HelpTip text={HELP_TIPS.design.socialProofText} />
                </label>
                <input id="socialProofText" type="text" value={theme.socialProofText} onChange={(e) => updateTheme('socialProofText', e.target.value)} className="input-field h-10" />
                <p className="text-xs text-stone mt-1">Use {'{count}'} as a placeholder for the number.</p>
              </div>
              <div>
                <label htmlFor="socialProofMinThreshold" className="input-label">
                  Minimum Threshold: {theme.socialProofMinThreshold}
                  <HelpTip text={HELP_TIPS.design.socialProofMin} />
                </label>
                <input type="range" id="socialProofMinThreshold" min={0} max={100} value={theme.socialProofMinThreshold} onChange={(e) => updateTheme('socialProofMinThreshold', parseInt(e.target.value, 10))} className="w-full" />
                <p className="text-xs text-stone mt-1">Social proof is hidden until this many submissions are reached.</p>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="card">
            <h3 className="font-body text-sm font-semibold text-ink mb-4">Options</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-ink font-body">
                    Show branding
                    <HelpTip text={HELP_TIPS.design.showBranding} />
                  </span>
                  {!canRemoveBranding && (
                    <p className="text-xs text-stone mt-0.5">
                      <Link href="/dashboard/settings/billing" className="text-signal hover:underline">Upgrade to Pro</Link> to remove branding.
                    </p>
                  )}
                  {canRemoveBranding && accountPlan === 'agency' && !theme.showBranding && (
                    <p className="text-xs text-success mt-0.5">White-label mode active</p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={theme.showBranding}
                  onChange={(e) => updateTheme('showBranding', e.target.checked)}
                  disabled={!canRemoveBranding && !theme.showBranding}
                  className="rounded-sm border-border text-signal focus:ring-signal"
                />
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink font-body">
                  Show social proof
                  <HelpTip text={HELP_TIPS.design.socialProof} />
                </span>
                <input type="checkbox" checked={theme.showSocialProof} onChange={(e) => updateTheme('showSocialProof', e.target.checked)} className="rounded-sm border-border text-signal focus:ring-signal" />
              </label>
            </div>
          </div>

          {/* Confirmation Messages */}
          <div className="card" ref={confirmationSectionRef}>
            <h3 className="font-body text-sm font-semibold text-ink mb-4">
              Confirmation Messages
              <HelpTip text={HELP_TIPS.design.confirmationMessages} />
            </h3>
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
            <div className={`border border-border rounded-lg bg-stone-light/10 min-h-[500px] relative p-6 flex transition-all duration-normal ${
              previewLayout
                ? theme.position === 'bottom-left' ? 'items-end justify-start' : theme.position === 'bottom-center' ? 'items-end justify-center' : 'items-end justify-end'
                : 'items-end justify-end'
            }`}>
              {/* Position indicator when editing layout */}
              {previewLayout && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Desktop frame */}
                  <div className="absolute top-3 left-3 right-3 bottom-3 border border-dashed border-stone/20 rounded-md">
                    <p className="absolute top-2 left-3 text-[9px] text-stone/40 font-mono uppercase tracking-wider">Desktop viewport</p>
                    {/* Position dot */}
                    <div
                      className="absolute w-2.5 h-2.5 rounded-pill transition-all duration-normal"
                      style={{
                        backgroundColor: theme.accentColor,
                        bottom: '12px',
                        left: theme.position === 'bottom-left' ? '12px' : theme.position === 'bottom-center' ? '50%' : 'auto',
                        right: theme.position === 'bottom-right' ? '12px' : 'auto',
                        transform: theme.position === 'bottom-center' ? 'translateX(-50%)' : 'none',
                      }}
                    />
                  </div>
                  {/* Mobile frame */}
                  <div className="absolute top-3 right-3 w-[60px] h-[100px] border border-dashed border-stone/20 rounded-md">
                    <p className="absolute top-1 left-1.5 text-[6px] text-stone/40 font-mono">Mobile</p>
                    <div
                      className="absolute w-1.5 h-1.5 rounded-pill"
                      style={{
                        backgroundColor: theme.accentColor,
                        bottom: '6px',
                        left: theme.position === 'bottom-left' ? '6px' : theme.position === 'bottom-center' ? '50%' : 'auto',
                        right: theme.position === 'bottom-right' ? '6px' : 'auto',
                        transform: theme.position === 'bottom-center' ? 'translateX(-50%)' : 'none',
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="w-full" style={{ maxWidth: `${String(theme.panelWidth)}px` }}>
                <div
                  className="border shadow-lg transition-all duration-normal"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    borderRadius: `${String(theme.borderRadius)}px`,
                    color: theme.textColor,
                  }}
                >
                  {/* Header */}
                  <div className="p-4 pb-0">
                    <div className="h-1 rounded-sm" style={{ backgroundColor: `${theme.accentColor}20` }}>
                      <div
                        className="h-full rounded-sm transition-all duration-normal"
                        style={{ width: previewConfirmation ? '100%' : previewContact ? '100%' : '33%', backgroundColor: theme.accentColor }}
                      />
                    </div>
                    <p className="text-xs mt-3 opacity-50">
                      {previewConfirmation ? 'Complete' : previewContact ? 'Contact Info' : 'Step 1 of 3'}
                    </p>
                  </div>

                  {/* Content: Step view / Contact form / Confirmation */}
                  <div className="p-4">
                    {previewConfirmation ? (
                      <div className="text-center py-4">
                        <div
                          className="w-12 h-12 rounded-pill mx-auto flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${theme.accentColor}20` }}
                        >
                          <svg className="w-6 h-6" style={{ color: theme.accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold">{confirmation.hot.headline}</p>
                        <p className="text-sm opacity-60 mt-1">{confirmation.hot.body}</p>
                        <div className="mt-4 flex items-center justify-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-pill" style={{ backgroundColor: theme.accentColor }} />
                          <span className="inline-block w-1.5 h-1.5 rounded-pill bg-yellow-400" />
                          <span className="inline-block w-1.5 h-1.5 rounded-pill bg-red-400" />
                          <span className="inline-block w-1.5 h-1.5 rounded-pill bg-green-400" />
                        </div>
                        <p className="text-[10px] opacity-30 mt-2">Full-screen confetti plays on submission</p>
                      </div>
                    ) : previewContact ? (
                      <>
                        <p className="text-lg font-semibold">Almost done!</p>
                        <p className="text-xs opacity-50 mt-1">Enter your details to see your results.</p>
                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="text-xs font-medium opacity-60">Name <span style={{ color: theme.accentColor }}>*</span></label>
                            <div className="mt-1 h-9 border rounded-md px-3 flex items-center text-xs opacity-40" style={{ borderRadius: `${String(Math.min(theme.borderRadius, 8))}px` }}>
                              Your name
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium opacity-60">Email <span style={{ color: theme.accentColor }}>*</span></label>
                            <div className="mt-1 h-9 border rounded-md px-3 flex items-center text-xs opacity-40" style={{ borderRadius: `${String(Math.min(theme.borderRadius, 8))}px` }}>
                              you@example.com
                            </div>
                          </div>
                          {theme.contactShowPhone && (
                            <div>
                              <label className="text-xs font-medium opacity-60">
                                Phone {theme.contactRequirePhone && <span style={{ color: theme.accentColor }}>*</span>}
                              </label>
                              <div className="mt-1 h-9 border rounded-md px-3 flex items-center text-xs opacity-40" style={{ borderRadius: `${String(Math.min(theme.borderRadius, 8))}px` }}>
                                (555) 123-4567
                              </div>
                            </div>
                          )}
                          {theme.contactShowMessage && (
                            <div>
                              <label className="text-xs font-medium opacity-60">
                                Message {theme.contactRequireMessage && <span style={{ color: theme.accentColor }}>*</span>}
                              </label>
                              <div className="mt-1 h-16 border rounded-md px-3 py-2 text-xs opacity-40" style={{ borderRadius: `${String(Math.min(theme.borderRadius, 8))}px` }}>
                                {theme.contactMessagePlaceholder}
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2 mt-1">
                            <div className="w-3.5 h-3.5 border rounded-sm mt-0.5 flex-shrink-0" style={{ borderColor: theme.accentColor }} />
                            <p className="text-[10px] opacity-50 leading-tight">I agree to the processing of my data and acknowledge the Privacy Policy</p>
                          </div>
                          <div
                            className="h-10 flex items-center justify-center text-white text-sm font-medium mt-2"
                            style={{
                              backgroundColor: theme.accentColor,
                              borderRadius: `${String(Math.min(theme.borderRadius, 8))}px`,
                            }}
                          >
                            {theme.contactSubmitText || 'Submit'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
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
                        {theme.showSocialProof && (
                          <div className="mt-4 flex items-center gap-2 text-xs opacity-50">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            <span>{theme.socialProofText.replace('{count}', String(theme.socialProofMinThreshold))}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  {theme.showBranding && (
                    <div className="p-3 text-center opacity-30 text-xs">
                      Powered by HawkLeads
                    </div>
                  )}
                </div>

                {/* Trigger */}
                <div className={`mt-4 flex ${
                  theme.position === 'bottom-left' ? 'justify-start' : theme.position === 'bottom-center' ? 'justify-center' : 'justify-end'
                }`} style={{ marginLeft: `${String(theme.position === 'bottom-left' ? theme.triggerOffsetX : 0)}px`, marginRight: `${String(theme.position === 'bottom-right' ? theme.triggerOffsetX : 0)}px` }}>
                  <div
                    className={`flex items-center gap-2 text-white text-sm font-medium shadow-lg transition-all duration-fast ${
                      theme.triggerType === 'tab' ? 'px-4 h-10 writing-mode-vertical' : 'px-5 h-12'
                    }`}
                    style={{
                      backgroundColor: theme.primaryColor,
                      borderRadius: theme.triggerType === 'tab'
                        ? `${String(Math.min(theme.borderRadius, 8))}px ${String(Math.min(theme.borderRadius, 8))}px 0 0`
                        : `${String(Math.min(theme.borderRadius, 8))}px`,
                    }}
                  >
                    {theme.triggerIcon === 'arrow' && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                    {theme.triggerIcon === 'chat' && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                    {theme.triggerIcon === 'plus' && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    {theme.triggerText}
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
