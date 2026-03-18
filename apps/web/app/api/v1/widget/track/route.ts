import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createAdminClient } from '@/lib/supabase/admin';
import { corsJson, corsOptions } from '@/lib/cors';
import { getClientIp } from '@/lib/ip';
import { configLimit, checkRateLimit } from '@/lib/rate-limit';

const trackSchema = z.object({
  widgetKey: z.string().min(1).max(48),
  event: z.enum(['impression', 'open', 'step_view', 'completion']),
  stepIndex: z.number().int().min(0).max(4).optional(),
}).strict();

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptions();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);

  const rl = await checkRateLimit(configLimit(), `track:${ip}`);
  if (!rl.success) {
    return corsJson({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson({ error: 'Invalid payload' }, { status: 400 });
  }

  const { widgetKey, event, stepIndex } = parsed.data;
  const admin = createAdminClient();

  const { data: widget } = await admin
    .from('widgets')
    .select('id, account_id, is_active')
    .eq('widget_key', widgetKey)
    .single();

  if (!widget || !widget.is_active) {
    return corsJson({ ok: true }, { status: 200 });
  }

  const today = new Date().toISOString().split('T')[0]!;

  const { data: existing } = await admin
    .from('widget_analytics')
    .select('id, impressions, opens, completions, step_1_views, step_2_views, step_3_views, step_4_views, step_5_views')
    .eq('widget_id', widget.id)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    const updates: Record<string, number> = {};

    switch (event) {
      case 'impression':
        updates.impressions = existing.impressions + 1;
        break;
      case 'open':
        updates.opens = existing.opens + 1;
        break;
      case 'completion':
        updates.completions = existing.completions + 1;
        break;
      case 'step_view': {
        const stepNum = (stepIndex ?? 0) + 1;
        const colName = `step_${String(stepNum)}_views`;
        if (stepNum >= 1 && stepNum <= 5) {
          const current = existing[colName as 'step_1_views' | 'step_2_views' | 'step_3_views' | 'step_4_views' | 'step_5_views'];
          updates[colName] = (current ?? 0) + 1;
        }
        break;
      }
    }

    if (Object.keys(updates).length > 0) {
      await admin
        .from('widget_analytics')
        .update(updates)
        .eq('id', existing.id);
    }
  } else {
    const row: Record<string, unknown> = {
      widget_id: widget.id,
      account_id: widget.account_id,
      date: today,
      impressions: event === 'impression' ? 1 : 0,
      opens: event === 'open' ? 1 : 0,
      completions: event === 'completion' ? 1 : 0,
    };

    if (event === 'step_view') {
      const stepNum = (stepIndex ?? 0) + 1;
      if (stepNum >= 1 && stepNum <= 5) {
        row[`step_${String(stepNum)}_views`] = 1;
      }
    }

    await admin.from('widget_analytics').insert(row);
  }

  return corsJson({ ok: true }, { status: 200 });
}
