'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';

import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from '@/lib/constants';

import type { SupportTicket, TicketMessage } from '@/lib/supabase/types';

interface LabelValue {
  readonly value: string;
  readonly label: string;
}

interface TicketDetailProps {
  readonly ticket: SupportTicket;
  readonly initialMessages: TicketMessage[];
  readonly adminEmail: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-signal-light text-signal',
  pending: 'bg-warning-light text-warning',
  resolved: 'bg-success-light text-success',
  closed: 'bg-surface-alt text-stone',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-surface-alt text-stone',
  normal: 'bg-signal-light text-signal',
  high: 'bg-warning-light text-warning',
  urgent: 'bg-danger-light text-danger',
};

interface ApiTicketResponse {
  data: SupportTicket;
}

interface ApiMessageResponse {
  data: TicketMessage;
}

export function TicketDetail({ ticket: initialTicket, initialMessages, adminEmail }: TicketDetailProps): React.ReactElement {
  const [ticket, setTicket] = useState<SupportTicket>(initialTicket);
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages);
  const [replyBody, setReplyBody] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const updateTicket = useCallback(async (updates: Record<string, unknown>): Promise<void> => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/v1/admin/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const result = await response.json() as ApiTicketResponse;
        setTicket(result.data);
      }
    } catch {
      // Update error
    } finally {
      setUpdating(false);
    }
  }, [ticket.id]);

  const sendReply = useCallback(async (): Promise<void> => {
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const response = await fetch(`/api/v1/admin/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: replyBody.trim(),
          is_internal_note: isInternalNote,
        }),
      });
      if (response.ok) {
        const result = await response.json() as ApiMessageResponse;
        setMessages((prev) => [...prev, result.data]);
        setReplyBody('');
        setIsInternalNote(false);
      }
    } catch {
      // Send error
    } finally {
      setSending(false);
    }
  }, [ticket.id, replyBody, isInternalNote]);

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Messages */}
      <div className="lg:col-span-2 space-y-4">
        {/* Message thread */}
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`card p-4 ${msg.is_internal_note ? 'border-warning bg-warning-light/30' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-1.5 py-0.5 rounded-pill font-medium ${
                  msg.sender_type === 'admin' ? 'bg-signal-light text-signal' : 'bg-surface-alt text-stone'
                }`}>
                  {msg.sender_type === 'admin' ? 'Admin' : 'Customer'}
                </span>
                {msg.is_internal_note && (
                  <span className="text-xs px-1.5 py-0.5 rounded-pill font-medium bg-warning-light text-warning">
                    Internal Note
                  </span>
                )}
                <span className="text-xs text-stone">{msg.sender_email}</span>
                <span className="text-xs text-stone ml-auto">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-ink whitespace-pre-wrap">{msg.body}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="card p-4 text-center">
              <p className="text-sm text-stone">No messages yet.</p>
            </div>
          )}
        </div>

        {/* Reply form */}
        <div className="card p-4">
          <h3 className="text-sm font-display font-semibold text-ink mb-3">
            {isInternalNote ? 'Add Internal Note' : 'Reply'}
          </h3>
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder={isInternalNote ? 'Write an internal note...' : 'Write a reply...'}
            className="input-field w-full h-28 resize-none"
            maxLength={5000}
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-stone cursor-pointer">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="rounded-sm border-border"
              />
              Internal note (not visible to customer)
            </label>
            <button
              type="button"
              onClick={() => void sendReply()}
              disabled={sending || !replyBody.trim()}
              className="btn-primary text-sm h-9 px-4"
            >
              {sending ? 'Sending...' : isInternalNote ? 'Add Note' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>

      {/* Right column: Metadata + Actions */}
      <div className="space-y-4">
        {/* Ticket info */}
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-display font-semibold text-ink">Details</h3>
          <div>
            <p className="text-xs text-stone">Requester</p>
            <p className="text-sm font-medium text-ink">{ticket.requester_name}</p>
            <p className="text-xs text-stone">{ticket.requester_email}</p>
          </div>
          {ticket.account_id && (
            <div>
              <p className="text-xs text-stone">Linked Account</p>
              <Link
                href={`/admin/accounts/${ticket.account_id}`}
                className="text-sm text-signal hover:underline"
              >
                View Account
              </Link>
            </div>
          )}
          <div>
            <p className="text-xs text-stone">Created</p>
            <p className="text-sm text-ink">{new Date(ticket.created_at).toLocaleString()}</p>
          </div>
          {ticket.resolved_at && (
            <div>
              <p className="text-xs text-stone">Resolved</p>
              <p className="text-sm text-ink">{new Date(ticket.resolved_at).toLocaleString()}</p>
            </div>
          )}
          {ticket.assigned_to && (
            <div>
              <p className="text-xs text-stone">Assigned To</p>
              <p className="text-sm text-ink">{ticket.assigned_to}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-display font-semibold text-ink">Actions</h3>

          <div>
            <label htmlFor="ticket-status" className="text-xs text-stone block mb-1">Status</label>
            <select
              id="ticket-status"
              value={ticket.status}
              onChange={(e) => void updateTicket({ status: e.target.value })}
              disabled={updating}
              className="input-field h-9 w-full text-sm"
            >
              {TICKET_STATUSES.map((s: LabelValue) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ticket-priority" className="text-xs text-stone block mb-1">Priority</label>
            <select
              id="ticket-priority"
              value={ticket.priority}
              onChange={(e) => void updateTicket({ priority: e.target.value })}
              disabled={updating}
              className="input-field h-9 w-full text-sm"
            >
              {TICKET_PRIORITIES.map((p: LabelValue) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ticket-category" className="text-xs text-stone block mb-1">Category</label>
            <select
              id="ticket-category"
              value={ticket.category}
              onChange={(e) => void updateTicket({ category: e.target.value })}
              disabled={updating}
              className="input-field h-9 w-full text-sm"
            >
              {TICKET_CATEGORIES.map((c: LabelValue) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => void updateTicket({ assigned_to: adminEmail })}
            disabled={updating}
            className="btn-ghost text-sm h-9 w-full"
          >
            Assign to Me
          </button>
        </div>

        {/* Status badges */}
        <div className="card p-4 space-y-2">
          <h3 className="text-sm font-display font-semibold text-ink">Current State</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${STATUS_COLORS[ticket.status] ?? ''}`}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-pill font-medium bg-surface-alt text-stone">
              {TICKET_CATEGORIES.find((c: LabelValue) => c.value === ticket.category)?.label ?? ticket.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
