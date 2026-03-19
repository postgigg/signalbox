import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateRequest, requireRole } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limits';
import type { Json } from '@/lib/supabase/types';

export const runtime = 'nodejs';

const themeSchema = z.object({
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.number().min(0).max(32).optional(),
  fontFamily: z.string().optional(),
}).strict();

const confirmationSchema = z.object({
  title: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
  showScore: z.boolean().optional(),
}).strict();

const patchWidgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domain: z.string().max(253).nullable().optional(),
  theme: themeSchema.optional(),
  confirmation: confirmationSchema.optional(),
  social_proof_text: z.string().max(200).nullable().optional(),
  social_proof_min: z.number().int().min(0).nullable().optional(),
  contact_show_phone: z.boolean().optional(),
  contact_phone_required: z.boolean().optional(),
  contact_show_message: z.boolean().optional(),
  contact_message_required: z.boolean().optional(),
  contact_message_placeholder: z.string().max(500).nullable().optional(),
  contact_submit_text: z.string().max(100).nullable().optional(),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { account } = authResult.ctx;

  const admin = createAdminClient();

  const { data: widget, error } = await admin
    .from('widgets')
    .select('*')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (error || !widget) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  // Fetch stats summary
  const { data: analytics } = await admin
    .from('widget_analytics')
    .select('impressions, opens, completions, submissions, hot_count, warm_count, cold_count, avg_score')
    .eq('widget_id', id)
    .order('date', { ascending: false })
    .limit(30);

  const stats = {
    totalImpressions: 0,
    totalOpens: 0,
    totalCompletions: 0,
    totalSubmissions: widget.submission_count,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
  };

  if (analytics) {
    for (const row of analytics) {
      stats.totalImpressions += row.impressions;
      stats.totalOpens += row.opens;
      stats.totalCompletions += row.completions;
      stats.hotLeads += row.hot_count;
      stats.warmLeads += row.warm_count;
      stats.coldLeads += row.cold_count;
    }
  }

  return NextResponse.json({ data: { ...widget, stats } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchWidgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Validate branding toggle against plan
  if (parsed.data.theme !== undefined) {
    const themeObj = parsed.data.theme as Record<string, unknown>;
    if (themeObj['showBranding'] === false) {
      const planLimits = getPlanLimits(account.plan);
      if (!planLimits.customBranding) {
        return NextResponse.json(
          { error: 'Removing branding is not available on your current plan' },
          { status: 403 },
        );
      }
    }
  }

  const admin = createAdminClient();

  // Verify widget belongs to account
  const { data: existing, error: fetchError } = await admin
    .from('widgets')
    .select('id')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.name !== undefined) updates['name'] = parsed.data.name;
  if (parsed.data.domain !== undefined) updates['domain'] = parsed.data.domain;
  if (parsed.data.theme !== undefined) updates['theme'] = parsed.data.theme as Json;
  if (parsed.data.confirmation !== undefined) updates['confirmation'] = parsed.data.confirmation as Json;
  if (parsed.data.social_proof_text !== undefined) updates['social_proof_text'] = parsed.data.social_proof_text;
  if (parsed.data.social_proof_min !== undefined) updates['social_proof_min'] = parsed.data.social_proof_min;
  if (parsed.data.contact_show_phone !== undefined) updates['contact_show_phone'] = parsed.data.contact_show_phone;
  if (parsed.data.contact_phone_required !== undefined) updates['contact_phone_required'] = parsed.data.contact_phone_required;
  if (parsed.data.contact_show_message !== undefined) updates['contact_show_message'] = parsed.data.contact_show_message;
  if (parsed.data.contact_message_required !== undefined) updates['contact_message_required'] = parsed.data.contact_message_required;
  if (parsed.data.contact_message_placeholder !== undefined) updates['contact_message_placeholder'] = parsed.data.contact_message_placeholder;
  if (parsed.data.contact_submit_text !== undefined) updates['contact_submit_text'] = parsed.data.contact_submit_text;

  const { data: updated, error: updateError } = await admin
    .from('widgets')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: 'Failed to update widget' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const authResult = await authenticateRequest(request);
  if ('error' in authResult) return authResult.error;
  const { member, account } = authResult.ctx;

  const roleError = requireRole(member, ['owner', 'admin']);
  if (roleError) return roleError;

  const admin = createAdminClient();

  // Verify widget belongs to account
  const { data: existing, error: fetchError } = await admin
    .from('widgets')
    .select('id, is_active')
    .eq('id', id)
    .eq('account_id', account.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }

  if (!existing.is_active) {
    return NextResponse.json(
      { error: 'Widget is already deactivated' },
      { status: 409 },
    );
  }

  // Soft delete: deactivate widget
  const { error: updateError } = await admin
    .from('widgets')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to deactivate widget' },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: 'Widget deactivated' });
}
