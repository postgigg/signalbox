'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface EmailTemplateRow {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly subject: string;
  readonly is_active: boolean;
  readonly updated_at: string;
}

export default function AdminEmailTemplatesPage(): React.ReactElement {
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([]);
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
          .from('email_templates')
          .select('id, slug, name, subject, is_active, updated_at')
          .order('slug', { ascending: true });

        setTemplates((data as EmailTemplateRow[]) ?? []);
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
      <div className="flex items-center gap-3">
        <h1 className="page-heading">Email Templates</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">ADMIN</span>
      </div>
      <p className="mt-1 text-sm text-stone">Manage transactional email templates.</p>

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">Loading...</p></div>
        ) : templates.length === 0 ? (
          <div className="card text-center py-10"><p className="text-sm text-stone">No email templates found.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Slug</th>
                <th className="text-left py-3 px-4 font-medium">Subject</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="table-row">
                  <td className="py-3 px-4 font-medium text-ink">
                    <Link href={`/admin/email-templates/${template.id}`} className="hover:text-signal transition-colors duration-fast">
                      {template.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-stone">{template.slug}</td>
                  <td className="py-3 px-4 text-stone truncate max-w-[200px]">{template.subject}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${template.is_active ? 'bg-success-light text-success' : 'bg-surface-alt text-stone'}`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-stone">
                    {new Date(template.updated_at).toLocaleDateString()}
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
