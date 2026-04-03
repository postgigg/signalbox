import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { CopyButton } from './CopyButton';
import { LeadSidebar } from './LeadSidebar';
import { ScoreBreakdown } from './ScoreBreakdown';
import { ReplyComposer } from './ReplyComposer';

import type { Submission } from '@/lib/supabase/types';

interface AnswerEntry {
  readonly stepId: string;
  readonly optionId: string;
  readonly question: string;
  readonly label: string;
  readonly scoreWeight: number;
}

interface ScoreHistoryRow {
  readonly id: string;
  readonly previous_score: number;
  readonly new_score: number;
  readonly previous_tier: string;
  readonly new_tier: string;
  readonly change_reason: string;
  readonly created_at: string;
}

interface BehavioralInsightsData {
  readonly pagesViewed: number;
  readonly timeOnSiteSeconds: number;
  readonly sessionNumber: number;
  readonly maxScrollDepth: number;
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

  // Fetch score history for this lead
  const { data: scoreHistoryData } = await supabase
    .from('score_history')
    .select('id, previous_score, new_score, previous_tier, new_tier, change_reason, created_at')
    .eq('submission_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  const scoreHistory: ScoreHistoryRow[] = (scoreHistoryData as ScoreHistoryRow[] | null) ?? [];

  // Fetch linked submissions (same email, different records)
  const { data: linkedSubmissions } = await supabase
    .from('submissions')
    .select('id, visitor_name, lead_score, lead_tier, created_at')
    .eq('account_id', submission.account_id)
    .eq('visitor_email', submission.visitor_email)
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch behavioral insights from visitor_sessions
  let behavioralInsights: BehavioralInsightsData | null = null;
  const { data: visitorSession } = await supabase
    .from('visitor_sessions')
    .select('pages_viewed, time_on_site_seconds, session_number, max_scroll_depth')
    .eq('submission_id', id)
    .limit(1)
    .maybeSingle();

  if (visitorSession) {
    const vs = visitorSession as { pages_viewed: number; time_on_site_seconds: number; session_number: number; max_scroll_depth: number };
    behavioralInsights = {
      pagesViewed: vs.pages_viewed,
      timeOnSiteSeconds: vs.time_on_site_seconds,
      sessionNumber: vs.session_number,
      maxScrollDepth: vs.max_scroll_depth,
    };
  }

  const hasScoreBreakdown = submission.form_score !== undefined
    || submission.behavioral_score !== undefined;

  const rawAnswers: unknown[] = Array.isArray(submission.answers) ? submission.answers : [];
  const answers: AnswerEntry[] = rawAnswers.filter(
    (a): a is AnswerEntry =>
      typeof a === 'object' &&
      a !== null &&
      'stepId' in a &&
      'label' in a &&
      'scoreWeight' in a
  );

  // Fetch account name for reply composer
  const { data: accountData } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', submission.account_id)
    .single();

  const accountName = accountData?.name ?? '';

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

          {/* Score Breakdown */}
          {hasScoreBreakdown && (
            <ScoreBreakdown
              formScore={submission.form_score}
              engagementScore={submission.behavioral_score}
              decayPenalty={submission.decay_penalty}
              behavioralInsights={behavioralInsights}
              scoreHistory={scoreHistory}
            />
          )}

          {/* Suggested Opener */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-3">
              Suggested Opener
            </h2>
            <div className="bg-surface-alt rounded-sm p-4">
              <p className="text-sm text-ink leading-relaxed">{suggestedOpener}</p>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={suggestedOpener} />
              <ReplyComposer
                leadId={submission.id}
                visitorName={submission.visitor_name}
                accountName={accountName}
                suggestedOpener={suggestedOpener}
              />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="card">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              History
            </h2>
            <div className="relative pl-6 space-y-4">
              {/* Timeline line */}
              <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />

              {/* Submitted */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-pill bg-signal flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm text-ink font-medium">Submitted</p>
                <p className="text-xs text-stone">{new Date(submission.created_at).toLocaleString()}</p>
                <p className="text-xs text-stone mt-0.5">
                  Scored {submission.lead_score}/100, tier: {submission.lead_tier}
                </p>
              </div>

              {/* Notification sent */}
              {submission.notification_sent && submission.notification_sent_at && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-pill bg-surface-alt border border-border flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink font-medium">Notification sent</p>
                  <p className="text-xs text-stone">{new Date(submission.notification_sent_at).toLocaleString()}</p>
                </div>
              )}

              {/* Viewed */}
              {submission.viewed_at && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-pill bg-surface-alt border border-border flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink font-medium">Viewed</p>
                  <p className="text-xs text-stone">{new Date(submission.viewed_at).toLocaleString()}</p>
                </div>
              )}

              {/* Contacted */}
              {submission.contacted_at && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-pill bg-warning-light border border-warning/30 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink font-medium">Contacted</p>
                  <p className="text-xs text-stone">{new Date(submission.contacted_at).toLocaleString()}</p>
                </div>
              )}

              {/* Current status */}
              {submission.status !== 'new' && submission.status !== 'viewed' && (
                <div className="relative">
                  <div className={`absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-pill flex items-center justify-center ${
                    submission.status === 'converted' ? 'bg-success-light border border-success/30' :
                    submission.status === 'qualified' ? 'bg-success-light border border-success/30' :
                    submission.status === 'disqualified' ? 'bg-danger-light border border-danger/30' :
                    'bg-surface-alt border border-border'
                  }`}>
                    <svg className={`w-2.5 h-2.5 ${
                      submission.status === 'converted' || submission.status === 'qualified' ? 'text-success' :
                      submission.status === 'disqualified' ? 'text-danger' : 'text-stone'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink font-medium">
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </p>
                  <p className="text-xs text-stone">{new Date(submission.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
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

          {/* Previous Submissions */}
          {linkedSubmissions && linkedSubmissions.length > 0 && (
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">
                Previous Submissions
              </h2>
              <p className="text-xs text-stone mb-3">
                This visitor has submitted {linkedSubmissions.length} other {linkedSubmissions.length === 1 ? 'time' : 'times'}.
              </p>
              <div className="space-y-2">
                {linkedSubmissions.map((linked) => (
                  <Link
                    key={linked.id}
                    href={`/dashboard/leads/${linked.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-sm border border-border hover:bg-surface-alt transition-colors duration-fast"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-ink">{linked.visitor_name}</span>
                      <TierBadge tier={linked.lead_tier} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-stone">{linked.lead_score}</span>
                      <span className="text-xs text-stone">{new Date(linked.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
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
