'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

export default function AdminEmailTemplateEditorPage(): React.ReactElement {
  const params = useParams();
  const templateId = typeof params.id === 'string' ? params.id : '';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [variables, setVariables] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadTemplate(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (data) {
          setName(data.name);
          setSlug(data.slug);
          setSubject(data.subject);
          setHtmlBody(data.html_body);
          setTextBody(data.text_body ?? '');
          setVariables(Array.isArray(data.variables) ? (data.variables as string[]).join(', ') : '');
          setIsActive(data.is_active);
        }
      } catch {
        setError('Failed to load template.');
      } finally {
        setLoading(false);
      }
    }
    void loadTemplate();
  }, [templateId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { error: updateError } = await supabase
        .from('email_templates')
        .update({
          name,
          slug,
          subject,
          html_body: htmlBody,
          text_body: textBody || null,
          variables: variables.split(',').map((v) => v.trim()).filter(Boolean),
          is_active: isActive,
        })
        .eq('id', templateId);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError('Failed to save template.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card text-center py-10"><p className="text-sm text-stone">Loading...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/email-templates" className="text-sm text-stone hover:text-ink transition-colors duration-fast">Email Templates</Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">{name}</span>
      </div>

      <h1 className="page-heading">Edit Email Template</h1>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="etName" className="input-label">Name</label>
            <input id="etName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
          </div>
          <div>
            <label htmlFor="etSlug" className="input-label">Slug</label>
            <input id="etSlug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="input-field font-mono text-sm" />
          </div>
        </div>
        <div>
          <label htmlFor="etSubject" className="input-label">Subject</label>
          <input id="etSubject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label htmlFor="etVars" className="input-label">Variables (comma-separated)</label>
          <input id="etVars" type="text" value={variables} onChange={(e) => setVariables(e.target.value)} className="input-field font-mono text-sm" placeholder="name, email, score, tier" />
        </div>
        <div>
          <label htmlFor="etHtml" className="input-label">HTML Body</label>
          <textarea id="etHtml" value={htmlBody} onChange={(e) => setHtmlBody(e.target.value)} rows={12} required className="input-field h-auto py-2 font-mono text-xs resize-y" />
        </div>
        <div>
          <label htmlFor="etText" className="input-label">Text Body (fallback)</label>
          <textarea id="etText" value={textBody} onChange={(e) => setTextBody(e.target.value)} rows={6} className="input-field h-auto py-2 font-mono text-xs resize-y" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded-sm border-border" />
          <span className="text-sm text-ink font-body">Active</span>
        </label>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Template'}</button>
          {saved && <span className="text-xs text-success">Saved</span>}
          <Link href="/admin/email-templates" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
