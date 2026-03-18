import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { configLimit, checkRateLimit } from '@/lib/rate-limit';
import { corsJson, corsOptions } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
): Promise<NextResponse> {
  const { key } = await params;

  // Rate limit by widget key
  const rl = await checkRateLimit(configLimit(), key);
  if (!rl.success) {
    return corsJson(
      { error: 'Rate limit exceeded' },
      { status: 429 },
    );
  }

  const admin = createAdminClient();

  // Fetch widget with its active flow
  const { data: widget, error: widgetError } = await admin
    .from('widgets')
    .select('*')
    .eq('widget_key', key)
    .single();

  if (widgetError || !widget) {
    return corsJson({ error: 'Widget not found' }, { status: 404 });
  }

  if (!widget.is_active) {
    return corsJson({ error: 'Widget is no longer active' }, { status: 410 });
  }

  // Check account status
  const { data: account, error: accountError } = await admin
    .from('accounts')
    .select('is_suspended, subscription_status, trial_ends_at')
    .eq('id', widget.account_id)
    .single();

  if (accountError || !account) {
    return corsJson({ error: 'Account not found' }, { status: 404 });
  }

  if (account.is_suspended) {
    return corsJson({ error: 'Account suspended' }, { status: 402 });
  }

  const isCanceled = account.subscription_status === 'canceled';
  const isUnpaid = account.subscription_status === 'unpaid';
  const isTrialExpired =
    account.subscription_status === 'trialing' &&
    account.trial_ends_at !== null &&
    new Date(account.trial_ends_at) < new Date();

  if (isCanceled || isUnpaid || isTrialExpired) {
    return corsJson(
      { error: 'Subscription inactive' },
      { status: 402 },
    );
  }

  // Fetch active flow
  const { data: flow } = await admin
    .from('flows')
    .select('version, steps')
    .eq('widget_id', widget.id)
    .eq('is_active', true)
    .single();

  const response = corsJson({
    theme: widget.theme,
    steps: flow?.steps ?? [],
    flowVersion: flow?.version ?? 0,
    confirmation: widget.confirmation,
    contact: {
      showPhone: widget.contact_show_phone ?? false,
      phoneRequired: widget.contact_phone_required ?? false,
      showMessage: widget.contact_show_message ?? false,
      messageRequired: widget.contact_message_required ?? false,
      messagePlaceholder: widget.contact_message_placeholder ?? '',
      submitText: widget.contact_submit_text ?? 'Submit',
    },
    socialProof: {
      text: widget.social_proof_text,
      min: widget.social_proof_min,
    },
  });

  response.headers.set('Cache-Control', 'public, max-age=60');

  return response;
}
