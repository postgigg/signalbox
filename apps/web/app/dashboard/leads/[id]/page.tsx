import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { CopyButton } from './CopyButton';
import { LeadSidebar } from './LeadSidebar';

import type { Submission } from '@/lib/supabase/types';

interface AnswerEntry {
  readonly stepId: string;
  readonly optionId: string;
  readonly question: string;
  readonly label: string;
  readonly scoreWeight: number;
}

interface LeadDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

function TierBadge({ tier }: { readonly tier: string }): React.ReactElement {
  const classes: Record<string, string> = {
    hot: 'badge-hot',
    warm: 'badge-warm',
    cold: 'badge-cold',
  };
  return (
    <span className={classes[tier] ?? 'badge-cold'}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}


export default async function LeadDetailPage({ params }: LeadDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lead) {
    notFound();
  }

  const submission = lead as Submission;
  const rawAnswers: unknown[] = Array.isArray(submission.answers) ? submission.answers : [];
  const answers: AnswerEntry[] = rawAnswers.filter(
    (a): a is AnswerEntry =>
      typeof a === 'object' &&
      a !== null &&
      'stepId' in a &&
      'label' in a &&
      'scoreWeight' in a
  );

  const firstName = submission.visitor_name.split(' ')[0] ?? submission.visitor_name;
  const firstAnswer = answers[0];
  const secondAnswer = answers[1];
  const suggestedOpener = firstAnswer && secondAnswer
    ? `Hi ${firstName}, thanks for reaching out about ${firstAnswer.label} with a ${secondAnswer.label} timeline. Here is what I would suggest as a next step...`
    : `Hi ${firstName}, thanks for reaching out. Here is what I would suggest as a next step...`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/leads" className="text-sm text-stone hover:text-ink transition-colors duration-fast">
          Leads
        </Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">{submission.visitor_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink">
                  {submission.visitor_name}
                </h1>
                <p className="mt-1 text-sm text-stone">{submission.visitor_email}</p>
                {submission.visitor_phone && (
                  <p className="text-sm text-stone">{submission.visitor_phone}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-mono text-2xl font-semibold text-ink">
                    {submission.lead_score}
                  </span>
                  <span className="text-xs text-stone ml-1">/100</span>
                </div>
                <TierBadge tier={submission.lead_tier} />
              </div>
            </div>
          </div>

          {/* Qualifying Answers */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Qualifying Answers
            </h2>
            {answers.length === 0 ? (
              <p className="text-sm text-stone">No answer data available.</p>
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <div key={answer.stepId} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-xs text-stone font-body">{answer.question}</p>
                      <p className="mt-0.5 text-sm text-ink font-medium">{answer.label}</p>
                    </div>
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-sm ${
                        answer.scoreWeight > 0
                          ? 'bg-success-light text-success'
                          : answer.scoreWeight < 0
                            ? 'bg-danger-light text-danger'
                            : 'bg-surface-alt text-stone'
                      }`}
                    >
                      {answer.scoreWeight > 0 ? '+' : ''}{answer.scoreWeight}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Opener */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-3">
              Suggested Opener
            </h2>
            <div className="bg-surface-alt rounded-sm p-4">
              <p className="text-sm text-ink leading-relaxed">{suggestedOpener}</p>
            </div>
            <CopyButton text={suggestedOpener} />
          </div>

          {/* Visitor Message */}
          {submission.visitor_message && (
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-ink mb-3">
                Message
              </h2>
              <p className="text-sm text-stone leading-relaxed">
                {submission.visitor_message}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LeadSidebar
            leadId={submission.id}
            initialStatus={submission.status}
            initialNotes={submission.notes}
            initialTags={(submission as unknown as { tags?: string[] }).tags ?? []}
          />

          {/* Metadata */}
          <div className="card">
            <h3 className="text-xs font-medium text-stone uppercase tracking-wide mb-3">
              Details
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Source</dt>
                <dd className="text-ink font-medium truncate ml-2">
                  {submission.source_url ?? 'Direct'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone">Device</dt>
                <dd className="text-ink font-medium">{submission.device_type ?? 'Unknown'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone">Country</dt>
                <dd className="text-ink font-medium">{submission.country ?? 'Unknown'}</dd>
              </div>
              {submission.utm_source && (
                <div className="flex justify-between">
                  <dt className="text-stone">UTM Source</dt>
                  <dd className="text-ink font-medium">{submission.utm_source}</dd>
                </div>
              )}
              {submission.utm_medium && (
                <div className="flex justify-between">
                  <dt className="text-stone">UTM Medium</dt>
                  <dd className="text-ink font-medium">{submission.utm_medium}</dd>
                </div>
              )}
              {submission.utm_campaign && (
                <div className="flex justify-between">
                  <dt className="text-stone">UTM Campaign</dt>
                  <dd className="text-ink font-medium">{submission.utm_campaign}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">Submitted</dt>
                <dd className="text-ink font-medium">
                  {new Date(submission.created_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
