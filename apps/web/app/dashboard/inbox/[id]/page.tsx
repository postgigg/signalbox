'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { formatDate } from '@/lib/utils';

import { StarIcon } from '../InboxRow';

interface InboxEmailDetail {
  readonly id: string;
  readonly from_email: string;
  readonly from_name: string;
  readonly to_email: string;
  readonly cc_email: string | null;
  readonly subject: string;
  readonly body_text: string;
  readonly is_read: boolean;
  readonly is_archived: boolean;
  readonly is_starred: boolean;
  readonly received_at: string;
}

export default function InboxDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const emailId = typeof params.id === 'string' ? params.id : '';

  const [email, setEmail] = useState<InboxEmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEmail = useCallback(async (): Promise<void> => {
    if (emailId.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/inbox/${emailId}`);
      if (!response.ok) {
        setError(true);
        return;
      }
      const data = (await response.json()) as InboxEmailDetail;
      setEmail(data);

      // Auto-mark as read
      if (!data.is_read) {
        await fetch(`/api/v1/admin/inbox/${emailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true }),
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [emailId]);

  useEffect(() => {
    void fetchEmail();
  }, [fetchEmail]);

  async function handleToggleStar(): Promise<void> {
    if (!email) return;
    try {
      await fetch(`/api/v1/admin/inbox/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: !email.is_starred }),
      });
      setEmail({ ...email, is_starred: !email.is_starred });
    } catch {
      // Failed to toggle star
    }
  }

  async function handleArchive(): Promise<void> {
    if (!email) return;
    try {
      await fetch(`/api/v1/admin/inbox/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: true }),
      });
      router.push('/dashboard/inbox');
    } catch {
      // Failed to archive
    }
  }

  async function handleDelete(): Promise<void> {
    if (!email) return;
    try {
      await fetch(`/api/v1/admin/inbox/${emailId}`, { method: 'DELETE' });
      router.push('/dashboard/inbox');
    } catch {
      // Failed to delete
    }
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton h-4 w-24 mb-6" />
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-8 w-8 rounded-md" />
            ))}
          </div>
          <div className="skeleton h-6 w-96 mb-4" />
          <div className="skeleton h-4 w-64 mb-2" />
          <div className="skeleton h-4 w-48 mb-6" />
          <div className="skeleton h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div>
        <Link href="/dashboard/inbox" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
          Back to Inbox
        </Link>
        <div className="mt-6 text-center py-16">
          <p className="text-sm text-stone">Email not found.</p>
        </div>
      </div>
    );
  }

  const mailtoHref = `mailto:${email.from_email}?subject=Re: ${encodeURIComponent(email.subject)}`;
  const iconClass = 'w-4 h-4 text-stone';
  const actionBtnClass = 'p-2 rounded-md hover:bg-surface-alt transition-colors duration-fast';

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/inbox" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
          Inbox
        </Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium truncate max-w-[300px]">{email.subject}</span>
      </div>

      <div className="card">
        {/* Action bar */}
        <div className="flex items-center gap-1 mb-6 pb-4 border-b border-border">
          <button type="button" onClick={() => void handleToggleStar()} className={actionBtnClass} aria-label={email.is_starred ? 'Remove star' : 'Add star'}>
            <StarIcon filled={email.is_starred} />
          </button>
          <button type="button" onClick={() => void handleArchive()} className={actionBtnClass} aria-label="Archive">
            <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </button>
          <button type="button" onClick={() => void handleDelete()} className={actionBtnClass} aria-label="Delete">
            <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
          <a href={mailtoHref} className={actionBtnClass} aria-label="Reply">
            <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </a>
        </div>

        {/* Email header */}
        <h1 className="font-display text-xl font-semibold text-ink mb-4">{email.subject}</h1>
        <dl className="space-y-1.5 text-sm mb-6">
          <div className="flex gap-2">
            <dt className="text-stone font-medium w-10">From</dt>
            <dd className="text-ink">
              {email.from_name} <span className="text-stone">{'<'}{email.from_email}{'>'}</span>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-stone font-medium w-10">To</dt>
            <dd className="text-ink">{email.to_email}</dd>
          </div>
          {email.cc_email !== null && email.cc_email.length > 0 && (
            <div className="flex gap-2">
              <dt className="text-stone font-medium w-10">CC</dt>
              <dd className="text-ink">{email.cc_email}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-stone font-medium w-10">Date</dt>
            <dd className="text-ink">
              {formatDate(email.received_at, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </dd>
          </div>
        </dl>

        {/* Email body - plain text only, never render HTML */}
        <div className="border-t border-border pt-6">
          <div className="text-sm text-ink leading-relaxed font-body" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {email.body_text}
          </div>
        </div>
      </div>
    </div>
  );
}
