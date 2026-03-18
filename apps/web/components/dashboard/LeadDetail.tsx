'use client';

import React, { useState } from 'react';
import { SlideOver } from '@/components/ui/SlideOver';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type LeadStatus =
  | 'new'
  | 'viewed'
  | 'contacted'
  | 'qualified'
  | 'disqualified'
  | 'converted'
  | 'archived';

export interface LeadAnswer {
  question: string;
  answer: string;
  points: number;
}

export interface LeadDetailData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  status: LeadStatus;
  answers: LeadAnswer[];
  suggestedOpener?: string;
  notes: string;
  createdAt: string;
  ip?: string;
  userAgent?: string;
}

export interface LeadDetailProps {
  open: boolean;
  onClose: () => void;
  lead: LeadDetailData | null;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onNotesChange: (leadId: string, notes: string) => void;
  onArchive: (leadId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusOptions: SelectOption[] = [
  { label: 'New', value: 'new' },
  { label: 'Viewed', value: 'viewed' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Disqualified', value: 'disqualified' },
  { label: 'Converted', value: 'converted' },
  { label: 'Archived', value: 'archived' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs font-medium text-signal hover:text-signal-hover transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 rounded-sm px-1.5 py-0.5"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="5" y="5" width="9" height="9" rx="1" />
            <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeadDetail({
  open,
  onClose,
  lead,
  onStatusChange,
  onNotesChange,
  onArchive,
}: LeadDetailProps) {
  if (!lead) return null;

  const tierVariant = lead.tier as BadgeVariant;
  const statusVariant = lead.status as BadgeVariant;

  return (
    <SlideOver open={open} onClose={onClose} title="Lead Details">
      <div className="space-y-6">
        {/* Contact info */}
        <section>
          <h3 className="font-display text-lg font-semibold text-ink">{lead.name}</h3>
          <div className="mt-1 space-y-0.5">
            <p className="text-sm font-body text-stone">{lead.email}</p>
            {lead.phone && <p className="text-sm font-body text-stone">{lead.phone}</p>}
          </div>
        </section>

        {/* Score */}
        <section className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-surface-alt">
            <span className="font-mono text-xl font-bold text-ink">{lead.score}</span>
          </div>
          <div>
            <Badge variant={tierVariant}>
              {lead.tier.charAt(0).toUpperCase() + lead.tier.slice(1)}
            </Badge>
            <p className="text-xs text-stone mt-0.5">Lead score</p>
          </div>
        </section>

        {/* Status */}
        <section>
          <Select
            label="Status"
            name="lead-status"
            options={statusOptions}
            value={lead.status}
            onChange={(e) =>
              onStatusChange(lead.id, e.target.value as LeadStatus)
            }
          />
          <div className="mt-2">
            <Badge variant={statusVariant}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
          </div>
        </section>

        {/* Answers */}
        {lead.answers.length > 0 && (
          <section>
            <h4 className="text-sm font-body font-medium text-ink mb-3">Responses</h4>
            <div className="space-y-3">
              {lead.answers.map((answer, i) => (
                <div key={i} className="bg-surface-alt rounded-sm p-3">
                  <p className="text-xs font-body text-stone">{answer.question}</p>
                  <p className="text-sm font-body text-ink mt-1">{answer.answer}</p>
                  <span className="inline-block mt-1 text-xs font-mono text-signal">
                    +{answer.points} pts
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Suggested opener */}
        {lead.suggestedOpener && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-body font-medium text-ink">Suggested Opener</h4>
              <CopyButton text={lead.suggestedOpener} />
            </div>
            <div className="bg-signal-light border border-signal/20 rounded-sm p-3">
              <p className="text-sm font-body text-ink italic">
                &ldquo;{lead.suggestedOpener}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* Notes */}
        <section>
          <Textarea
            label="Notes"
            name="lead-notes"
            value={lead.notes}
            onChange={(e) => onNotesChange(lead.id, e.target.value)}
            placeholder="Add internal notes about this lead..."
          />
        </section>

        {/* Metadata */}
        <section>
          <h4 className="text-sm font-body font-medium text-ink mb-2">Metadata</h4>
          <div className="space-y-1 text-xs font-body text-stone">
            <p>
              <span className="font-medium text-ink">Created:</span>{' '}
              {new Date(lead.createdAt).toLocaleString()}
            </p>
            {lead.ip && (
              <p>
                <span className="font-medium text-ink">IP:</span> {lead.ip}
              </p>
            )}
            {lead.userAgent && (
              <p>
                <span className="font-medium text-ink">Device:</span> {lead.userAgent}
              </p>
            )}
          </div>
        </section>

        {/* Archive */}
        <section className="pt-4 border-t border-border">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onArchive(lead.id)}
          >
            Archive Lead
          </Button>
        </section>
      </div>
    </SlideOver>
  );
}
