'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

const INDUSTRIES = [
  'home_services', 'legal', 'medical', 'agency', 'hospitality',
  'consulting', 'real_estate', 'financial', 'fitness', 'education', 'other',
] as const;

export default function AdminTemplateEditorPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const templateId = typeof params.id === 'string' ? params.id : '';
  const isNew = templateId === 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('other');
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [stepsJson, setStepsJson] = useState('[]');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    async function loadTemplate(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data } = await supabase
          .from('flow_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (data) {
          setName(data.name);
          setDescription(data.description ?? '');
          setIndustry(data.industry);
          setIsFeatured(data.is_featured);
          setSortOrder(data.sort_order);
          setStepsJson(JSON.stringify(data.steps, null, 2));
        }
      } catch {
        setError('Failed to load template.');
      } finally {
        setLoading(false);
      }
    }
    void loadTemplate();
  }, [templateId, isNew]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    let parsedSteps: unknown;
    try {
      parsedSteps = JSON.parse(stepsJson);
    } catch {
      setError('Steps JSON is invalid.');
      return;
    }

    setSaving(true);
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      if (isNew) {
        const { error: insertError } = await supabase
          .from('flow_templates')
          .insert({
            name,
            description: description || null,
            industry,
            is_featured: isFeatured,
            sort_order: sortOrder,
            steps: parsedSteps as Record<string, unknown>,
          });

        if (insertError) {
          setError(insertError.message);
        } else {
          router.push('/admin/templates');
        }
      } else {
        const { error: updateError } = await supabase
          .from('flow_templates')
          .update({
            name,
            description: description || null,
            industry,
            is_featured: isFeatured,
            sort_order: sortOrder,
            steps: parsedSteps as Record<string, unknown>,
          })
          .eq('id', templateId);

        if (updateError) {
          setError(updateError.message);
        }
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
        <Link href="/admin/templates" className="text-sm text-stone hover:text-ink transition-colors duration-fast">Templates</Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">{isNew ? 'New Template' : name}</span>
      </div>

      <h1 className="page-heading">{isNew ? 'Create Template' : 'Edit Template'}</h1>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-prose">
        <div>
          <label htmlFor="tplName" className="input-label">Name</label>
          <input id="tplName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label htmlFor="tplDesc" className="input-label">Description</label>
          <input id="tplDesc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" />
        </div>
        <div>
          <label htmlFor="tplIndustry" className="input-label">Industry</label>
          <select id="tplIndustry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field">
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tplOrder" className="input-label">Sort Order</label>
            <input id="tplOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)} className="input-field" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded-sm border-border" />
              <span className="text-sm text-ink font-body">Featured</span>
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="tplSteps" className="input-label">Steps (JSON)</label>
          <textarea
            id="tplSteps"
            value={stepsJson}
            onChange={(e) => setStepsJson(e.target.value)}
            rows={12}
            className="input-field h-auto py-2 font-mono text-xs resize-y"
          />
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : isNew ? 'Create Template' : 'Save Changes'}</button>
          <Link href="/admin/templates" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
