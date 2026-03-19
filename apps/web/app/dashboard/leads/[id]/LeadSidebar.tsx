'use client';

import { useState, useCallback } from 'react';

import type { FormEvent, KeyboardEvent } from 'react';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'disqualified', label: 'Disqualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'archived', label: 'Archived' },
] as const;

interface LeadSidebarProps {
  readonly leadId: string;
  readonly initialStatus: string;
  readonly initialNotes: string | null;
  readonly initialTags: string[];
}

interface PatchResponse {
  data?: { status: string; notes: string | null; tags: string[] };
  error?: string;
}

export function LeadSidebar({ leadId, initialStatus, initialNotes, initialTags }: LeadSidebarProps): React.ReactElement {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveField = useCallback(async (updates: Record<string, unknown>): Promise<void> => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/v1/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const result = await res.json() as PatchResponse;
        if (result.data) {
          setStatus(result.data.status);
          if (result.data.tags) setTags(result.data.tags);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Save error
    } finally {
      setSaving(false);
    }
  }, [leadId]);

  function handleStatusChange(newStatus: string): void {
    setStatus(newStatus);
    void saveField({ status: newStatus });
  }

  function handleNotesSave(e: FormEvent): void {
    e.preventDefault();
    void saveField({ notes: notes.trim() });
  }

  function handleAddTag(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!tag || tags.includes(tag)) {
      setTagInput('');
      return;
    }
    const newTags = [...tags, tag];
    setTags(newTags);
    setTagInput('');
    void saveField({ tags: newTags });
  }

  function handleRemoveTag(tag: string): void {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    void saveField({ tags: newTags });
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="card">
        <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Status</h3>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={saving}
          className="input-field h-9 w-full text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="card">
        <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Tags</h3>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-pill bg-signal-light text-signal font-medium">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-signal/60 hover:text-signal transition-colors duration-fast"
                aria-label={`Remove tag ${tag}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {tags.length === 0 && <span className="text-xs text-stone">No tags yet</span>}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type tag and press Enter"
          className="input-field h-8 text-xs w-full"
          maxLength={50}
        />
      </div>

      {/* Notes */}
      <div className="card">
        <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">Internal Notes</h3>
        <form onSubmit={handleNotesSave}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this lead..."
            className="input-field w-full h-24 resize-none text-sm"
            maxLength={5000}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="btn-secondary text-xs h-8 px-3"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
            {saved && <span className="text-xs text-success">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
