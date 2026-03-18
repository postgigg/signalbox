'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TemplateRow {
  readonly id: string;
  readonly name: string;
  readonly industry: string;
  readonly is_featured: boolean;
  readonly sort_order: number;
  readonly created_at: string;
}

export default function AdminTemplatesPage(): React.ReactElement {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data } = await supabase
          .from('flow_templates')
          .select('id, name, industry, is_featured, sort_order, created_at')
          .order('sort_order', { ascending: true });

        setTemplates((data as TemplateRow[]) ?? []);
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    }
    void loadTemplates();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="page-heading">Templates</h1>
          <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
        </div>
        <Link href="/admin/templates/new" className="btn-primary">
          Create Template
        </Link>
      </div>
      <p className="mt-1 text-sm text-stone">Manage flow templates available to all accounts.</p>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">Loading...</p></div>
        ) : templates.length === 0 ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">No templates yet.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Industry</th>
                <th className="text-left py-3 px-4 font-medium">Featured</th>
                <th className="text-right py-3 px-4 font-medium">Order</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="table-row">
                  <td className="py-3 px-4 font-medium text-ink">
                    <Link href={`/admin/templates/${template.id}`} className="hover:text-signal transition-colors duration-fast">
                      {template.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-stone">{template.industry}</td>
                  <td className="py-3 px-4">
                    {template.is_featured ? (
                      <span className="text-xs text-signal font-medium">Yes</span>
                    ) : (
                      <span className="text-xs text-stone-light">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-stone">{template.sort_order}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/templates/${template.id}`} className="text-xs text-signal hover:text-signal-hover transition-colors duration-fast">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
