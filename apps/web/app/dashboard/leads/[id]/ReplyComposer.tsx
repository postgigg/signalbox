'use client';

import { useState } from 'react';

interface ReplyComposerProps {
  readonly leadId: string;
  readonly visitorName: string;
  readonly accountName: string;
  readonly suggestedOpener: string;
}

export function ReplyComposer({
  leadId,
  visitorName,
  accountName,
  suggestedOpener,
}: ReplyComposerProps): React.ReactElement {
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState(`Re: Your inquiry to ${accountName}`);
  const [body, setBody] = useState(suggestedOpener);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(): Promise<void> {
    if (subject.trim().length === 0 || body.trim().length === 0) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/leads/${leadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string } | null;
        setError(data?.error ?? 'Failed to send reply');
        return;
      }

      setSent(true);
      setShowCompose(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-3 p-3 rounded-sm bg-success-light text-success text-sm border border-success/20">
        Reply sent to {visitorName}. Status updated to contacted.
      </div>
    );
  }

  if (!showCompose) {
    return (
      <button
        type="button"
        onClick={() => setShowCompose(true)}
        className="btn-primary text-sm h-9 px-4 mt-3 flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
        Send Reply
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 border border-border rounded-sm p-4">
      {error !== null && (
        <div className="p-2 rounded-sm bg-danger-light text-danger text-xs border border-danger/20">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="reply-subject" className="text-xs font-medium text-stone">Subject</label>
        <input
          id="reply-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input-field h-9 text-sm mt-1"
          maxLength={500}
        />
      </div>
      <div>
        <label htmlFor="reply-body" className="text-xs font-medium text-stone">Message</label>
        <textarea
          id="reply-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="input-field h-auto py-2 text-sm mt-1 resize-none"
          maxLength={5000}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || subject.trim().length === 0 || body.trim().length === 0}
          className="btn-primary text-sm h-9 px-4 flex items-center gap-1.5"
        >
          {sending ? (
            <span className="inline-flex items-center gap-2">
              <span className="spinner w-3.5 h-3.5" />
              Sending...
            </span>
          ) : 'Send'}
        </button>
        <button
          type="button"
          onClick={() => setShowCompose(false)}
          disabled={sending}
          className="btn-ghost text-sm h-9 px-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
