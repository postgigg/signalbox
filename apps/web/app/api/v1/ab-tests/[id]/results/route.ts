import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateSignificance } from '@/lib/ab-testing';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: member } = await supabase
    .from('members')
    .select('account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const admin = createAdminClient();

  // Verify test belongs to account
  const { data: test } = await admin
    .from('ab_tests')
    .select('id, name, status, traffic_split, target_step_id, variant_b_question, started_at')
    .eq('id', id)
    .eq('account_id', member.account_id)
    .single();

  if (!test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  // Fetch aggregated results
  const { data: results } = await admin
    .from('ab_test_results')
    .select('variant, impressions, completions, submissions, total_score, hot_count, warm_count, cold_count, date')
    .eq('ab_test_id', id)
    .order('date', { ascending: true });

  // Aggregate by variant
  const variantA = { impressions: 0, submissions: 0, totalScore: 0, hotCount: 0, warmCount: 0, coldCount: 0 };
  const variantB = { impressions: 0, submissions: 0, totalScore: 0, hotCount: 0, warmCount: 0, coldCount: 0 };

  const dailyA: Array<{ date: string; impressions: number; submissions: number }> = [];
  const dailyB: Array<{ date: string; impressions: number; submissions: number }> = [];

  for (const row of results ?? []) {
    const target = row.variant === 'a' ? variantA : variantB;
    const daily = row.variant === 'a' ? dailyA : dailyB;

    target.impressions += row.impressions;
    target.submissions += row.submissions;
    target.totalScore += row.total_score;
    target.hotCount += row.hot_count;
    target.warmCount += row.warm_count;
    target.coldCount += row.cold_count;

    daily.push({
      date: row.date,
      impressions: row.impressions,
      submissions: row.submissions,
    });
  }

  const significance = calculateSignificance(variantA, variantB);

  return NextResponse.json({
    test: {
      id: test.id,
      name: test.name,
      status: test.status,
      trafficSplit: test.traffic_split,
      targetStepId: test.target_step_id,
      variantBQuestion: test.variant_b_question,
      startedAt: test.started_at,
    },
    variantA: {
      impressions: variantA.impressions,
      submissions: variantA.submissions,
      conversionRate: significance.conversionRateA,
      avgScore: significance.avgScoreA,
      hotCount: variantA.hotCount,
      warmCount: variantA.warmCount,
      coldCount: variantA.coldCount,
      daily: dailyA,
    },
    variantB: {
      impressions: variantB.impressions,
      submissions: variantB.submissions,
      conversionRate: significance.conversionRateB,
      avgScore: significance.avgScoreB,
      hotCount: variantB.hotCount,
      warmCount: variantB.warmCount,
      coldCount: variantB.coldCount,
      daily: dailyB,
    },
    significance: {
      zScore: significance.zScore,
      pValue: significance.pValue,
      significant: significance.significant,
      winner: significance.winner,
      enoughData: significance.enoughData,
    },
  });
}
